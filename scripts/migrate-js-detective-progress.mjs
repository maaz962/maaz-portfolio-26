/* ==========================================================================
   migrate-js-detective-progress.mjs — one-time fix for scrambled js-detective
   progress caused by index-keyed storage + an unpatchable version check.
   ==========================================================================
   Root cause
   ----------
   js-detective persisted completed/solutions/current_level keyed by 0-based
   level INDEX. When the level set was restructured (v1 -> v2: four Beginner
   cases inserted at the front, the sole Hard case removed), the client shipped
   a one-way index remap (migrateLegacyIndex) guarded by `Number(saved.version)
   !== DATA_VERSION`. Because `version` was NEVER stored in the DB, the guard
   was always true, so the remap ran again on EVERY resume — even on already
   re-mapped 18-level saves — permanently misaligning, and dropping, cases.

   This script rewrites every js-detective row ONCE into the v3 format:
     - completed / solutions keyed by stable 1-based level id (1..18)
     - current_level stored as the level id
     - version = 3   (persisted now, so future clients never re-remap)
   Legacy index keys are first converted (v1 15/16-level layouts via the same
   index map, v2 18-level saves un-shifted by undoing the accidental remap in
   rounds — the output always converges on the tier-gating invariants from the
   level definitions), then mapped index+1 -> id. Scores are recomputed from
   the repaired completed set using the by-id XP table, and every affected
   user's gamification.total_xp is refreshed.

   Assumption: today's js-detective layout has 18 sequential ids 1..18 (id =
   v2 index + 1). That is precisely the data shape this script targets; the
   v3 engine handles future reorders losslessly by id.

   Backend selection mirrors src/lib/pg-connection.ts:
     - POSTGRES_URL / DATABASE_URL / POSTGRES_URL_NON_POOLING set -> Postgres
     - otherwise the file store (src/data/blog-db.json)

   Usage: node scripts/migrate-js-detective-progress.mjs
   Options:
     --dry-run   report what would change without writing anything
     --selftest  run the index->id reconciliation against fixtures, no DB
   ========================================================================== */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");
const SELFTEST = process.argv.includes("--selftest");

const GAME_SLUG = "js-detective";
const LEVEL_COUNT = 18;

// Mirror of GAME_LEVEL_POINTS_BY_ID (src/lib/gamification.ts) for js-detective.
const POINTS_BY_ID = Object.fromEntries(
  [
    2, 2, 2, 2, // beginner 1-4
    5, 5, 5, 5, // easy 5-8
    6, 6, 6, 6, 6, 6, 6, // intermediate 9-15
    10, 10, 10, // most hard 16-18
  ].map((p, i) => [i + 1, p])
);

// --- Legacy index reconciliation (mirrors public/games/js-detective/game.js) --

// The removed Hard case (old index 11) maps to -1; other v1 indices shift.
function migrateLegacyIndex(oldIndex) {
  if (oldIndex === 11) return -1;
  if (oldIndex >= 0 && oldIndex <= 10) return oldIndex + 4;
  if (oldIndex >= 12 && oldIndex <= 14) return oldIndex + 3;
  return oldIndex;
}

// v1->v2 index mapping, plus the final boss dropped when the 16-level layout
// shed its last mostHard case (old index 15).
function v1ToV2Index(oldIndex, totalLevels) {
  if (totalLevels === 16 && oldIndex === 15) return -1;
  return migrateLegacyIndex(oldIndex);
}

function sortUniqueNums(arr) {
  const seen = {};
  const out = [];
  for (const n of arr) {
    if (!seen[n]) {
      seen[n] = true;
      out.push(n);
    }
  }
  return out.sort((a, b) => a - b);
}

// Tier-gating invariants: a clean save can never show a later tier solved
// without nearly all of the previous one. Accidental repeat remaps violate
// these; pristine sets always satisfy them.
function plausibleIndexSet(idx) {
  if (idx.length === 0) return true;
  const max = idx[idx.length - 1];
  let c0 = 0;
  let c1 = 0;
  let c2 = 0;
  for (const k of idx) {
    if (k <= 3) c0++;
    else if (k <= 7) c1++;
    else if (k <= 14) c2++;
  }
  if (max <= 3) return true;
  if (max <= 7) return c0 >= 3;
  if (max <= 14) return c0 >= 3 && c1 >= 3;
  return c0 >= 3 && c1 >= 3 && c2 >= 6;
}

// Inverse of one legacy remap pass on its own output range (v2 indices).
function invertLegacyIndex(index) {
  if (index >= 4 && index <= 14) return index - 4;
  if (index >= 15 && index <= 17) return index - 3;
  return -1;
}

/**
 * Classify a stored completed map. `verifiedVersion` is the row's persisted
 * version (only the v3 client stores one); legacy rows are never stamped, so
 * total_levels and key shape must disambiguate:
 *   - total_levels 1..16 -> v1 index layout (id-keying didn't exist yet)
 *   - version === 3      -> v3 id keys (trust the client that wrote them)
 *   - otherwise          -> id keys only if they could be a genuine clean
 *                           save under tier gating; else v2 index keys that
 *                           need to be un-shifted.
 */
function detectForm(completed, totalLevels, verifiedVersion) {
  const keys = Object.keys(completed ?? {});
  if (keys.length === 0) return "empty";
  let hasZero = false;
  let bad = false;
  for (const key of keys) {
    const k = Number(key);
    if (!Number.isInteger(k)) {
      bad = true;
      continue;
    }
    if (k === 0) hasZero = true;
    if (k < 1 || k > LEVEL_COUNT) bad = true;
  }
  const tl = Math.floor(Number(totalLevels)) || 0;
  if (Number(verifiedVersion) === 3) return "id";
  if (tl >= 1 && tl <= 16) return "v1-index";
  if (hasZero || bad) return "v2-index";
  // Ambiguous (no persisted version): only accept as id keys if the numbers
  // could be a real clean save under tier gating; otherwise they are shifted
  // v2 indices that need to be un-shifted.
  return plausibleIndexSet(sortUniqueNums(keys.map((k) => Number(k) - 1)))
    ? "id"
    : "v2-index";
}

/**
 * Reconcile one row's completed/solutions into { completed: {id:true},
 * solutions: {id:code}, currentLevel: <id> }. Returns the v3 representation.
 * Chain-repairing un-shifts a repeated remap in rounds; -1/invalid drops are
 * discarded along the way (matching the engine's behavior).
 */
function reconcileProgress({ completed, solutions, currentLevel, totalLevels, version }) {
  const form = detectForm(completed, totalLevels, version);
  const c = completed ?? {};
  let entries = {}; // v2 index -> { done, sol }
  const keys = Object.keys(c);
  const tl = Math.floor(Number(totalLevels)) || 0;
  for (const key of keys) {
    if (!c[key]) continue;
    const k = Number(key);
    if (!Number.isInteger(k)) continue;
    let v2;
    if (form === "id") {
      v2 = k - 1; // id -> v2 index (ids are 1..18 in order today)
    } else if (form === "v1-index") {
      v2 = v1ToV2Index(k, tl);
    } else {
      v2 = k;
    }
    if (v2 < 0 || v2 >= LEVEL_COUNT) continue;
    const e = entries[v2] || { done: false, sol: undefined };
    e.done = true;
    if (solutions && typeof solutions === "object" && typeof solutions[key] === "string") {
      e.sol = solutions[key];
    }
    entries[v2] = e;
  }

  // ONLY v2 index saves can be corrupted: the v2-era client re-ran its index
  // remap on every resume (version was never persisted), shifting indices up.
  // v1 rows were never touched by that client and id rows are already stable,
  // so they are never chain-repaired here.
  if (form === "v2-index") {
    let idx = Object.keys(entries).map(Number);
    let rounds = 0;
    while (rounds < 6 && !plausibleIndexSet(sortUniqueNums(idx))) {
      const next = {};
      for (const i of idx) {
        const inv = invertLegacyIndex(i);
        if (inv >= 0) next[inv] = entries[i];
      }
      entries = next;
      idx = Object.keys(entries).map(Number);
      rounds++;
    }
  }

  const completedById = {};
  const solutionsById = {};
  for (const v2k of Object.keys(entries)) {
    const num = Number(v2k);
    if (num < 0 || num >= LEVEL_COUNT) continue;
    const id = num + 1;
    completedById[id] = true;
    if (entries[v2k].sol) solutionsById[id] = entries[v2k].sol;
  }

  const ids = Object.keys(completedById).map(Number).sort((a, b) => b - a);
  let curId = Math.floor(Number(currentLevel));
  if (form !== "id") {
    curId =
      form === "v1-index"
        ? v1ToV2Index(curId, tl)
        : form === "v2-index"
          ? curId
          : curId - 1;
    curId = Number.isInteger(curId) ? curId + 1 : -1; // v2 index -> id
  }
  if (!Number.isInteger(curId) || curId < 1 || curId > LEVEL_COUNT) {
    curId = ids[0] || 1;
  }
  if (!completedById[curId]) {
    if (ids.length) {
      curId = ids[0];
    } else {
      curId = 1;
    }
  }

  let score = 0;
  for (const key of Object.keys(completedById)) {
    if (completedById[key]) score += POINTS_BY_ID[Number(key)] ?? 0;
  }

  return {
    completed: completedById,
    solutions: Object.keys(solutionsById).length ? solutionsById : undefined,
    currentLevel: curId,
    score,
  };
}

function rowChanged(row, reconciled) {
  const curChanged =
    (Number(row.currentLevel) ?? 0) !== reconciled.currentLevel ||
    (row.score ?? 0) !== reconciled.score ||
    (row.version ?? undefined) !== 3;
  const keys = Object.keys(reconciled.completed);
  const oldKeys = Object.keys(row.completed ?? {});
  if (keys.length !== oldKeys.length) return curChanged || true;
  for (const k of keys) {
    if (row.completed[k] !== true) return curChanged || true;
  }
  if ((reconciled.solutions ?? null) !== (row.solutions ?? null)) return true;
  return curChanged;
}

// --- Database plumbing (mirrors migrate-game-xp.mjs) -------------------------

function getPgConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    null
  );
}

function nowIso() {
  return new Date().toISOString();
}

async function migrateFile() {
  const dbPath =
    process.env.DB_PATH_FILE || path.join(__dirname, "..", "src", "data", "blog-db.json");
  let db;
  try {
    db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`[file] no DB at ${dbPath} — nothing to migrate.`);
      return;
    }
    throw error;
  }

  const progress = db.gameProgress ?? [];
  let changed = 0;
  const affectedUsers = new Set();

  for (const row of progress) {
    if (row.gameSlug !== GAME_SLUG) continue;
    const reconciled = reconcileProgress(row);
    if (!rowChanged(row, reconciled)) continue;
    changed += 1;
    affectedUsers.add(row.userId);
    if (DRY_RUN) {
      console.log(
        `[file][dry] js-detective (${row.userId}): ` +
          `keys ${Object.keys(row.completed ?? {}).length} -> ${Object.keys(reconciled.completed).length}, ` +
          `cur ${row.currentLevel} -> ${reconciled.currentLevel}, ` +
          `score ${row.score} -> ${reconciled.score}, version -> 3`
      );
    } else {
      row.currentLevel = reconciled.currentLevel;
      row.score = reconciled.score;
      row.completed = reconciled.completed;
      if (reconciled.solutions) row.solutions = reconciled.solutions;
      row.version = 3;
      row.updatedAt = nowIso();
    }
  }

  let gamChanged = 0;
  if (affectedUsers.size) {
    const totals = new Map();
    for (const row of progress) {
      if (!affectedUsers.has(row.userId)) continue;
      totals.set(row.userId, (totals.get(row.userId) ?? 0) + (row.score || 0));
    }
    const gam = db.gamification ?? [];
    for (const g of gam) {
      const total = totals.get(g.userId);
      if (total !== undefined && g.total_xp !== total) {
        gamChanged += 1;
        if (!DRY_RUN) g.total_xp = total;
      }
    }
  }

  if (DRY_RUN) {
    console.log(
      `[file][dry] ${changed} js-detective rows would change, ${gamChanged} gamification rows would change.`
    );
    return;
  }

  if (changed || gamChanged) {
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
  }
  console.log(
    `[file] done: ${changed} js-detective rows migrated, ${gamChanged} gamification rows updated.`
  );
}

async function migratePostgres(conn) {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(conn);

  const rows = await sql`
    SELECT user_id, game_slug, current_level, score, completed, solutions, total_levels, version
    FROM game_progress WHERE game_slug = ${GAME_SLUG}
  `;

  let changed = 0;
  const affectedUsers = new Set();

  for (const row of rows) {
    const completed = (() => {
      try {
        return typeof row.completed === "object" && row.completed !== null
          ? row.completed
          : JSON.parse(row.completed ?? "{}");
      } catch {
        return {};
      }
    })();
    const solutions = (() => {
      try {
        return typeof row.solutions === "object" && row.solutions !== null
          ? row.solutions
          : JSON.parse(row.solutions ?? "{}");
      } catch {
        return {};
      }
    })();
    const reconciled = reconcileProgress({
      completed,
      solutions,
      currentLevel: row.current_level,
      totalLevels: row.total_levels,
      version: row.version,
    });
    if (!rowChanged(row, reconciled)) continue;
    changed += 1;
    affectedUsers.add(row.user_id);
    if (DRY_RUN) {
      console.log(
        `[pg][dry] js-detective (${row.user_id}): ` +
          `keys ${Object.keys(completed).length} -> ${Object.keys(reconciled.completed).length}, ` +
          `cur ${row.current_level} -> ${reconciled.currentLevel}, ` +
          `score ${row.score} -> ${reconciled.score}, version -> 3`
      );
    } else {
      await sql`
        UPDATE game_progress
        SET current_level = ${reconciled.currentLevel},
            score = ${reconciled.score},
            completed = ${JSON.stringify(reconciled.completed)},
            solutions = ${JSON.stringify(reconciled.solutions ?? {})},
            total_levels = ${LEVEL_COUNT},
            version = 3,
            updated_at = ${nowIso()}
        WHERE user_id = ${row.user_id} AND game_slug = ${GAME_SLUG}
      `;
    }
  }

  let gamChanged = 0;
  if (affectedUsers.size && !DRY_RUN) {
    for (const userId of affectedUsers) {
      const [sumRow] = await sql`
        SELECT COALESCE(SUM(score), 0)::int AS total_xp
        FROM game_progress WHERE user_id = ${userId}
      `;
      await sql`
        UPDATE gamification
        SET total_xp = ${sumRow?.total_xp ?? 0}, updated_at = ${nowIso()}
        WHERE user_id = ${userId}
      `;
      gamChanged += 1;
    }
  }

  if (DRY_RUN) {
    console.log(
      `[pg][dry] ${changed} js-detective rows would change, ${gamChanged} gamification rows would change.`
    );
    return;
  }
  console.log(
    `[pg] done: ${changed} js-detective rows migrated, ${gamChanged} gamification rows updated.`
  );
}

// --- Self test ----------------------------------------------------------------

function selftest() {
  const cases = [
    {
      name: "v1 fresh: 4 easy solved (v1 never chain-repaired)",
      row: { completed: { 0: true, 1: true, 2: true, 3: true }, currentLevel: 3, totalLevels: 15 },
      expect: { cur: 8, score: 20, ids: [5, 6, 7, 8] },
    },
    {
      name: "v2 pristine full clear",
      row: { completed: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i, true])), currentLevel: 17, totalLevels: 18 },
      expect: { cur: 18, score: 100, ids: Array.from({ length: 18 }, (_, i) => i + 1) },
    },
    {
      name: "v2 corrupted once: full-clear re-remapped to 4..17",
      row: { completed: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 4, true]).filter(([k]) => k < 18)), currentLevel: 4, totalLevels: 18 },
      // The remap permanently dropped old index 11 and indices 15..17, so a
      // full clear can only be reconstructed as [1..11, 13..15] (14/18).
      expect: { cur: 5, score: 64, ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15] },
    },
    {
      name: "v1 with removed hard + dropped boss (16-level layout)",
      row: { completed: { 0: true, 11: true, 15: true }, currentLevel: 15, totalLevels: 16 },
      expect: { cur: 5, score: 5, ids: [5] },
    },
    {
      name: "v3 id-keyed, verified version 3",
      row: { completed: { 1: true, 2: true, 3: true, 4: true }, currentLevel: 4, totalLevels: 18, version: 3 },
      expect: { cur: 4, score: 8, ids: [1, 2, 3, 4] },
    },
    {
      name: "v3 id-keyed wins over stale legacy totalLevels",
      row: { completed: { 5: true, 6: true, 7: true, 8: true }, currentLevel: 8, totalLevels: 15, version: 3 },
      expect: { cur: 8, score: 20, ids: [5, 6, 7, 8] },
    },
    {
      name: "versionless but gating-plausible keys treated as ids",
      row: { completed: { 1: true, 2: true, 3: true, 4: true }, currentLevel: 4, totalLevels: 18 },
      expect: { cur: 4, score: 8, ids: [1, 2, 3, 4] },
    },
    {
      name: "empty save",
      row: { completed: {}, currentLevel: 0, totalLevels: 18 },
      expect: { cur: 1, score: 0, ids: [] },
    },
  ];

  let failures = 0;
  for (const c of cases) {
    const out = reconcileProgress(c.row);
    const ids = Object.keys(out.completed).map(Number).sort((a, b) => a - b);
    const ok =
      out.currentLevel === c.expect.cur &&
      out.score === c.expect.score &&
      JSON.stringify(ids) === JSON.stringify(c.expect.ids);
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${c.name} -> cur=${out.currentLevel} score=${out.score} ids=[${ids.join(",")}]`
    );
  }
  console.log(failures ? `\n${failures} FAILURES` : "\nall ok");
  process.exit(failures ? 1 : 0);
}

if (SELFTEST) {
  selftest();
} else {
  const conn = getPgConnectionString();
  if (conn) {
    await migratePostgres(conn);
  } else {
    await migrateFile();
  }
}
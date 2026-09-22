/* ==========================================================================
   migrate-game-xp.mjs — one-time XP backfill for the 100-point scoring change
   ==========================================================================
   History: PHP Playground and Query Quest used tier points
     easy 5 / intermediate 6 / hard 8 / mostHard 10  -> 109 XP per game.
   They now use easy 5 / intermediate 6 / hard 7 / mostHard 8 -> 100 XP.
   Scores were previously computed client-side and stored as-is, so existing
   rows may hold the old 109-based totals. This script recomputes every stored
   score from its `completed` map using the new per-level values and refreshes
   each affected user's gamification.total_xp. It mirrors GAME_LEVEL_POINTS /
   scoreForCompleted in src/lib/gamification.ts.

   Backend selection mirrors src/lib/pg-connection.ts:
     - POSTGRES_URL / DATABASE_URL / POSTGRES_URL_NON_POOLING set -> Postgres
     - otherwise the file store (src/data/blog-db.json)

   Usage: node scripts/migrate-game-xp.mjs
   Options:
     --dry-run   report what would change without writing anything
   ========================================================================== */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

// Mirror of GAME_LEVEL_POINTS (src/lib/gamification.ts) for the two games.
const GAMES = {
  "php-playground": [5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8],
  "query-quest": [5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8],
};

function computeScore(completed) {
  return Object.entries(completed).reduce((sum, [key, value]) => {
    if (value !== true) return sum;
    const idx = Number(key);
    if (!Number.isInteger(idx) || idx < 0 || idx >= 16) return sum;
    return sum + GAME_POINTS_LOOKUP[idx];
  }, 0);
}

// Precompute per-level points keyed by index for both games.
const GAME_POINTS_LOOKUP = new Array(16).fill(0);
Object.entries(GAMES).forEach(([slug, arr]) => {
  if (slug === Object.keys(GAMES)[0]) {
    arr.forEach((p, i) => {
      GAME_POINTS_LOOKUP[i] = p;
    });
  }
});

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

/**
 * Recomputes the score for a stored row. Returns the new score when it differs
 * from the stored one, otherwise null.
 */
function newScoreFor(completed, storedScore) {
  if (typeof completed !== "object" || completed === null) return null;
  const s = computeScore(completed);
  return s !== storedScore ? s : null;
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
    if (!(row.gameSlug in GAMES)) continue;
    const newScore = newScoreFor(row.completed, row.score);
    if (newScore == null) continue;
    changed += 1;
    affectedUsers.add(row.userId);
    if (newScore !== row.score) {
      if (DRY_RUN) {
        console.log(
          `[file][dry] ${row.gameSlug} (${row.userId}): score ${row.score} -> ${newScore}`
        );
      } else {
        row.score = newScore;
        row.updatedAt = nowIso();
      }
    }
  }

  // Refresh gamification.total_xp for every affected user (sum across ALL their
  // games so other games' scores are preserved). Streaks are play-tracking and
  // are deliberately left untouched by a data backfill.
  const gam = db.gamification ?? [];
  let gamChanged = 0;
  if (affectedUsers.size) {
    const totals = new Map();
    for (const row of progress) {
      if (!affectedUsers.has(row.userId)) continue;
      totals.set(row.userId, (totals.get(row.userId) ?? 0) + (row.score || 0));
    }
    for (const g of gam) {
      const total = totals.get(g.userId);
      if (total !== undefined && g.total_xp !== total) {
        g.total_xp = total;
        gamChanged += 1;
      }
    }
  }

  if (DRY_RUN) {
    console.log(
      `[file][dry] ${changed} game_progress rows would change, ${gamChanged} gamification rows would change.`
    );
    return;
  }

  if (changed || gamChanged) {
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
  }
  console.log(
    `[file] done: ${changed} game_progress rows migrated, ${gamChanged} gamification rows updated.`
  );
}

async function migratePostgres(conn) {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(conn);

  const rows = await sql`
    SELECT user_id, game_slug, score, completed FROM game_progress
  `;

  let changed = 0;
  const affectedUsers = new Set();

  for (const row of rows) {
    if (!(row.game_slug in GAMES)) continue;
    const completed = (() => {
      try {
        return typeof row.completed === "object" && row.completed !== null
          ? row.completed
          : JSON.parse(row.completed ?? "{}");
      } catch {
        return {};
      }
    })();
    const newScore = newScoreFor(completed, row.score);
    if (newScore == null) continue;
    changed += 1;
    affectedUsers.add(row.user_id);
    if (newScore !== row.score) {
      if (DRY_RUN) {
        console.log(
          `[pg][dry] ${row.game_slug} (${row.user_id}): score ${row.score} -> ${newScore}`
        );
      } else {
        await sql`
          UPDATE game_progress
          SET score = ${newScore}, updated_at = ${nowIso()}
          WHERE user_id = ${row.user_id} AND game_slug = ${row.game_slug}
        `;
      }
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
      `[pg][dry] ${changed} game_progress rows would change, ${gamChanged} gamification rows would change.`
    );
    return;
  }
  console.log(
    `[pg] done: ${changed} game_progress rows migrated, ${gamChanged} gamification rows updated.`
  );
}

const conn = getPgConnectionString();
if (conn) {
  await migratePostgres(conn);
} else {
  await migrateFile();
}
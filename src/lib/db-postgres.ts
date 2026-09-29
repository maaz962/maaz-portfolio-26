import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import type {
  User,
  GameProgress,
  Gamification,
  LeaderboardEntry,
  XpAdjustmentRecord,
  AdminUserDetail,
} from "@/types";
import { hashPassword, verifyPassword } from "./password";
import { getPgConnectionString, usePostgres } from "./pg-connection";
import {
  dateKeyFromDaysAgo,
  levelForXp,
  levelStatsForXp,
  maxScoreForGame,
  scoreForCompleted,
  DAILY_HINT_LIMIT,
} from "./gamification";
import { games } from "@/data/games";
import { getAdminEnv, adminAvatarUrl, ADMIN_CREATED_AT } from "./admin-seed";

/**
 * Postgres-backed persistent data layer. Used when process.env.DATABASE_URL is
 * set (i.e. on Vercel). Unlike the file-based store, this survives deploys and
 * cold starts â€” game progress and users are never reset.
 */

// Neon's tagged template returns a wide union type that is awkward to map over;
// we narrow it to Promise<any[]> since the driver always returns arrays of rows.
type DbTag = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

/** `neon()`'s real return value also exposes `transaction()`; the local
 * `DbTag` alias narrows it away, so the multi-statement path is declared here
 * rather than casting `sql` to `any` at every call site. */
type DbTagWithTransaction = DbTag & {
  transaction: (queries: any[]) => Promise<any[]>;
};

const conn = getPgConnectionString();
const sql = (conn ? neon(conn) : null) as unknown as DbTagWithTransaction;

// Usernames that must never appear on the public leaderboard regardless of
// the stored flag (defense-in-depth for accounts created outside this app).
const HIDDEN_USERNAMES = [
  "test4",
  "test5",
  "dua",
  "dua_zainab",
  "zainab",
  "rania",
  "rania_afzal",
  "Rania Afzal",
  "Dua",
  "@dua_zainab",
];

/**
 * Hard-exclusion predicate for a `users u` FROM clause.
 *
 * Must be `= ANY($1)` and never `NOT IN ($1)`: the neon tagged template sends an
 * interpolated array as a single bound parameter, so `x NOT IN ($1)` compares
 * the column against that array as one value, never matches, and silently
 * returns every row. That bug let the test accounts sit on the live public
 * leaderboard. `= ANY(...)` is the form Postgres evaluates per element, and an
 * empty list matches nobody rather than everybody.
 */
const NOT_HARD_EXCLUDED = sql`NOT (LOWER(u.username) = ANY(${HIDDEN_USERNAMES.map((n) => n.toLowerCase())}))`;

let initPromise: Promise<void> | null = null;

async function initDb(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        hidden_from_leaderboard BOOLEAN NOT NULL DEFAULT false,
        avatar_url TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        password_hash TEXT NOT NULL
      )
    `;
    // Older deployments created `users` before this flag existed, and CREATE
    // TABLE IF NOT EXISTS no-ops on the existing table — so the column must be
    // added idempotently. DEFAULT false keeps every existing account visible
    // (only accounts explicitly flagged true are hidden).
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS hidden_from_leaderboard BOOLEAN NOT NULL DEFAULT false`;
    await sql`
      CREATE TABLE IF NOT EXISTS game_progress (
        user_id TEXT NOT NULL,
        game_slug TEXT NOT NULL,
        current_level INT NOT NULL DEFAULT 0,
        score INT NOT NULL DEFAULT 0,
        completed JSONB NOT NULL DEFAULT '{}',
        total_levels INT NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, game_slug)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS gamification (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        total_xp INT NOT NULL DEFAULT 0,
        games_played INT NOT NULL DEFAULT 0,
        current_streak INT NOT NULL DEFAULT 0,
        longest_streak INT NOT NULL DEFAULT 0,
        last_played_at TEXT,
        updated_at TEXT NOT NULL
      )
    `;
    // Migration for newer columns that older rows won't have. version defaults
    // to 3 (id-keyed) for fresh rows; legacy index-keyed rows are reconciled by
    // their key shape + total_levels in the one-time migration script.
    await sql`ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS solutions JSONB NOT NULL DEFAULT '{}'`;
    await sql`ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS hints JSONB NOT NULL DEFAULT '{}'`;
    await sql`ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 3`;
    await sql`ALTER TABLE gamification ADD COLUMN IF NOT EXISTS hints JSONB NOT NULL DEFAULT '{}'`;
    // Admin-applied XP bonus/penalty layered on top of the score-derived total;
    // added idempotently so pre-existing deployments pick it up on next boot.
    await sql`ALTER TABLE gamification ADD COLUMN IF NOT EXISTS xp_adjustment INT NOT NULL DEFAULT 0`;
    // Audit trail for absolute XP sets. `previous_total_xp` is what makes a
    // mistaken grant reversible: re-submit that value with a correcting reason.
    await sql`
      CREATE TABLE IF NOT EXISTS xp_adjustments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_xp INT NOT NULL,
        previous_total_xp INT NOT NULL,
        adjustment INT NOT NULL,
        reason TEXT NOT NULL,
        applied_by TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;
    // Idempotent seed of the site owner's admin account â€” mirrors the file-store
    // seed so /admin is reachable on first production deploy too. ON CONFLICT
    // makes it safe on every cold start / redeploy, and crucially it never
    // OVERWRITES an existing row: rotating the password is an explicit
    // `admin-credentials.mjs apply`, not a side effect of a cold start.
    //
    // The identity + password hash come from the environment (never from source,
    // which used to expose this account to anyone who cloned the repo). When
    // they are absent we skip the seed entirely and say so, so a deploy without
    // an admin is loud rather than silently locked out later.
    const adminEnv = getAdminEnv();
    if (adminEnv.ok) {
      const { id, name, username, email, passwordHash } = adminEnv.config;
      await sql`
        INSERT INTO users (id, name, username, email, is_admin, avatar_url, created_at, password_hash)
        VALUES (
          ${id},
          ${name},
          ${username},
          ${email},
          true,
          ${adminAvatarUrl(username)},
          ${ADMIN_CREATED_AT},
          ${passwordHash}
        )
        ON CONFLICT DO NOTHING
      `;
    } else {
      console.error(adminEnv.reason);
    }
  })();
  return initPromise;
}

function nowISO(): string {
  return new Date().toISOString();
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    isAdmin: row.is_admin,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    hiddenFromLeaderboard: row.hidden_from_leaderboard ?? false,
  };
}

function rowToGameProgress(row: any): GameProgress {
  const hints = row.hints && typeof row.hints === "object" ? row.hints : {};
  return {
    userId: row.user_id,
    gameSlug: row.game_slug,
    currentLevel: row.current_level,
    score: row.score,
    completed: row.completed ?? {},
    solutions: row.solutions ?? {},
    hints: {
      date: typeof hints.date === "string" ? hints.date : "",
      used: Number.isInteger(hints.used) ? hints.used : 0,
    },
    totalLevels: row.total_levels,
    version: Number.isInteger(row.version) ? row.version : undefined,
    updatedAt: row.updated_at,
  };
}

// --- USERS ---

export async function findUserById(id: string): Promise<User | null> {
  await initDb();
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  return rowToUser(rows[0]);
}

export async function listUsers(): Promise<User[]> {
  await initDb();
  const rows = await sql`SELECT * FROM users ORDER BY created_at DESC`;
  return rows.map(rowToUser);
}

export async function registerUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<User> {
  await initDb();
  const id = `user-${crypto.randomUUID()}`;
  const formattedEmail = email.toLowerCase().trim();
  const formattedUsername = username.toLowerCase().trim();
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedUsername)}`;

  try {
    const rows = await sql`
      INSERT INTO users (id, name, username, email, is_admin, avatar_url, created_at, password_hash)
      VALUES (${id}, ${name.trim()}, ${formattedUsername}, ${formattedEmail}, false, ${avatarUrl}, ${nowISO()}, ${hashPassword(password)})
      RETURNING *
    `;
    return rowToUser(rows[0]);
  } catch (err: any) {
    // Unique constraint violations map to the same friendly messages as the file store.
    if (err?.code === "23505") {
      const detail: string = err.detail || "";
      if (detail.includes("email")) throw new Error("Email already registered");
      if (detail.includes("username")) throw new Error("Username already taken");
    }
    throw err;
  }
}

export async function validateCredentials(
  emailOrUsername: string,
  password: string
): Promise<User | null> {
  await initDb();
  const lowerInput = emailOrUsername.toLowerCase().trim();
  const rows = await sql`
    SELECT * FROM users
    WHERE email = ${lowerInput} OR username = ${lowerInput}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const row = rows[0];
  if (!verifyPassword(password, row.password_hash)) return null;
  return rowToUser(row);
}

// --- GAME PROGRESS ---

export async function getGameProgressForUser(userId: string): Promise<Record<string, GameProgress>> {
  await initDb();
  const rows = await sql`SELECT * FROM game_progress WHERE user_id = ${userId}`;
  const bySlug: Record<string, GameProgress> = {};
  rows.forEach((r) => {
    bySlug[r.game_slug] = rowToGameProgress(r);
  });
  return bySlug;
}

export async function getGameProgress(
  userId: string,
  gameSlug: string
): Promise<GameProgress | null> {
  await initDb();
  const rows = await sql`
    SELECT * FROM game_progress WHERE user_id = ${userId} AND game_slug = ${gameSlug} LIMIT 1
  `;
  return rows[0] ? rowToGameProgress(rows[0]) : null;
}

export async function saveGameProgress(
  userId: string,
  gameSlug: string,
  data: {
    currentLevel: number;
    score: number;
    completed: Record<string, boolean>;
    totalLevels: number;
    solutions?: Record<string, string>;
    hints?: { date: string; used: number };
    version?: number;
  }
): Promise<GameProgress> {
  await initDb();

  const cleanCompleted: Record<string, boolean> = {};
  if (data.completed && typeof data.completed === "object") {
    Object.keys(data.completed).forEach((k) => {
      const idx = Number(k);
      if (Number.isInteger(idx) && idx >= 0 && data.completed[k]) {
        cleanCompleted[String(idx)] = true;
      }
    });
  }

  const cleanSolutions: Record<string, string> = {};
  if (data.solutions && typeof data.solutions === "object") {
    Object.keys(data.solutions).forEach((k) => {
      const idx = Number(k);
      const v = data.solutions?.[k];
      if (Number.isInteger(idx) && idx >= 0 && typeof v === "string" && v.length <= 20000) {
        cleanSolutions[String(idx)] = v;
      }
    });
  }

  const cleanHints =
    data.hints && typeof data.hints === "object" && typeof data.hints.date === "string"
      ? {
          date: data.hints.date.slice(0, 10),
          used: Math.max(0, Number(data.hints.used) || 0),
        }
      : { date: "", used: 0 };

  const currentLevel = Math.max(
    0,
    Number.isInteger(data.currentLevel) && data.currentLevel >= 0 ? data.currentLevel : 0
  );
  // The server is the source of truth for scoring: recompute the total
  // from the completed map for games with a points table, so scores can
  // never diverge from the shipped XP values.
  const score =
    scoreForCompleted(gameSlug, cleanCompleted) ??
    Math.max(
      0,
      typeof data.score === "number" && Number.isFinite(data.score) ? data.score : 0
    );
  const totalLevels = Math.max(
    1,
    Number.isInteger(data.totalLevels) && data.totalLevels > 0 ? data.totalLevels : 1
  );
  const version = Number.isInteger(data.version) && data.version! > 0 ? data.version! : 3;
  const updatedAt = nowISO();

  const rows = await sql`
    INSERT INTO game_progress (user_id, game_slug, current_level, score, completed, solutions, hints, total_levels, version, updated_at)
    VALUES (${userId}, ${gameSlug}, ${currentLevel}, ${score}, ${JSON.stringify(cleanCompleted)}, ${JSON.stringify(cleanSolutions)}, ${JSON.stringify(cleanHints)}, ${totalLevels}, ${version}, ${updatedAt})
    ON CONFLICT (user_id, game_slug)
    DO UPDATE SET
      current_level = EXCLUDED.current_level,
      score = EXCLUDED.score,
      completed = EXCLUDED.completed,
      solutions = EXCLUDED.solutions,
      hints = EXCLUDED.hints,
      total_levels = EXCLUDED.total_levels,
      version = EXCLUDED.version,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `;

  // Keep gamification (XP / streak / shared hint budget) in sync with the
  // fresh progress write â€” carry the user's spent hints through untouched so a
  // save never resets the shared daily hint pool.
  const [sumRow] = await sql`
    SELECT COALESCE(SUM(score), 0)::int AS total_xp,
           COUNT(DISTINCT game_slug)::int AS games_played
    FROM game_progress WHERE user_id = ${userId}
  `;
  const today = dateKeyFromDaysAgo(0);
  const yesterday = dateKeyFromDaysAgo(1);
  const [streakRow] = await sql`
    SELECT * FROM gamification WHERE user_id = ${userId} LIMIT 1
  `;

  const hintsJson =
    streakRow?.hints && typeof streakRow.hints === "object"
      ? JSON.stringify(streakRow.hints)
      : JSON.stringify({ date: "", used: 0 });

  // Persist any admin-applied XP adjustment so a fresh play session recomputes
  // the total as score-sum + adjustment (never wipes a manual grant/penalty).
  const xpAdjustment = Number.isInteger(streakRow?.xp_adjustment)
    ? (streakRow.xp_adjustment as number)
    : 0;

  let currentStreak = streakRow?.current_streak ?? 0;
  if (streakRow?.last_played_at !== today) {
    currentStreak = streakRow?.last_played_at === yesterday ? currentStreak + 1 : 1;
  }
  const longestStreak = Math.max(streakRow?.longest_streak ?? 0, currentStreak);

  const recomputedXp = (sumRow?.total_xp ?? 0) + xpAdjustment;

  await sql`
    INSERT INTO gamification (user_id, total_xp, games_played, current_streak, longest_streak, last_played_at, hints, xp_adjustment, updated_at)
    VALUES (${userId}, ${recomputedXp}, ${sumRow?.games_played ?? 0}, ${currentStreak}, ${longestStreak}, ${today}, ${hintsJson}, ${xpAdjustment}, ${nowISO()})
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_xp = EXCLUDED.total_xp,
      games_played = EXCLUDED.games_played,
      current_streak = EXCLUDED.current_streak,
      longest_streak = EXCLUDED.longest_streak,
      last_played_at = EXCLUDED.last_played_at,
      hints = EXCLUDED.hints,
      xp_adjustment = EXCLUDED.xp_adjustment,
      updated_at = EXCLUDED.updated_at
  `;

  return rowToGameProgress(rows[0]);
}

// --- GAMIFICATION (XP, levels, streaks) ---

/** Current gamification summary for one user (XP always recomputed from progress). */
export async function getGamification(userId: string): Promise<Gamification> {
  await initDb();
  const [sumRow] = await sql`
    SELECT COALESCE(SUM(score), 0)::int AS total_xp,
           COUNT(DISTINCT game_slug)::int AS games_played
    FROM game_progress WHERE user_id = ${userId}
  `;
  const [stored] = await sql`
    SELECT * FROM gamification WHERE user_id = ${userId} LIMIT 1
  `;
  const xpAdjustment = Number.isInteger(stored?.xp_adjustment)
    ? (stored.xp_adjustment as number)
    : 0;
  return {
    userId,
    totalXp: (sumRow?.total_xp ?? 0) + xpAdjustment,
    gamesPlayed: sumRow?.games_played ?? 0,
    currentStreak: stored?.current_streak ?? 0,
    longestStreak: stored?.longest_streak ?? 0,
    lastPlayedAt: stored?.last_played_at ?? null,
    hints:
      stored?.hints && typeof stored.hints === "object"
        ? {
            date: typeof stored.hints.date === "string" ? stored.hints.date : "",
            used: Number.isInteger(stored.hints.used) ? stored.hints.used : 0,
          }
        : undefined,
    xpAdjustment,
    updatedAt: stored?.updated_at ?? nowISO(),
  };
}

// --- SHARED DAILY HINT BUDGET ---

/**
 * How many of today's shared 3 hints the user has left across all games
 * (the pool is per user, not per game).
 */
export async function getDailyHintUsage(
  userId: string
): Promise<{ used: number; left: number }> {
  await initDb();
  const [stored] = await sql`
    SELECT hints FROM gamification WHERE user_id = ${userId} LIMIT 1
  `;
  const today = dateKeyFromDaysAgo(0);
  const used =
    stored?.hints && stored.hints.date === today
      ? Math.max(0, Number(stored.hints.used) || 0)
      : 0;
  return { used, left: Math.max(0, DAILY_HINT_LIMIT - used) };
}

/**
 * Consumes one hint from the user's shared daily budget. Server-authoritative:
 * the count rolls over at midnight UTC and can never climb above the daily cap,
 * regardless of which game the reveal happens in.
 */
export async function consumeDailyHint(
  userId: string
): Promise<{ ok: boolean; used: number; left: number }> {
  await initDb();
  const [stored] = await sql`
    SELECT * FROM gamification WHERE user_id = ${userId} LIMIT 1
  `;
  const today = dateKeyFromDaysAgo(0);
  const used =
    stored?.hints && stored.hints.date === today
      ? Math.max(0, Number(stored.hints.used) || 0)
      : 0;

  if (used >= DAILY_HINT_LIMIT) {
    return { ok: false, used, left: 0 };
  }

  const nextUsed = used + 1;
  const hintsJson = JSON.stringify({ date: today, used: nextUsed });
  await sql`
    INSERT INTO gamification (user_id, total_xp, games_played, current_streak, longest_streak, last_played_at, hints, xp_adjustment, updated_at)
    VALUES (${userId}, ${stored?.total_xp ?? 0}, ${stored?.games_played ?? 0}, ${stored?.current_streak ?? 0}, ${stored?.longest_streak ?? 0}, ${stored?.last_played_at ?? null}, ${hintsJson}, ${Number.isInteger(stored?.xp_adjustment) ? stored.xp_adjustment : 0}, ${nowISO()})
    ON CONFLICT (user_id)
    DO UPDATE SET
      hints = EXCLUDED.hints,
      xp_adjustment = EXCLUDED.xp_adjustment,
      updated_at = EXCLUDED.updated_at
  `;
  return { ok: true, used: nextUsed, left: DAILY_HINT_LIMIT - nextUsed };
}

/** Top players by total XP (admins excluded â€” they're the site owners). */
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  await initDb();
  const rows = await sql`
    SELECT u.id, u.name, u.username, u.avatar_url, u.created_at,
           (COALESCE(SUM(gp.score), 0) + COALESCE(g.xp_adjustment, 0))::int AS total_xp,
           COUNT(DISTINCT gp.game_slug)::int AS games_played,
           COALESCE(g.current_streak, 0)::int AS current_streak
    FROM users u
    LEFT JOIN game_progress gp ON gp.user_id = u.id
    LEFT JOIN gamification g ON g.user_id = u.id
    WHERE u.is_admin = false
      AND ${NOT_HARD_EXCLUDED}
    GROUP BY u.id, u.created_at, g.current_streak, g.xp_adjustment
    HAVING NOT COALESCE(u.hidden_from_leaderboard, false)
    ORDER BY total_xp DESC, u.created_at ASC
    LIMIT ${limit}
  `;
  return rows.map((r: any, i: number) => ({
    rank: i + 1,
    user: { id: r.id, name: r.name, username: r.username, avatarUrl: r.avatar_url },
    totalXp: r.total_xp,
    level: levelForXp(r.total_xp),
    gamesPlayed: r.games_played,
    currentStreak: r.current_streak,
  }));
}

/** 1-based rank among all non-admin players; null for admins / unknown users. */
export async function getUserRank(userId: string): Promise<number | null> {
  await initDb();
  const rows = await sql`
    SELECT u.id, u.created_at,
           (COALESCE(SUM(gp.score), 0) + COALESCE(g.xp_adjustment, 0))::int AS xp
    FROM users u
    LEFT JOIN game_progress gp ON gp.user_id = u.id
    LEFT JOIN gamification g ON g.user_id = u.id
    WHERE u.is_admin = false
      AND ${NOT_HARD_EXCLUDED}
    GROUP BY u.id, u.created_at, g.xp_adjustment
    HAVING NOT COALESCE(u.hidden_from_leaderboard, false)
  `;
  const ranked = rows
    .sort(
      (a: any, b: any) => b.xp - a.xp || a.created_at.localeCompare(b.created_at)
    )
    .map((r: any) => r.id);
  const idx = ranked.indexOf(userId);
  return idx > -1 ? idx + 1 : null;
}

// --- ADMIN USER MANAGEMENT ---

/**
 * Permanently removes a non-admin user and every record referencing them
 * (game progress, gamification, XP audit trail — the latter cascades via FK).
 * Admin accounts are protected.
 */
export async function deleteUser(userId: string): Promise<{ ok: boolean }> {
  await initDb();
  const [target] = await sql`SELECT is_admin FROM users WHERE id = ${userId} LIMIT 1`;
  if (!target) throw new Error("User not found");
  if (target.is_admin) throw new Error("Cannot delete an admin account");

  await sql`DELETE FROM game_progress WHERE user_id = ${userId}`;
  await sql`DELETE FROM xp_adjustments WHERE user_id = ${userId}`;
  await sql`DELETE FROM gamification WHERE user_id = ${userId}`;
  await sql`DELETE FROM users WHERE id = ${userId}`;
  return { ok: true };
}

// --- ADMIN USER DETAIL + MUTATIONS ---

function rowToXpAdjustment(row: any): XpAdjustmentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    totalXp: row.total_xp,
    previousTotalXp: row.previous_total_xp,
    adjustment: row.adjustment,
    reason: row.reason,
    appliedBy: row.applied_by,
    createdAt: row.created_at,
  };
}

/**
 * Everything the admin detail page shows about one account: identity, per-game
 * progress, current XP standing and the XP audit trail.
 *
 * `scoreForCompleted` re-derives each game's score from its completed levels
 * where a points table exists, so a tampered client score cannot inflate the
 * displayed total.
 */
export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  await initDb();
  const [userRow] = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
  if (!userRow) throw new Error("User not found");

  const [sumRow] = await sql`
    SELECT COALESCE(SUM(score), 0)::int AS base_xp,
           COUNT(DISTINCT game_slug)::int AS games_played
    FROM game_progress WHERE user_id = ${userId}
  `;
  const [stored] = await sql`SELECT * FROM gamification WHERE user_id = ${userId} LIMIT 1`;
  const xpAdjustment = Number.isInteger(stored?.xp_adjustment) ? (stored.xp_adjustment as number) : 0;
  const totalXp = (sumRow?.base_xp ?? 0) + xpAdjustment;
  const levels = levelStatsForXp(totalXp);

  const progressRows = await sql`
    SELECT * FROM game_progress WHERE user_id = ${userId}
  `;
  const historyRows = await sql`
    SELECT * FROM xp_adjustments WHERE user_id = ${userId} ORDER BY created_at DESC
  `;

  return {
    user: rowToUser(userRow),
    totalXp,
    level: levels.level,
    levelFloor: levels.floor,
    levelNext: levels.next,
    levelProgressPct: levels.progressPct,
    rank: await getUserRank(userId),
    currentStreak: stored?.current_streak ?? 0,
    longestStreak: stored?.longest_streak ?? 0,
    lastPlayedAt: stored?.last_played_at ?? null,
    xpAdjustment,
    gamesPlayed: sumRow?.games_played ?? 0,
    games: progressRows
      .map((row: any) => {
        const progress = rowToGameProgress(row);
        const authoritative = scoreForCompleted(progress.gameSlug, progress.completed);
        return {
          gameSlug: progress.gameSlug,
          title: games.find((g) => g.slug === progress.gameSlug)?.title ?? progress.gameSlug,
          score: authoritative ?? progress.score,
          maxScore: maxScoreForGame(progress.gameSlug),
          currentLevel: progress.currentLevel,
          totalLevels: progress.totalLevels,
          completedLevels: Object.values(progress.completed ?? {}).filter(Boolean).length,
          updatedAt: progress.updatedAt,
        };
      })
      // Sorted on the resolved score, not the stored one, so the order matches
      // the file backend and the total shown in the same view.
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)),
    xpHistory: historyRows.map(rowToXpAdjustment),
  };
}

/**
 * Sets a user's total XP to an absolute value and records why.
 *
 * The stored model is a delta, so an absolute request is converted to the
 * adjustment that yields the requested total; the before/after values are kept
 * so a mistaken change can be reversed without arithmetic.
 */
export async function setUserTotalXp(
  userId: string,
  totalXp: number,
  reason: string,
  appliedBy: string
): Promise<AdminUserDetail> {
  await initDb();
  const [target] = await sql`SELECT is_admin FROM users WHERE id = ${userId} LIMIT 1`;
  if (!target) throw new Error("User not found");
  if (target.is_admin) throw new Error("Cannot adjust an admin account");

  const [sumRow] = await sql`
    SELECT COALESCE(SUM(score), 0)::int AS base_xp,
           COUNT(DISTINCT game_slug)::int AS games_played
    FROM game_progress WHERE user_id = ${userId}
  `;
  const baseXp = sumRow?.base_xp ?? 0;
  const gamesPlayed = sumRow?.games_played ?? 0;

  const [stored] = await sql`SELECT * FROM gamification WHERE user_id = ${userId} LIMIT 1`;
  const previousTotalXp = baseXp + (Number.isInteger(stored?.xp_adjustment) ? stored.xp_adjustment : 0);
  const adjustment = totalXp - baseXp;

  const hintsJson = JSON.stringify(
    stored?.hints && typeof stored.hints === "object" ? stored.hints : { date: "", used: 0 }
  );
  // One transaction: an XP change with no audit row is worse than a failed
  // change, because the audit trail is the only way to spot a bad grant later.
  await sql.transaction([
    sql`
      INSERT INTO gamification (user_id, total_xp, games_played, current_streak, longest_streak, last_played_at, hints, xp_adjustment, updated_at)
      VALUES (${userId}, ${totalXp}, ${gamesPlayed}, ${Number.isInteger(stored?.current_streak) ? stored.current_streak : 0}, ${Number.isInteger(stored?.longest_streak) ? stored.longest_streak : 0}, ${stored?.last_played_at ?? null}, ${hintsJson}, ${adjustment}, ${nowISO()})
      ON CONFLICT (user_id) DO UPDATE SET
        total_xp = ${totalXp},
        games_played = EXCLUDED.games_played,
        xp_adjustment = EXCLUDED.xp_adjustment,
        updated_at = EXCLUDED.updated_at
    `,
    sql`
      INSERT INTO xp_adjustments (id, user_id, total_xp, previous_total_xp, adjustment, reason, applied_by, created_at)
      VALUES (${crypto.randomUUID()}, ${userId}, ${totalXp}, ${previousTotalXp}, ${adjustment}, ${reason}, ${appliedBy}, ${nowISO()})
    `,
  ]);

  return getAdminUserDetail(userId);
}

/** Shows or hides an account from the public leaderboard. */
export async function setUserHiddenFromLeaderboard(
  userId: string,
  hidden: boolean
): Promise<{ ok: boolean; hiddenFromLeaderboard: boolean }> {
  await initDb();
  const [target] = await sql`SELECT is_admin FROM users WHERE id = ${userId} LIMIT 1`;
  if (!target) throw new Error("User not found");
  if (target.is_admin) throw new Error("Cannot change an admin account");

  await sql`UPDATE users SET hidden_from_leaderboard = ${hidden} WHERE id = ${userId}`;
  return { ok: true, hiddenFromLeaderboard: hidden };
}

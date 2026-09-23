/**
 * Gamification rules shared by every backend (file store + Postgres):
 *
 * - XP = total points scored across all games (each game's saved `score`).
 * - Level thresholds use a triangular progression, so the grind grows gently:
 *     level n starts at  t(n) = 100 * n * (n-1) / 2
 *     L1: 0 XP, L2: 100, L3: 300, L4: 600, L5: 1000, L6: 1500, L7: 2100 ...
 * - "Streak" = consecutive UTC days on which the user played at least one game.
 */

/** Smallest XP value that reaches the given level. Level 1 always starts at 0. */
export function levelFloor(level: number): number {
  if (level <= 1) return 0;
  return 100 * ((level * (level - 1)) / 2);
}

/** Highest level whose floor is <= xp (level >= 1). */
export function levelForXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp) || 0);
  let level = 1;
  while (levelFloor(level + 1) <= safeXp) level += 1;
  return level;
}

export interface LevelStats {
  level: number;
  /** XP required to reach the current level. */
  floor: number;
  /** XP required to reach the next level. */
  next: number;
  /** 0..1 progress through the current level. */
  progressPct: number;
}

export function levelStatsForXp(xp: number): LevelStats {
  const safeXp = Math.max(0, Math.floor(xp) || 0);
  const level = levelForXp(safeXp);
  const floor = levelFloor(level);
  const next = levelFloor(level + 1);
  const progressPct =
    next > floor ? Math.min(1, (safeXp - floor) / (next - floor)) : 1;
  return { level, floor, next, progressPct };
}

/** UTC date key (YYYY-MM-DD) for a given date. */
export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** UTC date key N days before today (0 = today, 1 = yesterday). */
export function dateKeyFromDaysAgo(days: number): string {
  return dateKey(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

/**
 * Per-level XP values for the full 16- and 18-level games, indexed by 0-based
 * level. Source of truth shared by every backend so the server recomputes
 * scores instead of trusting a client-sent number.
 *
 * PHP Playground and Query Quest share one layout:
 *   easy L1-L5 = 5 XP, intermediate L6-L10 = 6 XP,
 *   hard L11-L13 = 7 XP, mostHard L14-L16 = 8 XP  ->  100 XP overall.
 *
 * JS Detective was restructured to drop its Hard tier and gain Beginner:
 *   beginner L1-L4 = 2 XP, easy L5-L8 = 5 XP, intermediate L9-L15 = 6 XP,
 *   mostHard L16-L18 = 10 XP  ->  100 XP overall.
 *
 * Animation Arena ships two tiers (no advanced/Most Hard):
 *   beginner L1-L8 = 8 XP, intermediate L9-L12 = 9 XP  ->  100 XP overall.
 */
export const GAME_LEVEL_POINTS: Record<string, number[]> = {
  "php-playground": [5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8],
  "query-quest": [5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8],
  "js-detective": [2, 2, 2, 2, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 10, 10, 10],
  "animation-arena": [8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9],
};

/**
 * Stores for games whose progress is keyed by a stable 1-based level id
 * instead of a 0-based index, so adding/removing/reordering levels can never
 * misalign saved progress. Lists every level's id -> XP explicitly rather than
 * deriving it from position, so a future reorder needs zero logic changes.
 */
export const GAME_LEVEL_POINTS_BY_ID: Record<string, Record<number, number>> = {
  "js-detective": {
    1: 2, 2: 2, 3: 2, 4: 2, // beginner
    5: 5, 6: 5, 7: 5, 8: 5, // easy
    9: 6, 10: 6, 11: 6, 12: 6, 13: 6, 14: 6, 15: 6, // intermediate
    16: 10, 17: 10, 18: 10, // most hard
  },
};

/** Shared daily hint budget: every game draws from one pool of 3 hints per user per day. */
export const DAILY_HINT_LIMIT = 3;

/** Total XP a game is worth when every level is beaten (100 for all seven games). */
export function maxScoreForGame(gameSlug: string): number | null {
  const byId = GAME_LEVEL_POINTS_BY_ID[gameSlug];
  if (byId) {
    return Object.values(byId).reduce((sum, p) => sum + p, 0);
  }
  const points = GAME_LEVEL_POINTS[gameSlug];
  return points ? points.reduce((sum, p) => sum + p, 0) : null;
}

/**
 * Authoritative score (sum of XP for every completed level) for a tracked
 * game. Returns null when the game has no points table, so callers can fall
 * back to the client-provided score for untracked games.
 */
export function scoreForCompleted(
  gameSlug: string,
  completed: Record<string, boolean>
): number | null {
  const byId = GAME_LEVEL_POINTS_BY_ID[gameSlug];
  if (byId) {
    let sum = 0;
    for (const [key, found] of Object.entries(completed)) {
      if (found === true) {
        const pts = byId[Number(key)];
        if (pts !== undefined) sum += pts;
      }
    }
    return sum;
  }
  const points = GAME_LEVEL_POINTS[gameSlug];
  if (!points) return null;
  return points.reduce(
    (sum, pts, idx) => sum + (completed[String(idx)] === true ? pts : 0),
    0
  );
}
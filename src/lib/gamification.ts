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
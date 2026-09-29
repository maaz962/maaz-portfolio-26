import type {
  AdminLeaderboardRow,
  AdminLeaderboardSortKey,
  Gamification,
  GameProgress,
  LeaderboardEntry,
  User,
} from "@/types";
import { levelForXp } from "./gamification";

/**
 * Leaderboard arithmetic shared by every read path.
 *
 * The XP total, the public ranking and the hidden set were each written out
 * separately in the file backend for the overview, the rank lookup and the
 * admin list. Three copies of "sum the scores, add the admin offset, drop the
 * hidden" is three chances for the admin view to disagree with what the public
 * board shows, so it is computed once here.
 *
 * Postgres does the same work in SQL; this module is the file backend's
 * equivalent and defines the semantics both must match.
 *
 * `hiddenUsernames` is expected to be lowercased and is matched against the
 * lowercased username, because the SQL side compares with LOWER() and a
 * case-sensitive comparison here would let "Test4" onto the file store's board
 * while Postgres hid it.
 */
export interface Standing {
  /** 1-based public rank; null when the account is not on the public board. */
  rank: number | null;
  user: Pick<User, "id" | "name" | "username" | "avatarUrl">;
  totalXp: number;
  level: number;
  gamesPlayed: number;
  currentStreak: number;
  createdAt: string;
  /** Excluded from the public board, by flag or by hard-excluded username. */
  hidden: boolean;
}

export function buildStandings({
  users,
  gameProgress,
  gamification,
  hiddenUsernames,
}: {
  users: User[];
  gameProgress: GameProgress[];
  gamification: Gamification[];
  hiddenUsernames: ReadonlySet<string>;
}): Standing[] {
  const progressByUser = new Map<string, GameProgress[]>();
  for (const row of gameProgress) {
    const list = progressByUser.get(row.userId);
    if (list) list.push(row);
    else progressByUser.set(row.userId, [row]);
  }
  const gamificationByUser = new Map(gamification.map((g) => [g.userId, g]));

  const standings = users
    .filter((u) => !u.isAdmin)
    .map((u) => {
      const rows = progressByUser.get(u.id) ?? [];
      const stored = gamificationByUser.get(u.id);
      // A hidden flag is unconditional. It used to stop applying at 100 XP so
      // QA accounts could not leave the board empty, but the admin UI calls
      // this "hide from leaderboard" and promises the player disappears — a
      // flag that leaks at a higher score is worse than no flag. The hard
      // username exclusion is folded in so the admin view can show *why* an
      // account is absent from the public board.
      const hidden =
        Boolean(u.hiddenFromLeaderboard) || hiddenUsernames.has(u.username.toLowerCase());
      const totalXp =
        rows.reduce((sum, p) => sum + (p.score || 0), 0) + (stored?.xpAdjustment ?? 0);
      return {
        rank: null as number | null,
        user: { id: u.id, name: u.name, username: u.username, avatarUrl: u.avatarUrl },
        totalXp,
        level: levelForXp(totalXp),
        gamesPlayed: new Set(rows.map((p) => p.gameSlug)).size,
        currentStreak: stored?.currentStreak ?? 0,
        createdAt: u.createdAt,
        hidden,
      };
    });

  // Public ranking: XP descending, oldest account first on a tie. Rank is
  // assigned only to accounts that are actually on the public board, so a
  // hidden account never consumes a rank and the numbers below it stay true.
  const publicOrder = standings
    .filter((s) => !s.hidden)
    .sort((a, b) => b.totalXp - a.totalXp || a.createdAt.localeCompare(b.createdAt));
  publicOrder.forEach((s, i) => {
    s.rank = i + 1;
  });

  return standings;
}

export function standingToEntry(s: Standing): LeaderboardEntry {
  return {
    rank: s.rank ?? 0,
    user: s.user,
    totalXp: s.totalXp,
    level: s.level,
    gamesPlayed: s.gamesPlayed,
    currentStreak: s.currentStreak,
  };
}

export function standingToAdminRow(s: Standing): AdminLeaderboardRow {
  return {
    rank: s.rank,
    user: s.user,
    totalXp: s.totalXp,
    level: s.level,
    gamesPlayed: s.gamesPlayed,
    currentStreak: s.currentStreak,
    hidden: s.hidden,
  };
}

/**
 * The minimum shape `sortStandings` needs, so it can order both a full
 * `Standing` and the slimmer `AdminLeaderboardRow` (which omits `createdAt`).
 */
export interface SortableStanding {
  rank: number | null;
  totalXp: number;
  currentStreak: number;
  hidden: boolean;
  user: { id: string; name: string; username: string };
}

/**
 * Orders standings for the admin table.
 *
 * `rank` reproduces the public board — ranked accounts first in rank order,
 * hidden accounts sunk to the bottom — because that is the question "what does
 * the public see?" asks. Every other key sorts the whole set, hidden accounts
 * included, because that is the question "where does this player actually
 * stand?" asks, and interleaving them there is the point.
 */
export function sortStandings<T extends SortableStanding>(
  rows: T[],
  sort: AdminLeaderboardSortKey,
  direction: "asc" | "desc"
): T[] {
  const sign = direction === "asc" ? 1 : -1;

  if (sort === "rank") {
    return [...rows].sort((a, b) => {
      if (a.hidden !== b.hidden) return a.hidden ? 1 : -1;
      if (a.hidden) return sign * (b.totalXp - a.totalXp);
      return sign * ((a.rank ?? 0) - (b.rank ?? 0));
    });
  }

  const collator = new Intl.Collator("en", { sensitivity: "base" });

  return [...rows].sort((a, b) => {
    let delta: number;
    if (sort === "name") delta = collator.compare(a.user.name, b.user.name);
    else if (sort === "streak") delta = a.currentStreak - b.currentStreak;
    else delta = a.totalXp - b.totalXp;
    // Ties fall back to rank and then id so paging is stable: without a total
    // order, two equal-XP rows can swap between pages and the same player
    // appears on two of them.
    if (delta === 0) {
      delta =
        (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER);
    }
    if (delta === 0) delta = a.user.id.localeCompare(b.user.id);
    return sign * delta;
  });
}

/** Case-insensitive substring match on name or username. */
export function matchesPlayerQuery(
  row: Pick<Standing, "user">,
  query: string
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    row.user.name.toLowerCase().includes(needle) ||
    row.user.username.toLowerCase().includes(needle)
  );
}

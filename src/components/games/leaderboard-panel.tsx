"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Medal, Sparkles, Trophy, TrendingUp, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry, LeaderboardSnapshot } from "@/types";

interface Props {
  currentUserId: string | null;
  onSignIn: () => void;
  onPlayGame: () => void;
}

/** Mirrors BOARD_SIZE in the API route. Only used to size copy before the
 *  first response lands; everything after that comes from `snapshot.limit`. */
const DEFAULT_LIMIT = 10;

/**
 * Below this many rows a short board stops reading as a bug.
 *
 * The hardcoded "Top 10" subtitle was the real problem: three rows under a
 * heading that promised ten looks like a failed request, because to a visitor
 * it is indistinguishable from one. A heading sized to the actual count plus a
 * line about how much room is left turns the same data into an opening.
 */
const SPARSE_THRESHOLD = 5;

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-sm">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-300/20 text-xs">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-xs">
        🥉
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-xs font-bold text-muted">
      {rank}
    </span>
  );
}

/**
 * One row of the board.
 *
 * `isMe` gets a real border, not just a tint, so the viewer's own line is
 * findable while scrolling rather than only on a careful read. The transparent
 * border on every other row is what keeps the highlighted row from changing
 * height and shifting the list.
 */
function LeaderboardRow({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  return (
    <li
      data-you={isMe || undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-2.5 py-2.5 transition-colors",
        isMe
          ? "border-primary/40 bg-primary/[0.07] shadow-sm"
          : "border-transparent hover:bg-background-secondary/50"
      )}
    >
      <RankBadge rank={entry.rank} />
      <Avatar
        seed={entry.user.id || entry.user.username}
        name={entry.user.name}
        className="h-8 w-8 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">
          {entry.user.name}
          {isMe && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-primary px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              You
            </span>
          )}
        </p>
        <p className="truncate text-xs text-muted">
          @{entry.user.username}
          {entry.currentStreak > 0 && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
              <Flame className="h-2.5 w-2.5" />
              {entry.currentStreak}d
            </span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
          Lv {entry.level}
        </span>
        <span className="mt-0.5 text-xs font-semibold text-foreground">
          {entry.totalXp.toLocaleString()} XP
        </span>
      </div>
    </li>
  );
}

export function LeaderboardPanel({ currentUserId, onSignIn, onPlayGame }: Props) {
  const [snapshot, setSnapshot] = useState<LeaderboardSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadLeaderboard = async () => {
      try {
        const res = await fetch("/api/games/leaderboard", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setSnapshot({
          entries: Array.isArray(data?.entries) ? data.entries : [],
          limit: typeof data?.limit === "number" ? data.limit : DEFAULT_LIMIT,
          myRank: data?.myRank ?? null,
          myEntry: data?.myEntry ?? null,
        });
      } catch {
        if (!cancelled) {
          setSnapshot({
            entries: [],
            limit: DEFAULT_LIMIT,
            myRank: null,
            myEntry: null,
          });
        }
      }
    };

    const refreshLeaderboard = () => {
      if (document.visibilityState === "visible") {
        void loadLeaderboard();
      }
    };

    void loadLeaderboard();
    const interval = window.setInterval(refreshLeaderboard, 10000);
    window.addEventListener("focus", refreshLeaderboard);
    document.addEventListener("visibilitychange", refreshLeaderboard);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshLeaderboard);
      document.removeEventListener("visibilitychange", refreshLeaderboard);
    };
  }, [currentUserId]);

  const limit = snapshot?.limit ?? DEFAULT_LIMIT;

  /**
   * The board plus, defensively, the viewer's own row.
   *
   * The API now derives `entries` and `myEntry` from one standings snapshot, so
   * a ranked viewer is inside the cut by construction. This splice is the
   * client-side half of that guarantee: a response from a stale deploy, or one
   * where the rank and the rows were computed a moment apart, would otherwise
   * put "You are #4" above a list with no #4 in it. Better to show the row in
   * slightly the wrong place than to contradict the rank beside it.
   */
  const rows = useMemo(() => {
    if (!snapshot) return [];
    const merged = [...snapshot.entries];
    const { myEntry } = snapshot;
    if (
      currentUserId &&
      myEntry &&
      myEntry.rank <= limit &&
      !merged.some((e) => e.user.id === currentUserId)
    ) {
      merged.push(myEntry);
    }
    return merged.sort((a, b) => a.rank - b.rank);
  }, [snapshot, currentUserId, limit]);

  const isLoading = snapshot === null;
  const count = rows.length;

  /** True when the viewer's row is one of the rows on screen. */
  const amOnBoard = rows.some((e) => e.user.id === currentUserId);

  /**
   * Ranked but below the cut — the only case that still needs a summary row.
   *
   * Resolved to an object rather than a boolean so the rank and the entry are
   * narrowed together at the point of construction; a `boolean` flag leaves
   * every later `snapshot.myRank` read as `number | null`.
   */
  const belowCut =
    !amOnBoard &&
    snapshot?.myEntry &&
    snapshot.myRank != null &&
    snapshot.myRank > limit
      ? { rank: snapshot.myRank, entry: snapshot.myEntry }
      : null;

  /**
   * The gap to the cut, in XP, taken from the last visible row.
   *
   * "You are #15" is a fact; "1,240 XP behind #10" is a next step. The
   * comparison is `+ 1` because ties break on account age, so matching the
   * cutoff's total is not enough to pass it.
   */
  const cutoff = rows[rows.length - 1];
  const xpGap =
    belowCut && cutoff ? cutoff.totalXp - belowCut.entry.totalXp + 1 : null;

  const heading = (() => {
    if (isLoading || count === 0) return "Players ranked by XP";
    if (count >= limit) return `Top ${limit} players ranked by XP`;
    return `Top ${count} ${count === 1 ? "player" : "players"} ranked by XP`;
  })();

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold text-foreground">
              Leaderboard
            </h2>
            <p className="text-xs text-muted">{heading}</p>
          </div>
        </div>
        {/* Only shown when the row is NOT on the board. With the row in the list
            and tinted, a second copy of the same number in the header is noise
            that also implies the list does not contain it. */}
        {snapshot?.myRank != null && !amOnBoard && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Medal className="h-3 w-3" />
            You are #{snapshot.myRank}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-xl bg-background-secondary/70"
            />
          ))}
        </div>
      ) : count === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-border bg-background-secondary/40 p-6 text-center">
          <Trophy className="h-8 w-8 text-muted" />
          <p className="mt-2.5 text-xs font-semibold text-foreground">
            No scores yet
          </p>
          <p className="mt-1 text-xs text-muted">
            Be the first to earn XP and take the #1 spot!
          </p>
          <button
            onClick={onPlayGame}
            className={buttonStyles({
              size: "sm",
              variant: "primary",
              className: "mt-3.5",
            })}
          >
            Play a game
          </button>
        </div>
      ) : (
        <ol className="mt-4 space-y-1.5">
          {rows.map((entry) => (
            <LeaderboardRow
              key={entry.user.id}
              entry={entry}
              isMe={currentUserId !== null && entry.user.id === currentUserId}
            />
          ))}
        </ol>
      )}

      {/* Ranked but below the cut: name the distance, not just the number. */}
      {belowCut && (
        <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5">
          <TrendingUp className="mt-px h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-foreground">
            <span className="font-semibold">You are #{belowCut.rank},</span>{" "}
            <span className="text-muted">
              {belowCut.rank - limit}{" "}
              {belowCut.rank - limit === 1 ? "place" : "places"} outside the
              top {limit}.
            </span>{" "}
            {xpGap != null && xpGap > 0 && (
              <span className="text-muted">
                Earn {xpGap.toLocaleString()} more XP to pass #{cutoff?.rank}.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Sparse board. Says out loud that a short list is an early stage, so it
          reads as room rather than as a request that came back short. */}
      {!isLoading && count > 0 && count < SPARSE_THRESHOLD && (
        <p className="mt-3.5 flex items-start gap-2 rounded-xl border border-dashed border-border bg-background-secondary/40 px-3 py-2.5 text-xs text-muted">
          <Sparkles className="mt-px h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            {count === 1
              ? "You're the first player on the board. The top is wide open."
              : `Only ${count} players have started climbing, so the top ${limit} is wide open.`}
          </span>
        </p>
      )}

      {!currentUserId && !isLoading && (
        <div className="mt-4 border-t border-border/50 pt-4">
          <button
            onClick={onSignIn}
            className={buttonStyles({
              size: "sm",
              className:
                "w-full bg-gradient-to-r from-primary to-[hsl(var(--games-accent))]",
            })}
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
            Sign in to earn XP and take your spot
          </button>
        </div>
      )}
    </motion.section>
  );
}

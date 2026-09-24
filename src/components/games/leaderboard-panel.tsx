"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Medal, Trophy, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

interface Props {
  currentUserId: string | null;
  onSignIn: () => void;
  onPlayGame: () => void;
}

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

export function LeaderboardPanel({ currentUserId, onSignIn, onPlayGame }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);

  const isInTopList =
    currentUserId !== null &&
    myRank !== null &&
    entries?.some((e) => e.user.id === currentUserId);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/games/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setEntries(Array.isArray(d?.entries) ? d.entries : []);
        setMyRank(d?.myRank ?? null);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

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
            <p className="text-xs text-muted">
              Top 10 players ranked by XP
            </p>
          </div>
        </div>
        {currentUserId && isInTopList && (
          <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Medal className="h-3 w-3" />
            You are #{myRank}
          </span>
        )}
      </div>

      {entries === null ? (
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-xl bg-background-secondary/70"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
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
          {entries.map((e) => {
            const isMe = currentUserId !== null && e.user.id === currentUserId;
            return (
              <li
                key={e.user.id}
className={cn(
  "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors",
                  isMe
                    ? "border border-primary/25 bg-primary/5"
                    : "hover:bg-background-secondary/50"
                )}
              >
                <RankBadge rank={e.rank} />
                <Avatar
                  seed={e.user.id || e.user.username}
                  name={e.user.name}
                  className="h-8 w-8 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {e.user.name}
                    {isMe && (
                      <span className="ml-1.5 text-xs font-medium text-primary">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted">
                    @{e.user.username}
                    {e.currentStreak > 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                        <Flame className="h-2.5 w-2.5" />
                        {e.currentStreak}d
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                    Lv {e.level}
                  </span>
                  <span className="mt-0.5 text-xs font-semibold text-foreground">
                    {e.totalXp.toLocaleString()} XP
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {!currentUserId && entries !== null && (
        <div className="mt-4 border-t border-border/50 pt-4">
          <button
            onClick={onSignIn}
            className={buttonStyles({
              size: "sm",
              className:
                "w-full bg-gradient-to-r from-primary to-violet-600",
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
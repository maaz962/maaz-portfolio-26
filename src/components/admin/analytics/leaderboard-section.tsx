"use client";

import { Loader2, Trash2, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/types";
import { EmptyState } from "@/components/admin/empty-state";
import type { DeletableUser } from "./use-admin-data";

export interface LeaderboardSectionProps {
  leaderboard: LeaderboardEntry[];
  busy: string | null;
  adjustXp: (id: string, delta: number) => Promise<void>;
  removeUser: (user: DeletableUser) => Promise<void>;
}

/** Fixed XP steps. Deduct and award are toned differently on purpose. */
const XP_STEPS = [-100, -10, 10, 100] as const;

export function LeaderboardSection({
  leaderboard,
  busy,
  adjustXp,
  removeUser,
}: LeaderboardSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Trophy className="h-4 w-4 text-primary" strokeWidth={1.75} /> Games Leaderboard
        </h3>
        {leaderboard.length > 0 && (
          <span className="text-sm text-muted">Adjust player XP or remove them</span>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <EmptyState
          compact
          icon={Trophy}
          title="No players on the leaderboard yet"
          description="Entries appear as soon as a registered user completes their first game."
        />
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const xpBusy = busy === `${entry.user.id}:xp`;
            const delBusy = busy === `${entry.user.id}:del`;
            return (
              <div
                key={entry.user.id}
                className="rounded-xl border border-border bg-background-secondary/30 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-mono w-6 shrink-0 text-center text-sm font-semibold text-muted">
                      #{entry.rank}
                    </span>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {entry.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {entry.user.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Lv {entry.level}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted">
                        @{entry.user.username} &middot; {entry.gamesPlayed} games &middot; streak{" "}
                        {entry.currentStreak}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {xpBusy && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                    <span className="text-mono mr-1 text-base font-semibold text-foreground">
                      {entry.totalXp} XP
                    </span>
                    {XP_STEPS.map((step) => (
                      <button
                        key={step}
                        onClick={() => adjustXp(entry.user.id, step)}
                        disabled={busy !== null}
                        className={`rounded-full border px-2.5 py-1 text-mono text-xs font-medium transition-colors disabled:opacity-50 ${
                          step > 0
                            ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                            : "border-border bg-card text-muted hover:border-red-500/40 hover:text-red-500"
                        }`}
                        title={step > 0 ? `Award ${step} XP` : `Deduct ${Math.abs(step)} XP`}
                      >
                        {step > 0 ? `+${step}` : step}
                      </button>
                    ))}
                    <button
                      onClick={() => removeUser(entry.user)}
                      disabled={busy !== null}
                      aria-label={`Delete @${entry.user.username}`}
                      title={`Delete @${entry.user.username}`}
                      className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {delBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

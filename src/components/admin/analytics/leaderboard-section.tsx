"use client";

import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { AdminTable, type AdminColumn, type AdminSort } from "@/components/admin/admin-table";
import type { LeaderboardEntry } from "@/types";

export interface LeaderboardSectionProps {
  leaderboard: LeaderboardEntry[];
  sort: AdminSort;
  onSortChange: (sort: AdminSort) => void;
}

/**
 * Read-only standings.
 *
 * XP adjustments and deletes used to sit here as bare icon buttons, duplicating
 * the same irreversible action in two places with two different styles and no
 * confirmation. Both moved to `/admin/users/[id]`, so this panel is now purely
 * "look, sort, and go to the user's page" — which is also the only place a
 * leaderboard belongs.
 */
export function LeaderboardSection({ leaderboard, sort, onSortChange }: LeaderboardSectionProps) {
  const columns = useMemo<AdminColumn<LeaderboardEntry>[]>(
    () => [
      {
        key: "rank",
        header: "#",
        className: "w-12 text-center",
        sortable: true,
        defaultDirection: "asc",
        render: (entry) => (
          <span className="text-mono text-sm text-muted">#{entry.rank}</span>
        ),
      },
      {
        key: "player",
        header: "Player",
        sortable: true,
        defaultDirection: "asc",
        render: (entry) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{entry.user.name}</p>
            <p className="truncate text-sm text-muted">@{entry.user.username}</p>
          </div>
        ),
      },
      {
        key: "level",
        header: "Level",
        hideBelow: "sm",
        sortable: true,
        defaultDirection: "desc",
        className: "whitespace-nowrap",
        render: (entry) => (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Lv {entry.level}
          </span>
        ),
      },
      {
        key: "games",
        header: "Games",
        hideBelow: "lg",
        sortable: true,
        defaultDirection: "desc",
        className: "text-right",
        render: (entry) => <span className="text-mono text-sm text-muted">{entry.gamesPlayed}</span>,
      },
      {
        key: "streak",
        header: "Streak",
        hideBelow: "lg",
        sortable: true,
        defaultDirection: "desc",
        className: "text-right whitespace-nowrap",
        render: (entry) => (
          <span className="text-mono text-sm text-muted">{entry.currentStreak}d</span>
        ),
      },
      {
        key: "xp",
        header: "XP",
        sortable: true,
        defaultDirection: "desc",
        className: "text-right whitespace-nowrap",
        render: (entry) => (
          <span className="text-mono text-base font-semibold text-foreground">
            {entry.totalXp.toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Trophy className="h-4 w-4 text-primary" strokeWidth={1.75} /> Games Leaderboard
        </h2>
        <p className="text-sm text-muted">
          Read-only &middot; open a player to change their XP or visibility
        </p>
      </div>

      <AdminTable<LeaderboardEntry>
        caption="Games leaderboard"
        columns={columns}
        rows={leaderboard}
        getRowKey={(entry) => entry.user.id}
        sort={sort}
        onSortChange={onSortChange}
        emptyColSpan={columns.length}
        rowHref={(entry) => `/admin/users/${entry.user.id}`}
        empty={
          <EmptyState
            icon={Trophy}
            title="No players on the leaderboard yet"
            description="Entries appear as soon as a registered user completes their first game."
          />
        }
      />
    </section>
  );
}

/** Rank order by default: highest XP first, matching the public leaderboard. */
export const DEFAULT_LEADERBOARD_SORT: AdminSort = { key: "rank", direction: "asc" };

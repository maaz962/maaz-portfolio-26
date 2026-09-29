"use client";

import { useEffect, useMemo } from "react";
import { EyeOff, RefreshCw, Search, Trophy, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { adminSearchStyles } from "@/components/admin/admin-field";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import {
  AdminPagination,
  AdminTable,
  type AdminColumn,
  type AdminSort,
} from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { ToastProvider, useToast } from "@/components/admin/toast";
import { useLeaderboard } from "./use-leaderboard";
import type { AdminLeaderboardRow } from "@/types";

/**
 * `/admin/leaderboard` — the full player standings, paged on the server.
 *
 * This used to be an unbounded list at the bottom of the Overview page, which
 * rendered up to 1,000 rows every time an admin opened the dashboard. It has
 * its own route and its own endpoint now, so the Overview stays a summary and
 * the standings cost one page per request.
 *
 * Rows link to `/admin/users/[id]` for any change; nothing here mutates.
 */
export function LeaderboardView() {
  return (
    <ToastProvider>
      <LeaderboardPage />
    </ToastProvider>
  );
}

function LeaderboardPage() {
  const {
    data,
    loading,
    loaded,
    feedback,
    query,
    sort,
    page,
    pageSize,
    setQuery,
    setSort,
    setPage,
    setPageSize,
    refresh,
  } = useLeaderboard();

  const { notify } = useToast();

  useEffect(() => {
    if (feedback) notify(feedback.message, feedback.variant);
  }, [feedback, notify]);

  const columns = useMemo<AdminColumn<AdminLeaderboardRow>[]>(
    () => [
      {
        key: "rank",
        header: "#",
        className: "w-16 text-center",
        sortable: true,
        defaultDirection: "asc",
        render: (row) =>
          row.rank === null ? (
            // A hidden account is not on the public board, so it has no rank.
            // Showing a number here would imply otherwise.
            <span className="text-sm text-muted/60" title="Not on the public leaderboard">
              &mdash;
            </span>
          ) : (
            <span className="text-mono text-sm text-muted">#{row.rank}</span>
          ),
      },
      {
        key: "name",
        header: "Player",
        sortable: true,
        defaultDirection: "asc",
        render: (row) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{row.user.name}</p>
              <p className="truncate text-sm text-muted">@{row.user.username}</p>
            </div>
            {row.hidden && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted/10 px-2 py-0.5 text-xs font-medium text-muted">
                <EyeOff className="h-3 w-3" strokeWidth={2} />
                Hidden
              </span>
            )}
          </div>
        ),
      },
      {
        key: "level",
        header: "Level",
        hideBelow: "sm",
        className: "whitespace-nowrap text-center",
        render: (row) => (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Lv {row.level}
          </span>
        ),
      },
      {
        key: "games",
        header: "Games",
        hideBelow: "lg",
        className: "text-right",
        render: (row) => <span className="text-mono text-sm text-muted">{row.gamesPlayed}</span>,
      },
      {
        key: "streak",
        header: "Streak",
        sortable: true,
        defaultDirection: "desc",
        hideBelow: "md",
        className: "text-right whitespace-nowrap",
        render: (row) => <span className="text-mono text-sm text-muted">{row.currentStreak}d</span>,
      },
      {
        key: "xp",
        header: "XP",
        sortable: true,
        defaultDirection: "desc",
        className: "text-right whitespace-nowrap",
        render: (row) => (
          <span className="text-mono text-base font-semibold text-foreground">
            {row.totalXp.toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  const rows = data?.rows ?? [];
  const searching = query.trim().length > 0;
  const hiddenCount = data?.hiddenCount ?? 0;

  return (
    <AdminPage>
      <AdminPageHeader
        icon={Trophy}
        title="Leaderboard"
        description="All players, ranked as the public board sees them"
        actions={
          <button
            onClick={refresh}
            disabled={loading}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or username"
            aria-label="Search leaderboard"
            className={adminSearchStyles()}
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>

        <p className="text-sm whitespace-nowrap text-muted">
          <span className="text-foreground">{data?.total ?? 0}</span> players
          {hiddenCount > 0 && (
            <>
              {" · "}
              <span className="text-foreground">{hiddenCount}</span> hidden
            </>
          )}
        </p>
      </div>

      <AdminTable<AdminLeaderboardRow>
        caption="All players by XP"
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.user.id}
        rowHref={(row) => `/admin/users/${row.user.id}`}
        sort={sort}
        onSortChange={setSort as (next: AdminSort) => void}
        loading={!loaded}
        emptyColSpan={columns.length}
        empty={
          searching ? (
            <EmptyState
              icon={Search}
              title={`No players match "${query.trim()}"`}
              description="Try a different name or username, or clear the search to see everyone."
            />
          ) : (
            <EmptyState
              icon={Trophy}
              title="No players yet"
              description="Standings appear here as soon as a registered user completes a game."
            />
          )
        }
      />

      <AdminPagination
        page={data?.page ?? page}
        pageCount={data?.pageCount ?? 1}
        pageSize={pageSize}
        total={data?.total ?? 0}
        itemNoun="players"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </AdminPage>
  );
}

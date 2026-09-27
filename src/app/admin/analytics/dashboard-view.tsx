"use client";

import { Shield, RefreshCw } from "lucide-react";
import { useAdminData } from "./use-admin-data";
import { OverviewSection } from "./overview-section";
import { EventsSection } from "./events-section";
import { LogsSection } from "./logs-section";
import { UsersSection } from "./users-section";
import { LeaderboardSection } from "./leaderboard-section";

/**
 * Composition of the moved sections, in their original top-to-bottom order.
 * The header and the error/notice banners are the former component's own
 * blocks, moved verbatim; the panels themselves live in sibling files now.
 */
export function DashboardView() {
  const {
    stats,
    logs,
    users,
    leaderboard,
    loading,
    error,
    notice,
    busy,
    expandedLog,
    setExpandedLog,
    fetchData,
    fetchLeaderboard,
    adjustXp,
    removeUser,
  } = useAdminData();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">Analytics Dashboard</h1>
              <p className="text-xs text-muted">Portfolio visitor tracking &amp; event logs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchData();
                fetchLeaderboard();
              }}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {notice && !error && (
          <p className="text-sm text-green-600 dark:text-green-400">{notice}</p>
        )}

        <OverviewSection stats={stats} />
        <EventsSection stats={stats} />
        <LogsSection logs={logs} expandedLog={expandedLog} setExpandedLog={setExpandedLog} />
        <UsersSection users={users} busy={busy} removeUser={removeUser} />
        <LeaderboardSection
          leaderboard={leaderboard}
          busy={busy}
          adjustXp={adjustXp}
          removeUser={removeUser}
        />
      </div>
    </div>
  );
}

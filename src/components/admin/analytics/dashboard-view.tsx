"use client";

import { useEffect } from "react";
import { RefreshCw, ServerCrash, Shield } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { ToastProvider, useToast } from "@/components/admin/toast";
import {
  BarChartSkeleton,
  ErrorState,
  PanelSkeleton,
  StatCardSkeleton,
} from "@/components/admin/skeleton";
import { useAdminData } from "./use-admin-data";
import { OverviewSection } from "./overview-section";
import { EventsSection } from "./events-section";
import { LogsSection } from "./logs-section";
import { UsersSection } from "./users-section";
import { LeaderboardSection } from "./leaderboard-section";

/**
 * `/admin` — the Overview route.
 *
 * Layout intent: a read-only analytics snapshot up top, then the user and
 * leaderboard panels that still live on this page and move to their own routes
 * in the next migration steps.
 *
 * Content width is `max-w-content`, the token the public site uses. The Users /
 * Leaderboard / Logs routes land on it too, so no admin page ends up wider or
 * narrower than this one for no reason.
 */
export function DashboardView() {
  return (
    <ToastProvider>
      <OverviewPage />
    </ToastProvider>
  );
}

function OverviewPage() {
  const {
    stats,
    logs,
    users,
    leaderboard,
    loading,
    loaded,
    leaderboardLoaded,
    feedback,
    busy,
    expandedLog,
    setExpandedLog,
    fetchData,
    fetchLeaderboard,
    adjustXp,
    removeUser,
  } = useAdminData();

  const { notify } = useToast();

  // Feedback is surfaced as toasts rather than text pinned above the fold:
  // most actions happen in panels far down the page, where a top banner is
  // off-screen.
  useEffect(() => {
    if (feedback) notify(feedback.message, feedback.variant);
  }, [feedback, notify]);

  // `stats` still being null once the request has settled means the analytics
  // fetch failed — different from "loaded fine, zero visitors".
  const analyticsFailed = loaded && !stats;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-content space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">Overview</h1>
              <p className="text-sm text-muted">Portfolio visitor tracking &amp; event logs</p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchData();
              fetchLeaderboard();
            }}
            disabled={loading}
            className={buttonStyles({ variant: "outline", size: "sm", className: "rounded-xl" })}
          >
            <RefreshCw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              strokeWidth={1.75}
            />
            Refresh
          </button>
        </header>

        {analyticsFailed ? (
          <ErrorState
            icon={ServerCrash}
            title="Could not load analytics"
            description="The analytics request failed. This is usually a temporary database or network problem."
            onRetry={fetchData}
          />
        ) : (
          <>
            {loaded && stats ? (
              <OverviewSection stats={stats} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <BarChartSkeleton />
                  <BarChartSkeleton />
                  <BarChartSkeleton />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <PanelSkeleton rows={4} titleWidth="w-40" />
                  <PanelSkeleton rows={2} titleWidth="w-36" />
                </div>
              </>
            )}

            {loaded && stats ? (
              <EventsSection stats={stats} />
            ) : (
              <PanelSkeleton rows={5} titleWidth="w-32" />
            )}

            {loaded ? (
              <LogsSection logs={logs} expandedLog={expandedLog} setExpandedLog={setExpandedLog} />
            ) : (
              <PanelSkeleton rows={4} titleWidth="w-36" />
            )}

            {loaded ? (
              <UsersSection users={users} busy={busy} removeUser={removeUser} />
            ) : (
              <PanelSkeleton rows={4} titleWidth="w-40" />
            )}
          </>
        )}

        {leaderboardLoaded ? (
          <LeaderboardSection
            leaderboard={leaderboard}
            busy={busy}
            adjustXp={adjustXp}
            removeUser={removeUser}
          />
        ) : (
          <PanelSkeleton rows={5} titleWidth="w-44" />
        )}
      </div>
    </div>
  );
}

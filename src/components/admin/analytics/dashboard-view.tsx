"use client";

import { useEffect } from "react";
import { RefreshCw, ServerCrash, Shield } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
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

/**
 * `/admin` — the Overview route.
 *
 * Deliberately a summary now. The leaderboard used to be rendered here as one
 * unbounded list, which made opening the dashboard cost a 1,000-row request and
 * buried the visitor analytics it exists to summarise; it lives at
 * `/admin/leaderboard` now, paged on the server. Nothing on this page is
 * derived from the leaderboard, so removing it changed no numbers here.
 */
export function DashboardView() {
  return (
    <ToastProvider>
      <OverviewPage />
    </ToastProvider>
  );
}

function OverviewPage() {
  const { stats, logs, loading, loaded, feedback, expandedLog, setExpandedLog, fetchData } =
    useAdminData();

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
    <AdminPage>
      <AdminPageHeader
        icon={Shield}
        title="Overview"
        description="Portfolio visitor tracking & event logs"
        actions={
          <button
            onClick={fetchData}
            disabled={loading}
            className={buttonStyles({ variant: "outline", size: "sm", className: "rounded-xl" })}
          >
            <RefreshCw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              strokeWidth={1.75}
            />
            Refresh
          </button>
        }
      />

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
        </>
      )}
    </AdminPage>
  );
}

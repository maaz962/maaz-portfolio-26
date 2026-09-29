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

/**
 * `/admin` — the Overview route.
 *
 * Deliberately a summary now. Two heavy lists used to live here:
 *
 * - the leaderboard, as one unbounded list, which made opening the dashboard
 *   cost a 1,000-row request; it is at `/admin/leaderboard`, paged on the server
 * - the visitor logs, as the newest 100 rows inline in the analytics response;
 *   they are at `/admin/logs`, paged on the server
 *
 * Nothing on this page is derived from either, so removing them changed no
 * numbers here. "Recent Events" stays because it is a different thing: a
 * lightweight tail of `stats.recentActivity`, not a paginated log list.
 */
export function DashboardView() {
  return (
    <ToastProvider>
      <OverviewPage />
    </ToastProvider>
  );
}

function OverviewPage() {
  const { stats, loading, loaded, feedback, fetchData } = useAdminData();

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
              className={buttonStyles({ variant: "outline", size: "sm" })}
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
                <PanelSkeleton rows={2} titleWidth="w-36" />
              </div>
            </>
          )}

          {loaded && stats ? (
            <EventsSection stats={stats} />
          ) : (
            <PanelSkeleton rows={5} titleWidth="w-32" />
          )}
        </>
      )}
    </AdminPage>
  );
}

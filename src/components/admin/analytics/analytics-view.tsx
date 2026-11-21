"use client";

import { useEffect } from "react";
import { BarChart3, Globe2, RefreshCw, ServerCrash } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import { AdminCard } from "@/components/admin/admin-card";
import { EmptyState } from "@/components/admin/empty-state";
import { ToastProvider, useToast } from "@/components/admin/toast";
import {
  BarChartSkeleton,
  ErrorState,
  PanelSkeleton,
  StatCardSkeleton,
} from "@/components/admin/skeleton";
import { useAdminData } from "./use-admin-data";
import { BarChart } from "./bar-chart";
import { StatCard } from "./stat-card";
import { GrowthChart } from "./growth-chart";

/**
 * `/admin/analytics` — the deep-dive page.
 *
 * Growth charts are on the Overview (the "how are we doing?" question). This
 * page answers "where did they come from and what did they use?", so it owns
 * the breakdowns that used to be stacked under the KPIs on the dashboard.
 */
export function AnalyticsView() {
  return (
    <ToastProvider>
      <AnalyticsPage />
    </ToastProvider>
  );
}

function AnalyticsPage() {
  const { stats, loading, loaded, feedback, fetchData } = useAdminData();
  const { notify } = useToast();

  useEffect(() => {
    if (feedback) notify(feedback.message, feedback.variant);
  }, [feedback, notify]);

  const failed = loaded && !stats;

  return (
    <AdminPage>
      <AdminPageHeader
        icon={BarChart3}
        title="Analytics"
        description="Traffic sources, audience and engagement breakdowns"
        actions={
          <button
            type="button"
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

      {failed ? (
        <ErrorState
          icon={ServerCrash}
          title="Could not load analytics"
          description="The analytics request failed. This is usually a temporary database or network problem."
          onRetry={fetchData}
        />
      ) : !loaded || !stats ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <BarChartSkeleton key={i} />
            ))}
          </div>
          <PanelSkeleton rows={4} titleWidth="w-40" />
        </>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Globe2} label="Visits" value={stats.totalVisitors} />
            <StatCard icon={BarChart3} label="Unique IPs" value={stats.uniqueIPs} />
            <StatCard icon={BarChart3} label="Events" value={stats.totalEvents} />
            <StatCard icon={Globe2} label="Referrers" value={stats.topReferrers.length} />
          </div>

          {/* Growth is repeated here in compact form so the breakdown page can
              be read without bouncing back to the Overview. The data is from
              the same request; there is no extra fetch. */}
          <GrowthChart
            title="Visits over time"
            description="Daily visits and signups (last 14 days, UTC)"
            data={stats.dailyGrowth}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BarChart
              title="Browsers"
              data={stats.browsers.map((b) => ({ label: b.name, value: b.count }))}
            />
            <BarChart
              title="Devices"
              data={stats.devices.map((d) => ({ label: d.name, value: d.count }))}
            />
            <BarChart
              title="Top Pages"
              data={stats.topPages.map((p) => ({ label: p.page, value: p.count }))}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AdminCard>
              <h3 className="mb-4 text-base font-semibold text-foreground">Top Referrers</h3>
              {stats.topReferrers.length > 0 ? (
                <div className="space-y-2">
                  {stats.topReferrers.slice(0, 10).map((ref) => (
                    <div
                      key={ref.referrer}
                      className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary/50 px-3 py-2.5"
                    >
                      <span className="truncate text-sm text-foreground" title={ref.referrer}>
                        {ref.referrer}
                      </span>
                      <span className="text-mono text-sm text-muted">{ref.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={Globe2}
                  title="No referrers yet"
                  description="Visits that arrive from another site will be listed here."
                />
              )}
            </AdminCard>

            <AdminCard>
              <h3 className="mb-4 text-base font-semibold text-foreground">Visitor Locations</h3>
              {stats.locations.length > 0 ? (
                <div className="space-y-2">
                  {stats.locations.slice(0, 10).map((loc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary/50 px-3 py-2.5"
                    >
                      <span className="truncate text-sm text-foreground">
                        {loc.city}, {loc.country}
                      </span>
                      <span className="text-mono text-sm text-muted">{loc.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={Globe2}
                  title="No locations yet"
                  description="Geo data appears once a visit resolves to a city."
                />
              )}
            </AdminCard>
          </div>

          <AdminCard>
            <h3 className="mb-4 text-base font-semibold text-foreground">Visitor Interests</h3>
            {stats.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.interests.slice(0, 20).map((interest, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary/50 px-3 py-1.5 text-sm text-foreground"
                  >
                    {interest.label}
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-mono text-xs text-primary">
                      {interest.count}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={BarChart3}
                title="No interests yet"
                description="Links, sections and buttons visitors engage with are grouped here."
              />
            )}
          </AdminCard>
        </div>
      )}
    </AdminPage>
  );
}

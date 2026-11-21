"use client";

import { useEffect } from "react";
import {
  BarChart3,
  Globe2,
  MousePointerClick,
  RefreshCw,
  ServerCrash,
  TrendingDown,
  Users,
} from "lucide-react";
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
import { SourceBreakdown } from "./source-breakdown";

/**
 * `/admin/analytics` — the deep-dive page.
 *
 * Growth KPIs are on the Overview (the "how are we doing?" question). This page
 * answers "where did they come from, where are they, and what did they use?",
 * so it owns the breakdowns that used to be stacked under the KPIs on the
 * dashboard.
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
            <StatCard icon={Users} label="Visitors" value={stats.totalVisitors} />
            <StatCard icon={MousePointerClick} label="Sessions" value={stats.totalSessions} />
            <StatCard
              icon={TrendingDown}
              label="Bounce rate"
              value={`${stats.bounceRate}%`}
              hint={`${stats.bouncedSessions} one-page sessions`}
            />
            <StatCard icon={Globe2} label="Channels" value={stats.sources.length} />
          </div>

          {/* Where the traffic came from, including the UTM tags that created it. */}
          <SourceBreakdown sources={stats.sources} utmCampaigns={stats.utmCampaigns} />

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
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">Top Referrers</h3>
                <span className="text-mono text-xs text-muted">{stats.topReferrers.length}</span>
              </div>
              {stats.topReferrers.length > 0 ? (
                // Scroll rather than slice: new referrers were invisible while
                // only the first ten were rendered.
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {stats.topReferrers.map((ref) => (
                    <div
                      key={ref.referrer}
                      className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary/50 px-3 py-2.5"
                    >
                      <span className="min-w-0 truncate text-sm text-foreground" title={ref.referrer}>
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
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">Visitor Locations</h3>
                <span className="text-mono text-xs text-muted">{stats.locations.length}</span>
              </div>
              {stats.locations.length > 0 ? (
                // Every location is rendered; the box scrolls so newly seen
                // cities are not pushed out of a fixed top-ten list.
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {stats.locations.map((loc, i) => (
                    <div
                      key={`${loc.city}-${loc.country}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary/50 px-3 py-2.5"
                    >
                      <span className="min-w-0 truncate text-sm text-foreground">
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-foreground">Visitor Interests</h3>
              <span className="text-mono text-xs text-muted">{stats.interests.length}</span>
            </div>
            {stats.interests.length > 0 ? (
              <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto pr-1">
                {stats.interests.map((interest, i) => (
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

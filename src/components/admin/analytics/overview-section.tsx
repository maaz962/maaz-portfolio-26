"use client";

import Link from "next/link";
import { ArrowUpRight, Globe2, MousePointerClick, Users, Wifi } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import type { VisitorStats } from "@/types/tracking";
import { latestTrend } from "@/lib/growth";
import { GrowthChart } from "./growth-chart";
import { StatCard } from "./stat-card";

export interface OverviewSectionProps {
  stats: VisitorStats;
}

/**
 * The dashboard's summary only.
 *
 * Detailed breakdowns (browsers, devices, pages, referrers, locations,
 * interests) live on their own `/admin/analytics` route. Keeping them out of
 * here is what lets the Overview read as a dashboard instead of a data dump,
 * and means a slow breakdown query can never delay the KPIs.
 */
export function OverviewSection({ stats }: OverviewSectionProps) {
  const dailyTrend = latestTrend(stats.dailyGrowth, "visits");
  const signupTrend = latestTrend(stats.monthlyGrowth, "signups");
  const todayVisits = stats.dailyGrowth[stats.dailyGrowth.length - 1]?.visits ?? 0;

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Globe2}
          label="Total visits"
          value={stats.totalVisitors}
          highlighted
          trendPct={dailyTrend?.pct}
          hint={`${todayVisits} today`}
        />
        <StatCard icon={Wifi} label="Unique visitors" value={stats.uniqueIPs} />
        <StatCard
          icon={Users}
          label="Accounts"
          value={stats.totalUsers}
          highlighted
          trendPct={signupTrend?.pct}
        />
        <StatCard icon={MousePointerClick} label="Tracked events" value={stats.totalEvents} />
      </div>

      {/* Growth charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <GrowthChart
          title="Daily growth"
          description="Visits and new accounts over the last 14 days (UTC)"
          data={stats.dailyGrowth}
        />
        <GrowthChart
          title="Monthly growth"
          description="Visits and new accounts over the last 6 months (UTC)"
          data={stats.monthlyGrowth}
        />
      </div>

      {/* A single way out to the detailed view — not a second copy of it. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-background-secondary/30 px-4 py-3.5">
        <p className="text-sm text-muted">
          Want the breakdown? Browsers, pages, referrers and interests are on the Analytics page.
        </p>
        <Link
          href="/admin/analytics"
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Open Analytics
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Globe2,
  MousePointerClick,
  Sparkles,
  TrendingDown,
  UserCheck,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import type { VisitorStats } from "@/types/tracking";
import { ONLINE_WINDOW_MINUTES } from "@/lib/visitor-analytics";
import { latestTrend } from "@/lib/growth";
import { GrowthChart } from "./growth-chart";
import { StatCard } from "./stat-card";

export interface OverviewSectionProps {
  stats: VisitorStats;
}

/**
 * The dashboard's summary only.
 *
 * The first KPI row answers "who is here?" (visitors, new vs returning, live
 * now). The second answers "how busy is it?" (sessions, bounce, accounts,
 * events). Channel and geography breakdowns live on `/admin/analytics`, so the
 * Overview stays readable instead of becoming a second copy of that page.
 */
export function OverviewSection({ stats }: OverviewSectionProps) {
  const dailyTrend = latestTrend(stats.dailyGrowth, "visits");
  const signupTrend = latestTrend(stats.monthlyGrowth, "signups");
  const todayVisits = stats.dailyGrowth[stats.dailyGrowth.length - 1]?.visits ?? 0;

  return (
    <div className="space-y-5">
      {/* Who is visiting */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Visitors"
          value={stats.totalVisitors}
          highlighted
          trendPct={dailyTrend?.pct}
          hint={`${stats.totalSessions} sessions · ${todayVisits} today`}
        />
        <StatCard
          icon={UserPlus}
          label="New visitors"
          value={stats.newVisitors}
          highlighted
          hint="one session in the retained window"
        />
        <StatCard
          icon={UserCheck}
          label="Returning"
          value={stats.returningVisitors}
          highlighted
          hint="visited more than once"
        />
        <StatCard
          icon={Wifi}
          label="Online now"
          value={stats.onlineNow}
          highlighted
          hint={`active in the last ${ONLINE_WINDOW_MINUTES} minutes`}
        />
      </div>

      {/* How the site is performing */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={MousePointerClick}
          label="Sessions"
          value={stats.totalSessions}
          hint={`${stats.uniqueIPs} unique IPs`}
        />
        <StatCard
          icon={TrendingDown}
          label="Bounce rate"
          value={`${stats.bounceRate}%`}
          hint={`${stats.bouncedSessions} one-page sessions`}
        />
        <StatCard
          icon={Sparkles}
          label="Accounts"
          value={stats.totalUsers}
          trendPct={signupTrend?.pct}
        />
        <StatCard icon={Globe2} label="Tracked events" value={stats.totalEvents} />
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
          Want the breakdown? Traffic sources, pages, referrers and locations are on the Analytics page.
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

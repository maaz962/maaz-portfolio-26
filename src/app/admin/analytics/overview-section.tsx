"use client";

import { Users, Globe, MousePointerClick, Eye, MapPin, Sparkles } from "lucide-react";
import type { VisitorStats } from "@/types/tracking";
import { BarChart } from "./bar-chart";
import { StatCard } from "./stat-card";

export interface OverviewSectionProps {
  stats: VisitorStats | null;
}

export function OverviewSection({ stats }: OverviewSectionProps) {
  return (
    <>
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Users} label="Total Visits" value={stats.totalVisitors} />
            <StatCard icon={Globe} label="Unique IPs" value={stats.uniqueIPs} />
            <StatCard icon={MousePointerClick} label="Total Events" value={stats.totalEvents} />
            <StatCard icon={Eye} label="Top Page" value={stats.topPages[0]?.page || "-"} />
          </div>
        )}

        {/* Charts Row */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BarChart title="Browsers" data={stats.browsers.map((b) => ({ label: b.name, value: b.count }))} />
            <BarChart title="Devices" data={stats.devices.map((d) => ({ label: d.name, value: d.count }))} />
            <BarChart title="Top Pages" data={stats.topPages.map((p) => ({ label: p.page, value: p.count }))} />
          </div>
        )}

        {/* Locations */}
        {stats && stats.locations.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Visitor Locations
            </h3>
            <div className="space-y-2">
              {stats.locations.slice(0, 10).map((loc, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-background-secondary/50 px-3 py-2">
                  <span className="text-xs text-foreground">
                    {loc.city}, {loc.country}
                  </span>
                  <span className="text-mono text-xs text-muted">{loc.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visitor Interests */}
        {stats && stats.interests.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Visitor Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.interests.slice(0, 20).map((it, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-secondary/50 px-3 py-1.5 text-xs text-foreground"
                >
                  {it.label}
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-mono text-primary">
                    {it.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {stats && stats.totalVisitors === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Users className="mx-auto h-8 w-8 text-muted/40" />
            <p className="mt-3 text-sm text-muted">No visitors yet. Data will appear here once someone visits your portfolio.</p>
          </div>
        )}
    </>
  );
}

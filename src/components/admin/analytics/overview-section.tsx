"use client";

import { AdminCard } from "@/components/admin/admin-card";

import { MapPin, Sparkles, Users } from "lucide-react";
import type { VisitorStats } from "@/types/tracking";
import { EmptyState } from "@/components/admin/empty-state";
import { BarChart } from "./bar-chart";
import { StatCard } from "./stat-card";

export interface OverviewSectionProps {
  stats: VisitorStats;
}

export function OverviewSection({ stats }: OverviewSectionProps) {
  const hasVisitors = stats.totalVisitors > 0;

  return (
    <div className="space-y-5">
      {hasVisitors ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Users} label="Total Visits" value={stats.totalVisitors} />
            <StatCard icon={MapPin} label="Unique IPs" value={stats.uniqueIPs} />
            <StatCard icon={Sparkles} label="Total Events" value={stats.totalEvents} />
            <StatCard icon={MapPin} label="Top Page" value={stats.topPages[0]?.page || "-"} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BarChart title="Browsers" data={stats.browsers.map((b) => ({ label: b.name, value: b.count }))} />
            <BarChart title="Devices" data={stats.devices.map((d) => ({ label: d.name, value: d.count }))} />
            <BarChart title="Top Pages" data={stats.topPages.map((p) => ({ label: p.page, value: p.count }))} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AdminCard>
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-primary" strokeWidth={1.75} /> Visitor Locations
              </h3>
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
                  icon={MapPin}
                  title="No locations yet"
                  description="Geo data appears once a visit resolves to a city."
                />
              )}
            </AdminCard>

            <AdminCard>
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} /> Visitor Interests
              </h3>
              {stats.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.interests.slice(0, 20).map((it, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary/50 px-3 py-1.5 text-sm text-foreground"
                    >
                      {it.label}
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-mono text-xs text-primary">
                        {it.count}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={Sparkles}
                  title="No interests yet"
                  description="Links, sections and buttons visitors engage with are grouped here."
                />
              )}
            </AdminCard>
          </div>
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No visitors yet"
          description="Data will appear here once someone visits your portfolio. Nothing to configure in the meantime."
        />
      )}
    </div>
  );
}

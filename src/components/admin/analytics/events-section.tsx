"use client";

import { Activity, Clock } from "lucide-react";
import type { VisitorStats } from "@/types/tracking";
import { EmptyState } from "@/components/admin/empty-state";

export interface EventsSectionProps {
  stats: VisitorStats;
}

/** Pill colours for the four event types that get a badge. */
const EVENT_BADGE: Record<string, string> = {
  pageview: "bg-primary/10 text-primary",
  click: "bg-secondary/10 text-secondary",
  scroll: "bg-accent/10 text-accent",
};

function EventBadge({ type }: { type: string }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-mono text-xs font-medium ${
        EVENT_BADGE[type] ?? "bg-muted/10 text-muted"
      }`}
    >
      {type}
    </span>
  );
}

export function EventsSection({ stats }: EventsSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
        <Clock className="h-4 w-4 text-primary" strokeWidth={1.75} /> Recent Events
      </h3>
      {stats.recentActivity.length > 0 ? (
        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {stats.recentActivity.map((evt, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg bg-background-secondary/30 px-3 py-2 text-sm"
            >
              <EventBadge type={evt.type} />
              <span className="truncate text-foreground/80">{evt.target}</span>
              {evt.data && <span className="shrink-0 text-muted">{evt.data}</span>}
              <span className="text-mono ml-auto shrink-0 text-xs text-muted/70">
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          compact
          icon={Activity}
          title="No events yet"
          description="Pageviews, clicks and scroll activity show up here in real time."
        />
      )}
    </div>
  );
}

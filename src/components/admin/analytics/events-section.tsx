"use client";

import { Clock } from "lucide-react";
import type { VisitorStats } from "@/types/tracking";

export interface EventsSectionProps {
  stats: VisitorStats | null;
}

export function EventsSection({ stats }: EventsSectionProps) {
  return (
    <>
        {stats && stats.recentActivity.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" /> Recent Events
            </h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {stats.recentActivity.map((evt, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-background-secondary/30 px-3 py-1.5 text-xs">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-medium ${
                    evt.type === "pageview" ? "bg-primary/10 text-primary" :
                    evt.type === "click" ? "bg-secondary/10 text-secondary" :
                    evt.type === "scroll" ? "bg-accent/10 text-accent" :
                    "bg-muted/10 text-muted"
                  }`}>
                    {evt.type}
                  </span>
                  <span className="truncate text-foreground/80">{evt.target}</span>
                  {evt.data && <span className="shrink-0 text-muted">{evt.data}</span>}
                  <span className="ml-auto shrink-0 text-muted/60 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </>
  );
}

"use client";

import { ArrowUpRight, Globe2, Tag } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { EmptyState } from "@/components/admin/empty-state";
import type { NamedCount } from "@/types/tracking";

/**
 * "Where did they come from?" — grouped channels first, then the raw UTM tags
 * that produced them. Both lists come from the analytics response, so there is
 * no extra request for this card.
 */
export function SourceBreakdown({
  sources,
  utmCampaigns,
}: {
  sources: NamedCount[];
  utmCampaigns: NamedCount[];
}) {
  const total = sources.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdminCard>
        <div className="mb-4 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h3 className="text-base font-semibold text-foreground">Traffic sources</h3>
        </div>
        {sources.length > 0 ? (
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {sources.map((source) => {
              const pct = total === 0 ? 0 : Math.round((source.count / total) * 100);
              return (
                <div key={source.label}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-foreground">{source.label}</span>
                    <span className="text-mono text-muted">
                      {source.count} <span className="text-muted/60">· {pct}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            compact
            icon={Globe2}
            title="No sources yet"
            description="Channels appear here once the tracker records a visit."
          />
        )}
      </AdminCard>

      <AdminCard>
        <div className="mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h3 className="text-base font-semibold text-foreground">UTM campaigns</h3>
        </div>
        {utmCampaigns.length > 0 ? (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {utmCampaigns.map((campaign) => (
              <div
                key={campaign.label}
                className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary/50 px-3 py-2.5"
              >
                <span className="min-w-0 truncate text-sm text-foreground" title={campaign.label}>
                  {campaign.label}
                </span>
                <span className="text-mono text-sm text-muted">{campaign.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            icon={ArrowUpRight}
            title="No UTM tags yet"
            description="Links like ?utm_source=google&utm_campaign=launch will be listed here."
          />
        )}
      </AdminCard>
    </div>
  );
}

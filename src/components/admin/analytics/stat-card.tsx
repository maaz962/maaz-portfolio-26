"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Small line under the value, e.g. a period-over-period change. */
  hint?: ReactNode;
  /** Signed percentage; renders a green up / red down chip. `null` = "new". */
  trendPct?: number | null;
  /** Subtle tint used on the primary dashboard KPIs. */
  highlighted?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  trendPct,
  highlighted = false,
}: StatCardProps) {
  // Counts read well large; a page path or label does not, so anything that is
  // not a bare number drops a step and truncates rather than overflowing.
  const isCount = typeof value === "number";

  return (
    <AdminCard
      className={cn(
        "relative overflow-hidden transition-shadow duration-200 hover:shadow-card",
        highlighted && "bg-gradient-to-br from-primary/[0.07] via-card to-card"
      )}
    >
      {highlighted && (
        <span
          aria-hidden
          className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl"
        />
      )}
      <div className="relative mb-2 flex items-center gap-2">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            highlighted ? "bg-primary/15 text-primary" : "text-primary"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        </span>
        <span className="truncate text-sm text-muted">{label}</span>
      </div>
      <p
        className={cn(
          "relative truncate font-display font-semibold text-foreground",
          isCount ? "text-3xl" : "text-xl"
        )}
        title={isCount ? undefined : String(value)}
      >
        {value}
      </p>
      {(hint || trendPct !== undefined) && (
        <div className="relative mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          {trendPct !== undefined && <TrendChip pct={trendPct} />}
          {hint}
        </div>
      )}
    </AdminCard>
  );
}

function TrendChip({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-secondary">new</span>;
  }
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
        up ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-500"
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

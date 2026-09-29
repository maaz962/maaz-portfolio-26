"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shown when a panel has loaded successfully but has nothing to display.
 *
 * Every admin panel used to return `null` when its data was empty, which made
 * "no data yet" indistinguishable from "this panel is broken". The dashed
 * border is deliberate: it reads as a placeholder rather than a populated card.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tighter padding for empty states nested inside a section that has data. */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-card/60 text-center",
        compact ? "p-6" : "p-10"
      )}
    >
      <Icon className={cn("mx-auto text-muted/40", compact ? "h-6 w-6" : "h-8 w-8")} />
      <p
        className={cn(
          "font-display font-semibold text-foreground",
          compact ? "mt-2.5 text-sm" : "mt-3 text-base"
        )}
      >
        {title}
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{description}</p>
    </div>
  );
}

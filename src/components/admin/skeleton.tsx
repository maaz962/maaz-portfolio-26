"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-card";

/**
 * Loading primitives for admin panels.
 *
 * These render the real `AdminCard`, so the page keeps its shape while data
 * loads instead of rendering blank, which is what every panel used to do while
 * gated on `stats &&` / `length > 0`.
 */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-background-secondary", className)}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <AdminCard>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-20" />
    </AdminCard>
  );
}

/**
 * Stand-in for a data panel: header line plus `rows` list rows.
 * `titleWidth` varies the header to match the real heading length.
 */
export function PanelSkeleton({
  rows = 4,
  titleWidth = "w-40",
}: {
  rows?: number;
  titleWidth?: string;
}) {
  return (
    <AdminCard>
      <Skeleton className={cn("h-4", titleWidth)} />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

/** Stand-in for the horizontal bar charts (Browsers / Devices / Top Pages). */
export function BarChartSkeleton() {
  return (
    <AdminCard>
      <Skeleton className="h-4 w-28" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-24 shrink-0" />
            <Skeleton className="h-2.5 flex-1 rounded-full" />
            <Skeleton className="h-3 w-6 shrink-0" />
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

/** Full-width loading state for a panel that failed to load, with a retry. */
export function ErrorState({
  icon: Icon,
  title,
  description,
  onRetry,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <AdminCard className="p-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-red-500/70" />
      <p className="mt-3 font-display text-base font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={buttonStyles({ variant: "outline", size: "sm", className: "mt-5" })}
        >
          Try again
        </button>
      )}
    </AdminCard>
  );
}

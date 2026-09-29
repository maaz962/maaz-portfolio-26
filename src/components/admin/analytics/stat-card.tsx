"use client";

import { AdminCard } from "@/components/admin/admin-card";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  // Counts read well large; a page path or label does not, so anything that is
  // not a bare number drops a step and truncates rather than overflowing.
  const isCount = typeof value === "number";

  return (
    <AdminCard>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
        <span className="truncate text-sm text-muted">{label}</span>
      </div>
      <p
        className={cn(
          "truncate font-display font-semibold text-foreground",
          isCount ? "text-3xl" : "text-xl"
        )}
        title={isCount ? undefined : String(value)}
      >
        {value}
      </p>
    </AdminCard>
  );
}

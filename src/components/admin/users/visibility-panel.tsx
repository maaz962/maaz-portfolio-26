"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminUserDetail } from "@/types";

/**
 * Leaderboard visibility.
 *
 * Reversible and low blast radius, so this is a direct toggle rather than a
 * confirmation step — the confirmation budget is better spent on deletion.
 */
export function VisibilityPanel({
  detail,
  saving,
  onChange,
}: {
  detail: AdminUserDetail;
  saving: boolean;
  onChange: (hidden: boolean) => Promise<boolean>;
}) {
  const hidden = detail.user.hiddenFromLeaderboard;

  if (detail.user.isAdmin) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-base font-semibold text-foreground">Leaderboard visibility</h2>
        <p className="text-sm text-muted">
          Admin accounts never appear on the public leaderboard, so there is nothing to toggle.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            {hidden ? (
              <EyeOff className="h-4 w-4 text-primary" strokeWidth={1.75} />
            ) : (
              <Eye className="h-4 w-4 text-primary" strokeWidth={1.75} />
            )}
            Leaderboard visibility
          </h2>
          <p className="mt-1.5 max-w-prose text-sm text-muted">
            {hidden
              ? "Hidden. This player is excluded from the public leaderboard, though their XP and progress are untouched."
              : "Visible. This player appears on the public leaderboard whenever they have earned enough XP to clear the ranking floor."}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => onChange(!hidden)}
          disabled={saving}
          className="shrink-0 rounded-xl"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hidden ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {hidden ? "Show on leaderboard" : "Hide from leaderboard"}
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted">
        Status:{" "}
        <span className="text-foreground/80">
          {hidden ? "Hidden from the public leaderboard" : "Listed on the public leaderboard"}
        </span>
      </p>
    </section>
  );
}

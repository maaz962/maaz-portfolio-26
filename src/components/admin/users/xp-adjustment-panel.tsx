"use client";

import { useState } from "react";
import { Check, Loader2, Minus, Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminUserDetail } from "@/types";

/** Mirrors the server-side bound in the PATCH route. */
const MAX_TOTAL_XP = 1_000_000;

const inputClasses =
  "h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary/60";

/**
 * Sets an absolute XP total rather than a delta.
 *
 * A +/- stepper forces the admin to do the subtraction in their head and gives
 * no way to type a specific number, so this takes the final total and shows the
 * review step before writing. The reason is mandatory: without it the audit
 * trail is a list of numbers nobody can explain later.
 */
export function XpAdjustmentPanel({
  detail,
  saving,
  onApply,
}: {
  detail: AdminUserDetail;
  saving: boolean;
  onApply: (totalXp: number, reason: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState(String(detail.totalXp));
  const [reason, setReason] = useState("");
  const [review, setReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = Number(value);
  const isWhole = Number.isInteger(parsed);
  const inRange = isWhole && parsed >= 0 && parsed <= MAX_TOTAL_XP;
  const delta = inRange ? parsed - detail.totalXp : 0;
  const unchanged = inRange && delta === 0;

  // XP earned from actually playing, which the new offset is measured against.
  const earnedXp = detail.totalXp - detail.xpAdjustment;

  const validate = (): string | null => {
    if (value.trim() === "" || !isWhole) return "Enter a whole number of XP.";
    if (!inRange) return `XP must be between 0 and ${MAX_TOTAL_XP.toLocaleString()}.`;
    if (unchanged) return "That is already the user's total XP.";
    if (reason.trim().length < 3) return "Give a short reason (at least 3 characters).";
    return null;
  };

  const startReview = () => {
    const problem = validate();
    setError(problem);
    if (!problem) setReview(true);
  };

  const apply = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      setReview(false);
      return;
    }
    const ok = await onApply(parsed, reason.trim());
    if (ok) {
      setReview(false);
      setReason("");
      setError(null);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
        <h2 className="text-base font-semibold text-foreground">Set total XP</h2>
      </div>
      <p className="mb-4 text-sm text-muted">
        Sets the final total, not a change. Current total is{" "}
        <span className="text-mono text-foreground">{detail.totalXp.toLocaleString()}</span> XP
        {detail.xpAdjustment !== 0 && (
          <>
            {" "}
            (earned <span className="text-mono">{earnedXp.toLocaleString()}</span> plus an admin
            offset of{" "}
            <span className="text-mono">
              {detail.xpAdjustment > 0 ? "+" : ""}
              {detail.xpAdjustment.toLocaleString()}
            </span>
            )
          </>
        )}
        .
      </p>

      {review ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">Confirm this change</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="text-mono text-muted">{detail.totalXp.toLocaleString()} XP</span>
              <span aria-hidden>&rarr;</span>
              <span className="text-mono text-base font-semibold text-foreground">
                {parsed.toLocaleString()} XP
              </span>
              <span
                className={
                  delta >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }
              >
                ({delta >= 0 ? "+" : ""}
                {delta.toLocaleString()} XP)
              </span>
            </p>
            <p className="mt-3 text-sm text-muted">
              Reason: <span className="text-foreground/80">{reason.trim()}</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              This overwrites the existing admin offset and is recorded in the history below.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={apply} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Apply change
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setReview(false);
                setError(null);
              }}
              disabled={saving}
            >
              <Undo2 className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor="total-xp" className="mb-1.5 block text-sm font-medium text-foreground">
              New total XP
            </label>
            <input
              id="total-xp"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_TOTAL_XP}
              step={1}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError(null);
              }}
              className={inputClasses}
            />
            <p className="mt-1.5 text-xs text-muted">
              0 to {MAX_TOTAL_XP.toLocaleString()}
              {inRange && !unchanged && (
                <span className={delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}>
                  {" "}
                  &middot; {delta >= 0 ? "+" : ""}
                  {delta.toLocaleString()} XP from current
                </span>
              )}
            </p>
          </div>

          <div>
            <label htmlFor="xp-reason" className="mb-1.5 block text-sm font-medium text-foreground">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="xp-reason"
              rows={2}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError(null);
              }}
              placeholder="e.g. Wrong score reported in level 4 of Word Forge"
              className="w-full resize-y rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary/60"
            />
            <p className="mt-1.5 text-xs text-muted">
              Stored with your username and the time so the change can be explained later.
            </p>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400">
              <Minus className="h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}

          <Button onClick={startReview} disabled={saving}>
            Review change
          </Button>
        </div>
      )}
    </section>
  );
}

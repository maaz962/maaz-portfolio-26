"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import type { User } from "@/types";

/**
 * Permanent deletion.
 *
 * `window.confirm` was the old guard, which reads the account to delete right
 * back at you and can be dismissed by reflex. Typing the exact username forces
 * a deliberate match, and the consequences are spelled out before the input so
 * nobody discovers them afterwards.
 */
export function DangerZone({
  user,
  saving,
  onConfirm,
  onDeleted,
}: {
  user: User;
  saving: boolean;
  onConfirm: () => Promise<boolean>;
  onDeleted: () => void;
}) {
  const [typed, setTyped] = useState("");

  if (user.isAdmin) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-base font-semibold text-foreground">Danger zone</h2>
        <p className="text-sm text-muted">
          Admin accounts cannot be deleted from this panel, so the last way into the admin area
          cannot be removed by accident.
        </p>
      </section>
    );
  }

  const matches = typed.trim() === user.username;

  const run = async () => {
    if (!matches || saving) return;
    const ok = await onConfirm();
    if (ok) onDeleted();
  };

  return (
    <section className="rounded-2xl border border-red-500/40 bg-card p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-red-600 dark:text-red-400">
        <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
        Danger zone
      </h2>

      <p className="mt-2 text-sm text-muted">
        Deleting <span className="text-foreground">@{user.username}</span> permanently removes:
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
        <li>The account and its sign-in access</li>
        <li>Every saved game and level score</li>
        <li>Streaks, levels, and the XP history below</li>
      </ul>
      <p className="mt-2 text-sm text-muted">
        This cannot be undone. Hiding the player from the leaderboard is the reversible option.
      </p>

      <div className="mt-4 max-w-sm">
        <label htmlFor="delete-confirm" className="mb-1.5 block text-sm font-medium text-foreground">
          Type <span className="text-mono text-foreground">@{user.username}</span> to confirm
        </label>
        <input
          id="delete-confirm"
          type="text"
          autoComplete="off"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder={`@${user.username}`}
          className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-red-500/60"
        />
      </div>

      <button
        type="button"
        onClick={run}
        disabled={!matches || saving}
        className={buttonStyles({
          variant: "primary",
          size: "sm",
          className:
            "mt-4 rounded-xl bg-red-600 text-white shadow-none hover:brightness-110 dark:bg-red-600",
        })}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Delete account permanently
      </button>
    </section>
  );
}

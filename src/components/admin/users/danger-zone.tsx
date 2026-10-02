"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { adminFieldStyles, adminLabelStyles } from "@/components/admin/admin-field";
import { AdminCard } from "@/components/admin/admin-card";
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
      <AdminCard as="section">
        <h2 className="mb-1 text-base font-semibold text-foreground">Danger zone</h2>
        <p className="text-sm text-muted">
          Admin accounts cannot be deleted from this panel, so the last way into the admin area
          cannot be removed by accident.
        </p>
      </AdminCard>
    );
  }

  /**
   * The one string the admin has to type, derived once and used for the
   * instruction, the placeholder AND the comparison.
   *
   * These were previously three separate expressions: the label and the
   * placeholder rendered `@{user.username}` while the check compared against
   * the bare `user.username`. The button was therefore permanently disabled --
   * the exact string the UI asked for could never equal the string being
   * compared -- and, worse, typing the bare username (which nothing told you
   * to do) was what armed the delete.
   *
   * The leading `@` is a display convention used everywhere the site shows a
   * handle, so it belongs to the confirmation prompt, not to the stored value.
   *
   * Comparison stays strict and case-sensitive on purpose: this guards an
   * irreversible delete, and usernames are stored lowercased, so an exact match
   * is unambiguous. Only surrounding whitespace is forgiven (`.trim()`), so a
   * value pasted in with a stray space still counts as deliberate.
   */
  const confirmText = `@${user.username}`;
  const matches = typed.trim() === confirmText;

  const run = async () => {
    if (!matches || saving) return;
    const ok = await onConfirm();
    if (ok) onDeleted();
  };

  return (
    <AdminCard as="section" className="border-red-500/40">
      <h2 className="flex items-center gap-2 text-base font-semibold text-red-600 dark:text-red-400">
        <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
        Danger zone
      </h2>

      <p className="mt-2 text-sm text-muted">
        Deleting <span className="text-foreground">{confirmText}</span> permanently removes:
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
        <label htmlFor="delete-confirm" className={adminLabelStyles()}>
          Type <span className="text-mono text-foreground">{confirmText}</span> to confirm
        </label>
        <input
          id="delete-confirm"
          type="text"
          autoComplete="off"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder={confirmText}
          className={adminFieldStyles({ className: "focus:border-red-500/60" })}
        />
      </div>

      <button
        type="button"
        onClick={run}
        disabled={!matches || saving}
        className={buttonStyles({ variant: "danger", size: "sm", className: "mt-4" })}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Delete account permanently
      </button>
    </AdminCard>
  );
}

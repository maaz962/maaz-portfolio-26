"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { adminFieldStyles, adminLabelStyles } from "@/components/admin/admin-field";
import { AdminCard } from "@/components/admin/admin-card";
import { RoleBadge } from "@/components/admin/role-badge";
import { ConfirmDialog, useConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  roleOf,
  USER_ROLES,
  type AdminRole,
} from "@/lib/roles";
import type { User, UserRole } from "@/types";

/**
 * Owner-only role assignment.
 *
 * Granting panel access is a bigger decision than an XP tweak: it decides who
 * can read visitor logs or erase accounts. The picker is therefore limited to
 * owners, shown to everyone else as a read-only summary, and confirmed before
 * the write goes through. Self-changes are disabled to match the API guard.
 */
export function RolePanel({
  user,
  actorId,
  actorRole,
  saving,
  onChange,
}: {
  user: User;
  actorId: string;
  actorRole: AdminRole;
  saving: boolean;
  onChange: (role: UserRole) => Promise<boolean>;
}) {
  const current = roleOf(user);
  const [selected, setSelected] = useState<UserRole>(current);
  const { confirm, dialogProps } = useConfirmDialog();
  const isSelf = user.id === actorId;

  if (actorRole !== "owner" || isSelf) {
    return (
      <AdminCard as="section">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.75} />
          Access role
        </h2>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
          <RoleBadge role={current} />
          {isSelf ? "You cannot change your own role." : "Only an owner can change roles."}
        </p>
      </AdminCard>
    );
  }

  return (
    <AdminCard as="section">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.75} />
        Access role
      </h2>
      <p className="mt-2 text-sm text-muted">
        Roles decide what this account may do inside the admin panel.
      </p>

      <div className="mt-4 max-w-lg space-y-3">
        <div>
          <label htmlFor="role-select" className={adminLabelStyles()}>
            Role
          </label>
          <select
            id="role-select"
            value={selected}
            disabled={saving}
            onChange={(event) => setSelected(event.target.value as UserRole)}
            className={adminFieldStyles()}
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted">{ROLE_DESCRIPTIONS[selected]}</p>
        </div>

        <button
          type="button"
          disabled={saving || selected === current}
          onClick={() =>
            confirm({
              title: `Change role to ${ROLE_LABELS[selected]}?`,
              description: `This changes what @${user.username} can access in the admin panel immediately. Their signed-in session picks up the new role on the next request.`,
              confirmLabel: "Change role",
              onConfirm: async () => {
                await onChange(selected);
              },
            })
          }
          className={buttonStyles({ variant: "primary", size: "sm" })}
        >
          Save role
        </button>
      </div>

      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </AdminCard>
  );
}

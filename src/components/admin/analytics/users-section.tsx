"use client";

import { Loader2, Trash2, UserCheck } from "lucide-react";
import type { User } from "@/types";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/empty-state";
import type { DeletableUser } from "./use-admin-data";

export interface UsersSectionProps {
  users: User[];
  busy: string | null;
  removeUser: (user: DeletableUser) => Promise<void>;
}

/**
 * Registered accounts. Moves to /admin/users with search, sorting and
 * pagination in a later step; the destructive action moves to that page's
 * detail view so it is not duplicated here and on the leaderboard.
 */
export function UsersSection({ users, busy, removeUser }: UsersSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
        <UserCheck className="h-4 w-4 text-primary" strokeWidth={1.75} /> Registered Users
        {users.length > 0 && (
          <span className="text-sm font-normal text-muted">{users.length}</span>
        )}
      </h3>

      {users.length === 0 ? (
        <EmptyState
          compact
          icon={UserCheck}
          title="No registered users yet"
          description="Accounts appear here as soon as someone signs up through the games hub."
        />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background-secondary/30 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{u.name}</span>
                    {u.isAdmin && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">
                    @{u.username} &middot; {u.email}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-mono text-xs text-muted/70">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <span className="text-mono hidden max-w-36 truncate text-xs text-muted/70 sm:inline">
                  {u.id}
                </span>
                {u.isAdmin ? (
                  <span className="text-xs text-muted/70">Protected</span>
                ) : (
                  <button
                    onClick={() => removeUser(u)}
                    disabled={busy !== null}
                    className={buttonStyles({
                      variant: "outline",
                      size: "sm",
                      className:
                        "h-8 border border-red-500/30 bg-red-500/10 px-3 text-sm text-red-500 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-500",
                    })}
                    title={`Delete @${u.username}`}
                  >
                    {busy === `${u.id}:del` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

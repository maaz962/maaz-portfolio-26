"use client";

import { UserCheck, Trash2, Loader2 } from "lucide-react";
import type { User } from "@/types";
import type { DeletableUser } from "./use-admin-data";

export interface UsersSectionProps {
  users: User[];
  busy: string | null;
  removeUser: (user: DeletableUser) => Promise<void>;
}

export function UsersSection({ users, busy, removeUser }: UsersSectionProps) {
  return (
    <>
        {users.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <UserCheck className="h-4 w-4 text-primary" /> Registered Users ({users.length})
            </h3>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background-secondary/30 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-medium text-foreground">{u.name}</span>
                        {u.isAdmin && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-medium text-primary">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted">
                        @{u.username} &middot; {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-mono text-[0.65rem] text-muted/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                    <span className="hidden max-w-36 truncate text-mono text-[0.65rem] text-muted/60 sm:inline">
                      {u.id}
                    </span>
                    {u.isAdmin ? (
                      <span className="text-[0.65rem] text-muted/60">Protected</span>
                    ) : (
                      <button
                        onClick={() => removeUser(u)}
                        disabled={busy !== null}
                        className="flex h-7 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 text-[0.65rem] font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        title={`Delete @${u.username}`}
                      >
                        {busy === `${u.id}:del` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </>
  );
}

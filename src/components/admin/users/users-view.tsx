"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Search,
  Trash2,
  UserCheck,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { adminSearchStyles } from "@/components/admin/admin-field";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/admin/role-badge";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import { AdminPagination, AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { ToastProvider, useToast } from "@/components/admin/toast";
import { ConfirmDialog, useConfirmDialog } from "@/components/admin/confirm-dialog";
import { can, roleOf, ROLE_LABELS, type AdminRole } from "@/lib/roles";
import { useUserList, useUsersData } from "./use-users";
import type { AdminUser } from "./user-list";

/**
 * `/admin/users` — browse accounts and recover deleted ones.
 *
 * Two separate tabs (active / Trash) keep a destructive row well away from a
 * search result. Deletion is a soft delete with typed confirmation on the
 * detail page, and this page offers two ways back: the Undo banner after a
 * delete and a permanent Restore button in Trash for later changes of mind.
 */
export function UsersView({
  actorRole,
  undoId,
}: {
  actorRole: AdminRole;
  undoId?: string;
}) {
  return (
    <ToastProvider>
      <UsersPage actorRole={actorRole} undoId={undoId} />
    </ToastProvider>
  );
}

function UsersPage({ actorRole, undoId }: { actorRole: AdminRole; undoId?: string }) {
  const router = useRouter();
  const { users, deletedUsers, loading, loaded, busy, errorEvent, fetchUsers, restore, purge } =
    useUsersData();
  const { query, setQuery, sort, setSort, page, setPage, pageSize, setPageSize, pageCount, filtered, rows } =
    useUserList(users);
  const [tab, setTab] = useState<"active" | "trash">("active");
  const { notify } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();

  useEffect(() => {
    if (errorEvent) notify(errorEvent.message, "error");
  }, [errorEvent, notify]);

  const canManage = can(actorRole, "users:manage");
  const canPurge = can(actorRole, "users:purge");

  // After a delete from the detail page we land here with ?undo=<id>. The
  // account is still in the store (soft delete), so the banner can name it
  // and Undo is a real restore rather than a client-side trick.
  const undoUser = undoId ? deletedUsers.find((user) => user.id === undoId) : undefined;
  const [undoDismissed, setUndoDismissed] = useState(false);
  useEffect(() => {
    setUndoDismissed(false);
  }, [undoId]);

  const handleRestore = useCallback(
    async (id: string, label: string) => {
      const ok = await restore(id);
      if (ok) {
        notify(`${label} restored`);
        setUndoDismissed(true);
        router.replace("/admin/users");
      }
    },
    [notify, restore, router]
  );

  const columns = useMemo<AdminColumn<AdminUser>[]>(
    () => [
      {
        key: "name",
        header: "User",
        sortable: true,
        defaultDirection: "asc",
        render: (user) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar seed={user.id} name={user.name} className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-sm text-muted">@{user.username}</p>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        hideBelow: "md",
        render: (user) => <span className="text-mono text-sm break-all text-muted">{user.email}</span>,
      },
      {
        key: "role",
        header: "Role",
        render: (user) => <RoleBadge role={roleOf(user)} />,
      },
      {
        key: "joined",
        header: "Joined",
        sortable: true,
        defaultDirection: "desc",
        hideBelow: "sm",
        render: (user) => (
          <span className="text-mono text-sm whitespace-nowrap text-muted">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "xp",
        header: "XP",
        sortable: true,
        defaultDirection: "desc",
        className: "text-right",
        render: (user) => (
          <span className="text-mono text-sm whitespace-nowrap text-foreground">
            {user.totalXp === null ? "—" : user.totalXp.toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  const trashColumns = useMemo<AdminColumn<AdminUser>[]>(
    () => [
      {
        key: "name",
        header: "Account",
        render: (user) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar seed={user.id} name={user.name} className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-sm text-muted">@{user.username}</p>
            </div>
          </div>
        ),
      },
      {
        key: "deleted",
        header: "Moved to Trash",
        hideBelow: "sm",
        render: (user) => (
          <span className="text-mono text-sm whitespace-nowrap text-muted">
            {user.deletedAt ? new Date(user.deletedAt).toLocaleString() : "—"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right whitespace-nowrap",
        render: (user) => (
          <div className="flex justify-end gap-2">
            {canManage && (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleRestore(user.id, `@${user.username}`)}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                Restore
              </button>
            )}
            {canPurge && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  confirm({
                    title: "Erase this account forever?",
                    description: `@${user.username} and all of their saved games and XP history will be permanently deleted. This cannot be undone.`,
                    confirmLabel: "Erase forever",
                    tone: "danger",
                    onConfirm: async () => {
                      const ok = await purge(user.id);
                      if (ok) notify(`@${user.username} erased permanently`);
                    },
                  })
                }
                className={buttonStyles({ variant: "danger", size: "sm" })}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Erase
              </button>
            )}
          </div>
        ),
      },
    ],
    [busy, canManage, canPurge, confirm, handleRestore, notify, purge]
  );

  const searching = query.trim().length > 0;

  return (
    <AdminPage>
      <AdminPageHeader
        icon={UsersIcon}
        title="Users"
        description="Browse accounts and recover deleted ones"
        actions={
          <>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted">
              Your role: <span className="font-medium text-foreground">{ROLE_LABELS[actorRole]}</span>
            </span>
            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Refresh
            </button>
          </>
        }
      />

      {undoUser && !undoDismissed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
          <p className="text-sm text-foreground">
            <span className="font-medium">@{undoUser.username}</span> was moved to Trash.
          </p>
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleRestore(undoUser.id, `@${undoUser.username}`)}
                className={buttonStyles({ variant: "primary", size: "sm" })}
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                Undo delete
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setUndoDismissed(true);
                router.replace("/admin/users");
              }}
              aria-label="Dismiss undo prompt"
              className="rounded-full p-1.5 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <TabButton active={tab === "active"} onClick={() => setTab("active")}>
          Active <span className="text-mono text-xs text-muted">{users.length}</span>
        </TabButton>
        <TabButton active={tab === "trash"} onClick={() => setTab("trash")}>
          Trash <span className="text-mono text-xs text-muted">{deletedUsers.length}</span>
        </TabButton>
      </div>

      {tab === "active" ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
                strokeWidth={1.75}
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, username, or email"
                aria-label="Search users"
                className={adminSearchStyles()}
              />
              {searching && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
            <p className="text-sm whitespace-nowrap text-muted">
              {searching ? (
                <>
                  <span className="text-foreground">{filtered.length}</span> of {users.length} users
                </>
              ) : (
                <>
                  <span className="text-foreground">{users.length}</span> users
                </>
              )}
            </p>
          </div>

          <AdminTable<AdminUser>
            caption="Registered users"
            columns={columns}
            rows={rows}
            getRowKey={(user) => user.id}
            rowHref={(user) => `/admin/users/${user.id}`}
            sort={sort}
            onSortChange={setSort}
            loading={!loaded}
            emptyColSpan={columns.length}
            empty={
              searching ? (
                <EmptyState
                  icon={Search}
                  title={`No users match "${query.trim()}"`}
                  description="Try a different name, username, or email."
                />
              ) : (
                <EmptyState
                  icon={UserCheck}
                  title="No registered users yet"
                  description="Accounts appear here as soon as someone signs up through the games hub."
                />
              )
            }
          />

          <AdminPagination
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            total={filtered.length}
            itemNoun="users"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      ) : (
        <AdminTable<AdminUser>
          caption="Recently deleted accounts"
          columns={trashColumns}
          rows={deletedUsers}
          getRowKey={(user) => user.id}
          sort={null}
          onSortChange={() => {}}
          loading={!loaded}
          emptyColSpan={trashColumns.length}
          empty={
            <EmptyState
              icon={RotateCcw}
              title="Trash is empty"
              description="Accounts you delete are kept here so you can restore them later."
            />
          }
        />
      )}

      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </AdminPage>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted hover:bg-background-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

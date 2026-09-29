"use client";

import { useEffect, useMemo } from "react";
import { Search, UserCheck, Users as UsersIcon, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { adminSearchStyles } from "@/components/admin/admin-field";
import { Avatar } from "@/components/ui/avatar";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import { AdminPagination, AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { ToastProvider, useToast } from "@/components/admin/toast";
import { useUserList, useUsersData } from "./use-users";
import type { AdminUser } from "./user-list";

/**
 * `/admin/users` — browse and find registered accounts.
 *
 * Read-only by design: every row links to `/admin/users/[id]`, which is the one
 * place an account can be changed. Keeping the list free of inline action
 * buttons means a search result you did not mean to click cannot be altered.
 */
export function UsersView() {
  return (
    <ToastProvider>
      <UsersPage />
    </ToastProvider>
  );
}

function UsersPage() {
  const { users, loading, loaded, errorEvent, fetchUsers } = useUsersData();
  const { query, setQuery, sort, setSort, page, setPage, pageSize, setPageSize, pageCount, filtered, rows } =
    useUserList(users);

  const { notify } = useToast();

  useEffect(() => {
    if (errorEvent) notify(errorEvent.message, "error");
  }, [errorEvent, notify]);

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
        render: (user) => (
          <span className="text-mono text-sm break-all text-muted">{user.email}</span>
        ),
      },
      {
        key: "role",
        header: "Role",
        hideBelow: "lg",
        render: (user) =>
          user.isAdmin ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Admin
            </span>
          ) : (
            <span className="text-sm text-muted">Player</span>
          ),
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

  // Distinguish "no users at all" from "your search matched nothing" — the
  // latter should tell you to clear the box rather than imply an empty site.
  const searching = query.trim().length > 0;

  return (
    <AdminPage>
      <AdminPageHeader
        icon={UsersIcon}
        title="Users"
        description="Browse and search registered accounts"
        actions={
          <button
            onClick={fetchUsers}
            disabled={loading}
              className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Refresh
          </button>
        }
      />

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
    </AdminPage>
  );
}

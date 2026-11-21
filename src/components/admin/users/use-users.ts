"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@/types";
import type { AdminSort } from "@/components/admin/admin-table";
import { filterUsers, pageCountFor, paginate, sortUsers, type AdminUser } from "./user-list";

export function useUsersData() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  /** Latches once the request settles, so refresh never blanks the table. */
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextErrorId = useRef(0);
  const [errorEvent, setErrorEvent] = useState<{ id: number; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const reportError = useCallback((message: string) => {
    setError(message);
    setErrorEvent({ id: nextErrorId.current++, message });
  }, []);

  /**
   * One request: the analytics response carries the active accounts, the
   * soft-deleted accounts (Trash), and each active account's own `totalXp`.
   *
   * XP used to be derived from a leaderboard fetch, which was wrong twice over:
   * the standings exclude admin accounts and hidden players, so the admin row
   * and every suppressed account rendered blank. The server totals every
   * account, so the column is populated for all of them.
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsRes = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!analyticsRes.ok) throw new Error("Failed to load users");

      const analytics = await analyticsRes.json();
      const toAdminUser = (user: User & { totalXp?: number }): AdminUser => ({
        ...user,
        totalXp: Number.isFinite(user.totalXp) ? Number(user.totalXp) : null,
      });

      setUsers(
        Array.isArray(analytics.users) ? (analytics.users as (User & { totalXp?: number })[]).map(toAdminUser) : []
      );
      setDeletedUsers(
        Array.isArray(analytics.deletedUsers)
          ? (analytics.deletedUsers as (User & { totalXp?: number })[]).map(toAdminUser)
          : []
      );
    } catch (err) {
      reportError(err instanceof Error && err.message ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [reportError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /** Restores an account from Trash, then re-reads both lists. */
  const restore = useCallback(
    async (id: string): Promise<boolean> => {
      setBusy(true);
      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          reportError(typeof body?.error === "string" ? body.error : "Failed to restore account");
          return false;
        }
        await fetchUsers();
        return true;
      } catch {
        reportError("Failed to restore account");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [fetchUsers, reportError]
  );

  /** Permanently erases an account already in Trash. */
  const purge = useCallback(
    async (id: string): Promise<boolean> => {
      setBusy(true);
      try {
        const res = await fetch(`/api/admin/users/${id}?permanent=1`, { method: "DELETE" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          reportError(typeof body?.error === "string" ? body.error : "Failed to erase account");
          return false;
        }
        await fetchUsers();
        return true;
      } catch {
        reportError("Failed to erase account");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [fetchUsers, reportError]
  );

  return {
    users,
    deletedUsers,
    loading,
    loaded,
    busy,
    error,
    errorEvent,
    fetchUsers,
    restore,
    purge,
  };
}

export const DEFAULT_USERS_PAGE_SIZE = 25;

/**
 * Client-side filter → sort → paginate pipeline.
 *
 * The page is clamped rather than reset when the result set shrinks, so a
 * narrowed search can never strand the viewer on a page that no longer exists.
 */
export function useUserList(users: AdminUser[]) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AdminSort>({ key: "joined", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_USERS_PAGE_SIZE);

  const filtered = useMemo(() => sortUsers(filterUsers(users, query), sort), [users, query, sort]);

  const pageCount = pageCountFor(filtered.length, pageSize);
  // Clamping only at render time leaves `page` stale: clear a narrow search and
  // the table jumps back to a page the user never asked for. Persist the clamp.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);
  const safePage = Math.min(page, pageCount);
  const rows = useMemo(() => paginate(filtered, safePage, pageSize), [filtered, safePage, pageSize]);

  return {
    query,
    setQuery,
    sort,
    setSort,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    filtered,
    rows,
  };
}

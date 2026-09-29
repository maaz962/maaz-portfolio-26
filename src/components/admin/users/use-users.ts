"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@/types";
import type { AdminSort } from "@/components/admin/admin-table";
import { filterUsers, pageCountFor, paginate, sortUsers, type AdminUser } from "./user-list";

export function useUsersData() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  /** Latches once the request settles, so refresh never blanks the table. */
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextErrorId = useRef(0);
  const [errorEvent, setErrorEvent] = useState<{ id: number; message: string } | null>(null);

  const reportError = useCallback((message: string) => {
    setError(message);
    setErrorEvent({ id: nextErrorId.current++, message });
  }, []);

  /**
   * One request: the analytics response carries both the user records and each
   * account's own `totalXp`.
   *
   * XP used to be derived from a leaderboard fetch, which was wrong twice over:
   * the `?admin=1` branch it called was removed in an earlier step (so the
   * column silently fell back to the public top 10), and the standings that
   * back the board exclude admin accounts and hidden players, so the admin row
   * and every suppressed account rendered blank. A user with no progress is now
   * an explicit 0 rather than a null, which also makes the column sortable.
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsRes = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!analyticsRes.ok) throw new Error("Failed to load users");

      const analytics = await analyticsRes.json();
      const records: (User & { totalXp?: number })[] = Array.isArray(analytics.users)
        ? analytics.users
        : [];

      setUsers(
        records.map((user) => ({
          ...user,
          totalXp: Number.isFinite(user.totalXp) ? Number(user.totalXp) : null,
        }))
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

  return { users, loading, loaded, error, errorEvent, fetchUsers };
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

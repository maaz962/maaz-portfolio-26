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
   * Reuses the two endpoints the admin already has rather than adding a backend
   * route for this step: the analytics response carries the user records, and
   * the admin leaderboard response carries per-user XP.
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, leaderboardRes] = await Promise.all([
        fetch("/api/admin/analytics", { cache: "no-store" }),
        fetch("/api/games/leaderboard?admin=1", { cache: "no-store" }),
      ]);

      if (!analyticsRes.ok) throw new Error("Failed to load users");

      const analytics = await analyticsRes.json();
      const records: User[] = Array.isArray(analytics.users) ? analytics.users : [];

      // A leaderboard failure must not fail the page: XP is a sortable extra,
      // not the data the page is about.
      const xpById = new Map<string, number>();
      if (leaderboardRes.ok) {
        try {
          const board = await leaderboardRes.json();
          for (const entry of Array.isArray(board.entries) ? board.entries : []) {
            if (entry?.user?.id) xpById.set(entry.user.id, Number(entry.totalXp) || 0);
          }
        } catch {
          /* XP column degrades to "—" */
        }
      }

      setUsers(
        records.map((user) => ({
          ...user,
          totalXp: xpById.has(user.id) ? xpById.get(user.id)! : null,
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

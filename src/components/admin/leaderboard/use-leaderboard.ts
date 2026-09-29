"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminLeaderboardPage, AdminLeaderboardSortKey } from "@/types";
import type { AdminSort } from "@/components/admin/admin-table";

/** One-shot result message for the toast viewport. */
export interface LeaderboardFeedback {
  id: number;
  message: string;
  variant: "success" | "error";
}

export interface LeaderboardState {
  data: AdminLeaderboardPage | null;
  loading: boolean;
  /** True once the first request has settled, successfully or not. */
  loaded: boolean;
  feedback: LeaderboardFeedback | null;
  query: string;
  sort: AdminSort;
  page: number;
  pageSize: number;
  setQuery: (value: string) => void;
  setSort: (sort: AdminSort) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
}

const DEBOUNCE_MS = 250;

/**
 * Server-side paging, search and sort for the admin leaderboard.
 *
 * Unlike the users list, this does not hold the whole dataset and slice it
 * client-side: the response is already one page, so every control change is a
 * round trip and the browser never holds more than `pageSize` rows. That is the
 * point of the move — the previous version fetched up to 1,000 rows to render
 * a list nobody scrolls to the end of.
 */
export function useLeaderboard(): LeaderboardState {
  const [data, setData] = useState<AdminLeaderboardPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [feedback, setFeedback] = useState<LeaderboardFeedback | null>(null);

  const [query, setQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState<AdminSort>({ key: "rank", direction: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [nonce, setNonce] = useState(0);

  const nextId = useRef(0);
  const report = useCallback((message: string, variant: LeaderboardFeedback["variant"]) => {
    setFeedback({ id: nextId.current++, message, variant });
  }, []);

  // Typing should not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Any change to the result set invalidates the current page: staying on page
  // 4 of a result set that just shrank to one page shows an empty table.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setPage(1);
  }, [debouncedQuery, sort, pageSize]);

  useEffect(() => {
    const controller = new AbortController();
    const search = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort: sort.key,
      direction: sort.direction,
    });
    if (debouncedQuery.trim()) search.set("q", debouncedQuery.trim());

    setLoading(true);
    fetch(`/api/admin/leaderboard?${search.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(typeof body?.error === "string" ? body.error : "Failed to load leaderboard");
        }
        return res.json();
      })
      .then((body: AdminLeaderboardPage) => {
        setData(body);
        // The server clamps an out-of-range page, so adopt whatever it resolved
        // to rather than showing a pager that disagrees with the table.
        if (body.page !== page) setPage(body.page);
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        report(error.message, "error");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoaded(true);
        }
      });

    return () => controller.abort();
  }, [page, pageSize, sort, debouncedQuery, nonce, report]);

  const setQuery = useCallback((value: string) => setQueryState(value), []);

  return {
    data,
    loading,
    loaded,
    feedback,
    query,
    sort,
    page,
    pageSize,
    setQuery,
    setSort: setSort as (next: AdminSort) => void,
    setPage,
    setPageSize,
    refresh: () => setNonce((n) => n + 1),
  };
}

export const LEADERBOARD_SORT_KEYS: readonly AdminLeaderboardSortKey[] = [
  "rank",
  "xp",
  "name",
  "streak",
];

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminLogPage, AdminLogSortKey } from "@/types/tracking";
import type { AdminSort } from "@/components/admin/admin-table";

/** One-shot result message for the toast viewport. */
export interface LogsFeedback {
  id: number;
  message: string;
  variant: "success" | "error";
}

export interface LogsState {
  data: AdminLogPage | null;
  loading: boolean;
  /** True once the first request has settled, successfully or not. */
  loaded: boolean;
  feedback: LogsFeedback | null;
  query: string;
  device: string;
  sort: AdminSort;
  page: number;
  pageSize: number;
  expandedId: string | null;
  setQuery: (value: string) => void;
  setDevice: (value: string) => void;
  setSort: (sort: AdminSort) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setExpandedId: (id: string | null) => void;
  refresh: () => void;
}

const DEBOUNCE_MS = 250;

/**
 * Server-side paging, search, device filter and sort for the visitor logs.
 *
 * Same shape as the leaderboard hook on purpose: the response is already one
 * page, so the browser never holds more than `pageSize` rows and the previous
 * "fetch the newest 100 and render them all" behaviour cannot come back.
 */
export function useLogs(): LogsState {
  const [data, setData] = useState<AdminLogPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [feedback, setFeedback] = useState<LogsFeedback | null>(null);

  const [query, setQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [device, setDevice] = useState("");
  const [sort, setSort] = useState<AdminSort>({ key: "time", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const nextId = useRef(0);
  const report = useCallback((message: string, variant: LogsFeedback["variant"]) => {
    setFeedback({ id: nextId.current++, message, variant });
  }, []);

  // Typing should not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Any change to the result set invalidates the current page, and the open
  // row too: that session is probably not in the new result set.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setPage(1);
    setExpandedId(null);
  }, [debouncedQuery, device, sort, pageSize]);

  useEffect(() => {
    const controller = new AbortController();
    const search = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort: sort.key,
      direction: sort.direction,
    });
    if (debouncedQuery.trim()) search.set("q", debouncedQuery.trim());
    if (device) search.set("device", device);

    setLoading(true);
    fetch(`/api/admin/logs?${search.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(typeof body?.error === "string" ? body.error : "Failed to load logs");
        }
        return res.json();
      })
      .then((body: AdminLogPage) => {
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
  }, [page, pageSize, sort, debouncedQuery, device, nonce, report]);

  const setQuery = useCallback((value: string) => setQueryState(value), []);

  return {
    data,
    loading,
    loaded,
    feedback,
    query,
    device,
    sort,
    page,
    pageSize,
    expandedId,
    setQuery,
    setDevice,
    setSort: setSort as (next: AdminSort) => void,
    setPage,
    setPageSize,
    setExpandedId,
    refresh: () => setNonce((n) => n + 1),
  };
}

export const LOG_SORT_KEYS: readonly AdminLogSortKey[] = [
  "time",
  "ip",
  "page",
  "device",
  "browser",
  "os",
];

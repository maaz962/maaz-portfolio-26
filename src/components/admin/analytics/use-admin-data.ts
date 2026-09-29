"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VisitorLog, VisitorStats } from "@/types/tracking";

/**
 * A one-shot result message for the toast viewport.
 *
 * Keyed by `id` rather than held as a plain string: setting the same message
 * twice in a row would otherwise be a no-op state change, and the second
 * failure would stay silent.
 */
export interface AdminFeedback {
  id: number;
  message: string;
  variant: "success" | "error";
}

export interface AdminData {
  stats: VisitorStats | null;
  logs: VisitorLog[];
  loading: boolean;
  /** True once the analytics request has settled (successfully or not). */
  loaded: boolean;
  feedback: AdminFeedback | null;
  expandedLog: string | null;
  setExpandedLog: (id: string | null) => void;
  fetchData: () => Promise<void>;
}

/**
 * Read-only state for the admin Overview page: the analytics snapshot and the
 * visitor log preview.
 *
 * No mutations live here, and no leaderboard. The leaderboard used to be
 * fetched here as one unbounded list for a section that has since moved to
 * `/admin/leaderboard` with server-side paging; leaving the fetch behind would
 * have kept paying for 1,000 rows the page never renders.
 *
 * `loaded` separates "still fetching" from "fetched and genuinely empty" so
 * panels show a loading skeleton rather than an empty state on first paint. It
 * latches true and is never reset, so Refresh re-fetches in the background
 * without flashing the skeleton over content the admin is already reading.
 */
export function useAdminData(): AdminData {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);
  const nextFeedbackId = useRef(0);

  const report = useCallback((message: string, variant: AdminFeedback["variant"]) => {
    setFeedback({ id: nextFeedbackId.current++, message, variant });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // The admin read side of the tracking data has its own route; the
      // dashboard calls that instead of borrowing the public /api/track path.
      // GET /api/track still re-exports it as a safety net for anything else.
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!res.ok) {
        report(await getResponseError(res, "Failed to load data"), "error");
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setLogs(data.logs);
    } catch {
      report("Failed to load data", "error");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [report]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    logs,
    loading,
    loaded,
    feedback,
    expandedLog,
    setExpandedLog,
    fetchData,
  };
}

async function getResponseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

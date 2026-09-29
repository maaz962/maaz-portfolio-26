"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VisitorStats } from "@/types/tracking";

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
  loading: boolean;
  /** True once the analytics request has settled (successfully or not). */
  loaded: boolean;
  feedback: AdminFeedback | null;
  fetchData: () => Promise<void>;
}

/**
 * Read-only state for the admin Overview page: the analytics snapshot.
 *
 * No mutations live here, and neither of the two heavy lists that used to hang
 * off this hook:
 *
 * - the leaderboard is at `/admin/leaderboard` and the visitor logs at
 *   `/admin/logs`, both paged on the server, so this page fetches a summary
 *   instead of paying for rows it never renders
 *
 * "Recent Events" is unaffected: it reads `stats.recentActivity`, which is
 * aggregated in the analytics route and is not the paginated log list.
 *
 * `loaded` separates "still fetching" from "fetched and genuinely empty" so
 * panels show a loading skeleton rather than an empty state on first paint. It
 * latches true and is never reset, so Refresh re-fetches in the background
 * without flashing the skeleton over content the admin is already reading.
 */
export function useAdminData(): AdminData {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
    loading,
    loaded,
    feedback,
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

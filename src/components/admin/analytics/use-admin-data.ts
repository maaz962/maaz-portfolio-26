"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VisitorLog, VisitorStats } from "@/types/tracking";
import type { LeaderboardEntry } from "@/types";

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
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  /** True once the analytics request has settled (successfully or not). */
  loaded: boolean;
  /** True once the leaderboard request has settled (successfully or not). */
  leaderboardLoaded: boolean;
  feedback: AdminFeedback | null;
  expandedLog: string | null;
  setExpandedLog: (id: string | null) => void;
  fetchData: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
}

/**
 * Read-only state for the admin Overview page: the analytics snapshot, the
 * visitor log preview and the leaderboard.
 *
 * No mutations live here any more. XP changes and deletes moved to
 * `/admin/users/[id]`, so every per-user write now happens in exactly one place
 * with one confirmation flow — see `useUserDetail`.
 *
 * `loaded` / `leaderboardLoaded` are what separate "still fetching" from
 * "fetched and genuinely empty" — panels need that distinction to show a
 * loading skeleton rather than an empty state on first paint. They latch true
 * and are never reset, so a Refresh re-fetches in the background without
 * flashing the skeleton over content the admin is already reading.
 */
export function useAdminData(): AdminData {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [leaderboardLoaded, setLeaderboardLoaded] = useState(false);
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

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/games/leaderboard?admin=1", {
        cache: "no-store",
      });
      if (!res.ok) {
        report(await getResponseError(res, "Failed to load leaderboard"), "error");
        return;
      }
      const data = await res.json();
      setLeaderboard(Array.isArray(data.entries) ? data.entries : []);
    } catch {
      report("Failed to load leaderboard", "error");
    } finally {
      setLeaderboardLoaded(true);
    }
  }, [report]);

  useEffect(() => {
    fetchData();
    fetchLeaderboard();
  }, [fetchData, fetchLeaderboard]);

  return {
    stats,
    logs,
    leaderboard,
    loading,
    loaded,
    leaderboardLoaded,
    feedback,
    expandedLog,
    setExpandedLog,
    fetchData,
    fetchLeaderboard,
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

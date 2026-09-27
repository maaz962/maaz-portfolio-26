"use client";

import { useState, useEffect, useCallback } from "react";
import type { VisitorLog, VisitorStats } from "@/types/tracking";
import type { User, LeaderboardEntry } from "@/types";

export interface AdminData {
  stats: VisitorStats | null;
  logs: VisitorLog[];
  users: User[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string;
  notice: string;
  busy: string | null;
  expandedLog: string | null;
  setExpandedLog: (id: string | null) => void;
  fetchData: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  adjustXp: (id: string, delta: number) => Promise<void>;
  removeUser: (user: DeletableUser) => Promise<void>;
}

/**
 * All dashboard state and mutations, moved verbatim out of the former
 * `AnalyticsClient` component (which was 555 lines mixing fetching,
 * mutations and rendering).
 */
export function useAdminData(): AdminData {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // The admin read side of the tracking data now has its own route; the
      // dashboard calls that instead of borrowing the public /api/track path.
      // GET /api/track still re-exports it as a safety net for anything else.
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!res.ok) {
        setError(await getResponseError(res, "Failed to load data"));
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setLogs(data.logs);
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/games/leaderboard?admin=1", {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(await getResponseError(res, "Failed to load leaderboard"));
        return;
      }
      const data = await res.json();
      setLeaderboard(Array.isArray(data.entries) ? data.entries : []);
    } catch {
      setError("Failed to load leaderboard");
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchLeaderboard();
  }, [fetchData, fetchLeaderboard]);

  const adjustXp = useCallback(async (id: string, delta: number) => {
    if (busy) return;
    setBusy(`${id}:xp`);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${id}/xp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data?.error === "string"
            ? data.error
            : "Failed to update XP"
        );
        return;
      }

      setLeaderboard((current) =>
        current.map((entry) =>
          entry.user.id === id && Number.isInteger(data.totalXp)
            ? { ...entry, totalXp: data.totalXp }
            : entry
        )
      );
      setNotice(
        `XP updated by ${delta > 0 ? "+" : ""}${delta}.`
      );
      await fetchLeaderboard();
    } catch {
      setError("Failed to update XP");
    } finally {
      setBusy(null);
    }
  }, [busy, fetchLeaderboard]);

  const removeUser = useCallback(async (user: DeletableUser) => {
    if (busy || user.isAdmin) return;
    if (
      !window.confirm(
        `Delete @${user.username} and all of their progress, comments and likes? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(`${user.id}:del`);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(await getResponseError(res, "Failed to delete user"));
        return;
      }

      setUsers((current) => current.filter((item) => item.id !== user.id));
      setLeaderboard((current) =>
        current.filter((entry) => entry.user.id !== user.id)
      );
      setNotice(`@${user.username} was deleted.`);
      await Promise.all([fetchLeaderboard(), fetchData()]);
    } catch {
      setError("Failed to delete user");
    } finally {
      setBusy(null);
    }
  }, [busy, fetchLeaderboard, fetchData]);

  return {
    stats,
    logs,
    users,
    leaderboard,
    loading,
    error,
    notice,
    busy,
    expandedLog,
    setExpandedLog,
    fetchData,
    fetchLeaderboard,
    adjustXp,
    removeUser,
  };
}

export type DeletableUser = Pick<User, "id" | "name" | "username"> &
  Partial<Pick<User, "isAdmin">>;

async function getResponseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

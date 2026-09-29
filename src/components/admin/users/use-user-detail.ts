"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminUserDetail } from "@/types";

/** One-shot result message for the toast viewport. */
export interface DetailFeedback {
  id: number;
  message: string;
  variant: "success" | "error";
}

export interface UserDetailState {
  detail: AdminUserDetail | null;
  loading: boolean;
  loaded: boolean;
  /** True while a mutation is in flight; disables the matching controls. */
  saving: boolean;
  feedback: DetailFeedback | null;
  reload: () => Promise<void>;
  setTotalXp: (totalXp: number, reason: string) => Promise<boolean>;
  setHidden: (hidden: boolean) => Promise<boolean>;
  remove: () => Promise<boolean>;
}

export function useUserDetail(userId: string): UserDetailState {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<DetailFeedback | null>(null);
  const nextId = useRef(0);

  const report = useCallback((message: string, variant: DetailFeedback["variant"]) => {
    setFeedback({ id: nextId.current++, message, variant });
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        report(typeof body?.error === "string" ? body.error : "Failed to load user", "error");
        return;
      }
      setDetail(await res.json());
    } catch {
      report("Failed to load user", "error");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [report, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Every mutation returns whether it succeeded so the caller can decide
   * whether to leave a confirmation open — clearing a form on a failed write
   * loses the admin's typing, which is the whole point of the reason field.
   */
  const patch = useCallback(
    async (body: Record<string, unknown>, pending: string): Promise<boolean> => {
      setSaving(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          report(typeof data?.error === "string" ? data.error : pending, "error");
          return false;
        }
        // The endpoint returns the recomputed detail so the page can never show
        // a stale total after a write.
        if (data?.detail) setDetail(data.detail);
        return true;
      } catch {
        report(pending, "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [report, userId]
  );

  const setTotalXp = useCallback(
    (totalXp: number, reason: string) => patch({ totalXp, reason }, "Failed to update XP"),
    [patch]
  );

  const setHidden = useCallback(
    (hidden: boolean) => patch({ hiddenFromLeaderboard: hidden }, "Failed to update visibility"),
    [patch]
  );

  const remove = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        report(typeof data?.error === "string" ? data.error : "Failed to delete user", "error");
        return false;
      }
      return true;
    } catch {
      report("Failed to delete user", "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [report, userId]);

  return { detail, loading, loaded, saving, feedback, reload, setTotalXp, setHidden, remove };
}

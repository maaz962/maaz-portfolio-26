"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, Users, Globe, MousePointerClick, Monitor, Smartphone, Tablet,
  Eye, Clock, MapPin, RefreshCw, ChevronDown, ChevronUp, Sparkles, UserCheck,
  Trophy, Trash2, Loader2,
} from "lucide-react";
import type { VisitorLog, VisitorStats } from "@/types/tracking";
import type { User, LeaderboardEntry } from "@/types";

type DeletableUser = Pick<User, "id" | "name" | "username"> &
  Partial<Pick<User, "isAdmin">>;

async function getResponseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export function AnalyticsClient() {
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
      const res = await fetch("/api/track", { cache: "no-store" });
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

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">Analytics Dashboard</h1>
              <p className="text-xs text-muted">Portfolio visitor tracking &amp; event logs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchData();
                fetchLeaderboard();
              }}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {notice && !error && (
          <p className="text-sm text-green-600 dark:text-green-400">{notice}</p>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Users} label="Total Visits" value={stats.totalVisitors} />
            <StatCard icon={Globe} label="Unique IPs" value={stats.uniqueIPs} />
            <StatCard icon={MousePointerClick} label="Total Events" value={stats.totalEvents} />
            <StatCard icon={Eye} label="Top Page" value={stats.topPages[0]?.page || "-"} />
          </div>
        )}

        {/* Charts Row */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BarChart title="Browsers" data={stats.browsers.map((b) => ({ label: b.name, value: b.count }))} />
            <BarChart title="Devices" data={stats.devices.map((d) => ({ label: d.name, value: d.count }))} />
            <BarChart title="Top Pages" data={stats.topPages.map((p) => ({ label: p.page, value: p.count }))} />
          </div>
        )}

        {/* Locations */}
        {stats && stats.locations.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Visitor Locations
            </h3>
            <div className="space-y-2">
              {stats.locations.slice(0, 10).map((loc, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-background-secondary/50 px-3 py-2">
                  <span className="text-xs text-foreground">
                    {loc.city}, {loc.country}
                  </span>
                  <span className="text-mono text-xs text-muted">{loc.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visitor Interests */}
        {stats && stats.interests.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Visitor Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.interests.slice(0, 20).map((it, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-secondary/50 px-3 py-1.5 text-xs text-foreground"
                >
                  {it.label}
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-mono text-primary">
                    {it.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        {stats && stats.recentActivity.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" /> Recent Events
            </h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {stats.recentActivity.map((evt, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-background-secondary/30 px-3 py-1.5 text-xs">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-medium ${
                    evt.type === "pageview" ? "bg-primary/10 text-primary" :
                    evt.type === "click" ? "bg-secondary/10 text-secondary" :
                    evt.type === "scroll" ? "bg-accent/10 text-accent" :
                    "bg-muted/10 text-muted"
                  }`}>
                    {evt.type}
                  </span>
                  <span className="truncate text-foreground/80">{evt.target}</span>
                  {evt.data && <span className="shrink-0 text-muted">{evt.data}</span>}
                  <span className="ml-auto shrink-0 text-muted/60 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visitor Logs */}
        {logs.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4 text-primary" /> Visitor Logs (Last 100)
            </h3>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-border bg-background-secondary/30">
                  <button
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-mono font-medium text-foreground">{log.ip}</span>
                      <span className="flex items-center gap-1 text-muted">
                        {log.device === "Mobile" ? <Smartphone className="h-3 w-3" /> :
                         log.device === "Tablet" ? <Tablet className="h-3 w-3" /> :
                         <Monitor className="h-3 w-3" />}
                        {log.browser} / {log.os}
                      </span>
                      {log.location && (
                        <span className="flex items-center gap-1 text-muted">
                          <Globe className="h-3 w-3" />
                          {log.location.city}, {log.location.country}
                        </span>
                      )}
                      <span className="text-muted/60">{log.page}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-mono text-[0.65rem] text-muted/60">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {expandedLog === log.id ? <ChevronUp className="h-3.5 w-3.5 text-muted" /> : <ChevronDown className="h-3.5 w-3.5 text-muted" />}
                    </div>
                  </button>

                  {expandedLog === log.id && (
                    <div className="border-t border-border px-4 py-3 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoRow label="IP Address" value={log.ip} />
                        <InfoRow label="User Agent" value={log.userAgent.slice(0, 80)} />
                        <InfoRow label="Language" value={log.language} />
                        <InfoRow label="Timezone" value={log.timezone} />
                        <InfoRow label="Screen" value={log.screenResolution} />
                        <InfoRow label="Referrer" value={log.referrer} />
                        <InfoRow label="ISP" value={log.location?.isp || "Unknown"} />
                        <InfoRow label="Coordinates" value={log.location ? `${log.location.lat}, ${log.location.lon}` : "Unknown"} />
                      </div>

                      {Object.keys(log.cookies).length > 0 && (
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted/60 mb-1.5">Cookies</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(log.cookies).map(([k, v]) => (
                              <span key={k} className="rounded-md bg-background-secondary border border-border px-2 py-0.5 text-[0.6rem] font-mono text-muted">
                                {k}={v.slice(0, 30)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {log.events.length > 0 && (
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted/60 mb-1.5">Events ({log.events.length})</p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {log.events.map((evt, i) => (
                              <div key={i} className="flex items-center gap-2 text-[0.65rem]">
                                <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono ${
                                  evt.type === "pageview" ? "bg-primary/10 text-primary" :
                                  evt.type === "click" ? "bg-secondary/10 text-secondary" :
                                  "bg-muted/10 text-muted"
                                }`}>
                                  {evt.type}
                                </span>
                                <span className="text-foreground/70">{evt.target}</span>
                                {evt.data && <span className="text-muted">{evt.data}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registered Users */}
        {users.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <UserCheck className="h-4 w-4 text-primary" /> Registered Users ({users.length})
            </h3>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background-secondary/30 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-medium text-foreground">{u.name}</span>
                        {u.isAdmin && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-medium text-primary">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted">
                        @{u.username} &middot; {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-mono text-[0.65rem] text-muted/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                    <span className="hidden max-w-36 truncate text-mono text-[0.65rem] text-muted/60 sm:inline">
                      {u.id}
                    </span>
                    {u.isAdmin ? (
                      <span className="text-[0.65rem] text-muted/60">Protected</span>
                    ) : (
                      <button
                        onClick={() => removeUser(u)}
                        disabled={busy !== null}
                        className="flex h-7 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 text-[0.65rem] font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        title={`Delete @${u.username}`}
                      >
                        {busy === `${u.id}:del` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Games Leaderboard Manager */}
        {leaderboard.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Trophy className="h-4 w-4 text-primary" /> Games Leaderboard Manager
              </h3>
              <span className="text-xs text-muted">Adjust player XP or remove them</span>
            </div>
            <div className="space-y-2">
              {leaderboard.map((entry) => {
                const xpBusy = busy === `${entry.user.id}:xp`;
                const delBusy = busy === `${entry.user.id}:del`;
                return (
                  <div
                    key={entry.user.id}
                    className="rounded-xl border border-border bg-background-secondary/30 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-5 shrink-0 text-center font-mono text-xs font-semibold text-muted">
                          #{entry.rank}
                        </span>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {entry.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-xs font-medium text-foreground">{entry.user.name}</span>
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-medium text-primary">
                              Lv {entry.level}
                            </span>
                          </div>
                          <p className="truncate text-xs text-muted">
                            @{entry.user.username} &middot; {entry.gamesPlayed} games &middot; streak {entry.currentStreak}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {xpBusy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
                        <span className="mr-1 font-mono text-sm font-semibold text-foreground">{entry.totalXp} XP</span>
                        {([-100, -10, 10, 100] as const).map((step) => (
                          <button
                            key={step}
                            onClick={() => adjustXp(entry.user.id, step)}
                            disabled={busy !== null}
                            className={`rounded-lg border px-2 py-1 font-mono text-[0.6rem] font-medium transition-colors disabled:opacity-50 ${
                              step > 0
                                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                                : "border-border bg-card text-muted hover:border-secondary/40 hover:text-secondary"
                            }`}
                            title={step > 0 ? `Award ${step} XP` : `Deduct ${Math.abs(step)} XP`}
                          >
                            {step > 0 ? `+${step}` : step}
                          </button>
                        ))}
                        <button
                          onClick={() => removeUser(entry.user)}
                          disabled={busy !== null}
                          className="ml-1 flex h-6 w-6 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                          title={`Delete @${entry.user.username}`}
                        >
                          {delBusy ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats && stats.totalVisitors === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Users className="mx-auto h-8 w-8 text-muted/40" />
            <p className="mt-3 text-sm text-muted">No visitors yet. Data will appear here once someone visits your portfolio.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">{label}</span>
      </div>
      <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function BarChart({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate text-xs text-muted">{d.label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-background-secondary h-2">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="text-mono text-xs text-muted/60 w-6 text-right">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted/60">{label}</p>
      <p className="text-xs text-foreground/80 font-mono break-all">{value}</p>
    </div>
  );
}

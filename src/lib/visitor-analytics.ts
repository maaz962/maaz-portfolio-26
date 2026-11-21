import type { NamedCount, UtmParams, VisitorLog } from "@/types/tracking";

/**
 * Derived visitor metrics for the admin analytics pages.
 *
 * Everything here is computed from the retained session logs already fetched by
 * the analytics route — no extra query, and no second source of truth. The
 * definitions are deliberately simple enough to explain in the UI:
 *
 * - a visitor is a stable browser id (falling back to IP + user agent for logs
 *   recorded before that id existed)
 * - a session is one log row (one tracker flush)
 * - "new" = one session in the retained window, "returning" = more than one
 * - "online" = seen in the last 5 minutes
 * - a bounce = one pageview, no click/copy/input, under 60s and under 25% scroll
 */

export const ONLINE_WINDOW_MINUTES = 5;

const ONLINE_WINDOW_MS = ONLINE_WINDOW_MINUTES * 60 * 1000;

const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  fb: "Facebook",
  instagram: "Instagram",
  ig: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  x: "X / Twitter",
  youtube: "YouTube",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  reddit: "Reddit",
  whatsapp: "WhatsApp",
  newsletter: "Newsletter",
  email: "Email",
};

/** Stable identity for a session, with a fallback for legacy rows. */
function visitorKey(log: VisitorLog): string {
  if (log.visitorId) return `id:${log.visitorId}`;
  return `legacy:${log.ip}|${log.userAgent}`;
}

function timestampOf(log: VisitorLog): number {
  const value = Date.parse(log.timestamp);
  return Number.isFinite(value) ? value : 0;
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Hostname of a referrer URL, or an empty string for direct/unparseable values. */
function referrerHost(referrer: string): string {
  const value = (referrer || "").trim();
  if (!value || value === "direct") return "";
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * True when the token is a label of the referrer's registrable domain:
 * `google.co.uk` and `l.facebook.com` match, but `google.com.lookalike.example`
 * does not. A loose substring match let unrelated hosts inflate a channel.
 */
function hostMatchesToken(host: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Token plus a one- or two-part public suffix (.com / .co.uk).
  return new RegExp(`(^|\\.)${escaped}(\\.[a-z]{2,3}){1,2}$`).test(host);
}

/** Maps UTM source first, then the referrer host, into a readable channel. */
export function sourceOf(log: VisitorLog): string {
  const utmSource = (log.utm?.source ?? "").trim().toLowerCase();
  if (utmSource) return SOURCE_LABELS[utmSource] ?? titleCase(utmSource);

  const host = referrerHost(log.referrer);
  if (!host) return "Direct";

  // Short hosts that do not contain the brand name in a useful position.
  if (host === "fb.me" || host.endsWith(".fb.me")) return "Facebook";
  if (host === "t.co" || host === "x.com" || host.endsWith(".t.co") || host.endsWith(".x.com")) {
    return "X / Twitter";
  }
  if (host === "youtu.be") return "YouTube";
  if (host === "redd.it") return "Reddit";

  for (const [token, label] of Object.entries(SOURCE_LABELS)) {
    if (hostMatchesToken(host, token)) return label;
  }
  return "Other sites";
}

/** Human label for a session's UTM fields; empty when the visit is untagged. */
function utmLabel(utm: UtmParams | undefined): string {
  if (!utm) return "";
  const parts = [utm.source, utm.medium, utm.campaign]
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
  return parts.join(" · ");
}

function isBounced(log: VisitorLog): boolean {
  const events = log.events ?? [];
  const pageviews = events.filter((event) => event.type === "pageview").length;
  if (pageviews !== 1) return false;

  // These are deliberate engagement signals: simply loading a page is not.
  if (events.some((event) => ["click", "copy", "input"].includes(event.type))) return false;

  const timeEvent = events.find((event) => event.type === "time");
  if (!timeEvent?.data) return true; // legacy row: one pageview, nothing else

  const secondsMatch = timeEvent.data.match(/^(\d+)s/);
  const scrollMatch = timeEvent.data.match(/scroll:(\d+)%/);
  const seconds = secondsMatch ? Number(secondsMatch[1]) : 0;
  const scroll = scrollMatch ? Number(scrollMatch[1]) : 0;

  return seconds < 60 && scroll < 25;
}

export interface VisitorMetrics {
  totalVisitors: number;
  totalSessions: number;
  newVisitors: number;
  returningVisitors: number;
  onlineNow: number;
  bounceRate: number;
  bouncedSessions: number;
  uniqueIPs: number;
  sources: NamedCount[];
  utmCampaigns: NamedCount[];
}

export function computeVisitorMetrics(logs: VisitorLog[], now = Date.now()): VisitorMetrics {
  const sessions = new Map<string, VisitorLog[]>();
  const ips = new Set<string>();
  const sources = new Map<string, number>();
  const campaigns = new Map<string, number>();
  let bouncedSessions = 0;

  for (const log of logs) {
    const key = visitorKey(log);
    const group = sessions.get(key);
    if (group) group.push(log);
    else sessions.set(key, [log]);

    if (log.ip) ips.add(log.ip);

    const source = sourceOf(log);
    sources.set(source, (sources.get(source) ?? 0) + 1);

    const campaign = utmLabel(log.utm);
    if (campaign) campaigns.set(campaign, (campaigns.get(campaign) ?? 0) + 1);

    if (isBounced(log)) bouncedSessions++;
  }

  const visitorKeys = [...sessions.keys()];
  const newVisitors = visitorKeys.filter((key) => (sessions.get(key)?.length ?? 0) === 1).length;
  const returningVisitors = visitorKeys.length - newVisitors;

  const onlineNow = visitorKeys.filter((key) => {
    const last = Math.max(...(sessions.get(key) ?? []).map(timestampOf));
    return last > 0 && last <= now + 60_000 && now - last < ONLINE_WINDOW_MS;
  }).length;

  const sortedSources = [...sources.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const sortedCampaigns = [...campaigns.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return {
    totalVisitors: visitorKeys.length,
    totalSessions: logs.length,
    newVisitors,
    returningVisitors,
    onlineNow,
    bounceRate: logs.length === 0 ? 0 : Math.round((bouncedSessions / logs.length) * 100),
    bouncedSessions,
    uniqueIPs: ips.size,
    sources: sortedSources,
    utmCampaigns: sortedCampaigns,
  };
}

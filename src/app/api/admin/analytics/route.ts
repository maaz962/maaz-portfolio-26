import { NextRequest, NextResponse } from "next/server";
import type { VisitorLog, VisitorStats, TrackingEvent } from "@/types/tracking";
import type { User } from "@/types";
import { getAdminUser } from "@/lib/auth";
import { listUsers } from "@/lib/db";
import { listLogs } from "@/lib/tracking-store";

/** Turns a click event (target like "a:https://...", data like text) into a human-readable interest label. */
function parseInterestTarget(target: string, data?: string): { label: string } | null {
  const text = (data || "").trim();
  const hrefMatch = target.match(/^a:(.+)$/);
  const href = hrefMatch ? (hrefMatch[1] ?? "").trim() : undefined;

  if (href) {
    // Internal anchor → portfolio section interest
    if (href.startsWith("/#")) {
      const section = href.split("#")[1];
      if (section) return { label: `Section: ${section}` };
    }
    // Absolute external link → domain + path interest
    if (/^https?:\/\//i.test(href)) {
      try {
        const url = new URL(href);
        const domain = url.hostname.replace(/^www\./, "");
        const path = url.pathname === "/" ? "" : url.pathname;
        return { label: `${domain}${path}`.slice(0, 40) };
      } catch {
        /* fall through to text label */
      }
    }
  }

  if (text) return { label: text.slice(0, 40) };
  return null;
}

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const visitorLogs = await listLogs();

  const uniqueIPs = new Set(visitorLogs.map((v) => v.ip)).size;

  const pageCount: Record<string, number> = {};
  const refCount: Record<string, number> = {};
  const browserCount: Record<string, number> = {};
  const deviceCount: Record<string, number> = {};
  const locCount: Record<string, number> = {};
  const locations: { country: string; city: string; count: number }[] = [];

  visitorLogs.forEach((v) => {
    pageCount[v.page] = (pageCount[v.page] || 0) + 1;
    if (v.referrer && v.referrer !== "direct") refCount[v.referrer] = (refCount[v.referrer] || 0) + 1;
    browserCount[v.browser] = (browserCount[v.browser] || 0) + 1;
    deviceCount[v.device] = (deviceCount[v.device] || 0) + 1;
    if (v.location) {
      const key = `${v.location.country}|${v.location.city}`;
      locCount[key] = (locCount[key] || 0) + 1;
    }
  });

  Object.entries(locCount).forEach(([key, count]) => {
    const parts = key.split("|");
    locations.push({ country: parts[0] || "Unknown", city: parts[1] || "Unknown", count });
  });

  const allEvents = visitorLogs.flatMap((v) => v.events);

  // Interest = the things visitors actively engage with: external links they
  // click, interactive elements (buttons/anchors) they tap, and portfolio
  // sections they open. Excludes generic internals (time/page targeting).
  const interestCount: Record<string, number> = {};
  allEvents.forEach((evt: TrackingEvent) => {
    if (evt.type === "click") {
      const target = parseInterestTarget(evt.target, evt.data);
      if (target) interestCount[target.label] = (interestCount[target.label] || 0) + 1;
    } else if (evt.type === "pageview") {
      const section = evt.target.startsWith("#") ? evt.target.slice(1) : "";
      if (section) {
        const key = `Section: ${section}`;
        interestCount[key] = (interestCount[key] || 0) + 1;
      }
    }
  });
  const interests = Object.entries(interestCount)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const stats: VisitorStats = {
    totalVisitors: visitorLogs.length,
    uniqueIPs,
    totalEvents: allEvents.length,
    topPages: Object.entries(pageCount)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count),
    topReferrers: Object.entries(refCount)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count),
    browsers: Object.entries(browserCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    devices: Object.entries(deviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    locations: locations.sort((a, b) => b.count - a.count),
    recentActivity: allEvents.slice(-50).reverse(),
    interests,
  };

  let users: User[] = [];
  try {
    users = await listUsers();
  } catch {}

  // `logs` is gone from this response. The Overview no longer renders a log
  // list, and every request was paying to serialize the newest 100 sessions —
  // with their events and cookies — for a page that only draws stat cards,
  // charts and the `recentActivity` preview above. The full list is
  // GET /api/admin/logs, one page at a time. `stats.recentActivity` is
  // aggregated here and is unaffected.
  return NextResponse.json({ stats, users });
}

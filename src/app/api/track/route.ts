import { NextRequest, NextResponse } from "next/server";
import type { VisitorLog, VisitorStats, TrackingEvent } from "@/types/tracking";
import type { User } from "@/types";
import { getAdminUser } from "@/lib/auth";
import { listUsers } from "@/lib/db";
import { listLogs, appendLog } from "@/lib/tracking-store";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

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

function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let device = "Desktop";
  if (ua.includes("Mobile") || ua.includes("Android")) device = "Mobile";
  else if (ua.includes("iPad")) device = "Tablet";

  return { browser, os, device };
}

function getClientIP(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim();
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}

async function geolocate(ip: string): Promise<VisitorLog["location"]> {
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.")) {
    return { country: "Local", region: "Localhost", city: "Local", lat: 0, lon: 0, isp: "Local" };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (data.status === "success") {
      return {
        country: data.country || "Unknown",
        region: data.regionName || "Unknown",
        city: data.city || "Unknown",
        lat: data.lat || 0,
        lon: data.lon || 0,
        isp: data.isp || "Unknown",
      };
    }
  } catch {}
  return { country: "Unknown", region: "Unknown", city: "Unknown", lat: 0, lon: 0, isp: "Unknown" };
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

  return NextResponse.json({ stats, logs: visitorLogs.slice(-100).reverse(), users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = getClientIP(req);
    const ua = req.headers.get("user-agent") || "Unknown";
    const referrer = req.headers.get("referer") || "direct";

    const { browser, os, device } = parseUserAgent(ua);
    const location = await geolocate(ip);

    const log: VisitorLog = {
      id: generateId(),
      ip,
      userAgent: ua,
      browser,
      os,
      device,
      language: body.language || "Unknown",
      timezone: body.timezone || "Unknown",
      screenResolution: body.screenResolution || "Unknown",
      referrer,
      page: body.page || "/",
      timestamp: new Date().toISOString(),
      location,
      cookies: body.cookies || {},
      events: body.events || [],
    };

    await appendLog(log);

    return NextResponse.json({ success: true, id: log.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

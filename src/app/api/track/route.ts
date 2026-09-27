import { NextRequest, NextResponse } from "next/server";
import type { VisitorLog } from "@/types/tracking";
import { appendLog } from "@/lib/tracking-store";

/**
 * Public visitor-tracking endpoint: this POST is what the browser Tracker
 * calls, and it must stay unauthenticated.
 *
 * The admin-only read side of this data now lives at /api/admin/analytics.
 * It is re-exported here so any existing caller of GET /api/track keeps
 * working while the dashboard migrates to its dedicated route.
 */
export { GET } from "@/app/api/admin/analytics/route";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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

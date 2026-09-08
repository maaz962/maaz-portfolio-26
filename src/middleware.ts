import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionSecret } from "@/lib/session-constants";

/**
 * Gate for the /admin area:
 * - Redirects visitors without a valid signed session cookie to the admin
 *   login page. The signature + expiry are checked here (Edge Web Crypto) so a
 *   tampered or expired cookie is not enough to pass this gate.
 * - The login page itself stays reachable.
 *
 * This is a fast first line of defense — every admin page and API route
 * independently verifies the session AND admin privileges server-side.
 */
async function verifySessionCookie(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getSessionSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const header = parts[0]!;
    const payload = parts[1]!;
    const signature = parts[2]!;

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature).buffer as ArrayBuffer,
      new TextEncoder().encode(`${header}.${payload}`)
    );
    if (!valid) return false;

    // Check expiry.
    try {
      const claims = JSON.parse(fromUtf8Base64Url(payload));
      return typeof claims.exp === "number" && claims.exp >= Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

function fromBase64Url(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function fromUtf8Base64Url(input: string): string {
  const bytes = fromBase64Url(input);
  return new TextDecoder().decode(bytes);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const hasValidSession = await verifySessionCookie(req);
  if (!hasValidSession) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

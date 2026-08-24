import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session_user_id";

/**
 * Gate for the /admin area:
 * - Redirects visitors without a session cookie to the admin login page.
 * - The login page itself stays reachable.
 *
 * This is only a fast first line of defense (edge runtime cannot read the
 * JSON DB) — every admin page and API route independently verifies the
 * session AND admin privileges server-side.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

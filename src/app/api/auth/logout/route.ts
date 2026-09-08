import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Clear the cookie
  response.cookies.set(SESSION_COOKIE, "", {
    path: "/",
    expires: new Date(0),
  });
  return response;
}

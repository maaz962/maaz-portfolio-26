import { NextResponse } from "next/server";
import { validateCredentials } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { emailOrUsername, password } = await req.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Missing username/email or password" },
        { status: 400 }
      );
    }

    const user = await validateCredentials(emailOrUsername, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json(user);
    // Set a secure HttpOnly signed session cookie. The token is self-contained,
    // so it survives navigations, refreshes and cold starts. It is only ever
    // cleared by an explicit logout.
    response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
      path: "/",
      httpOnly: true,
      secure: new URL(req.url).protocol === "https:",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE, // 1 year — persistent like Instagram
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { registerUser } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { name, username, email, password } = await req.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid field types" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return NextResponse.json(
        { error: "Username must be 3-30 characters long" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, dashes and underscores" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > 80) {
      return NextResponse.json(
        { error: "Please provide a valid name (max 80 characters)" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password must be at most 128 characters long" },
        { status: 400 }
      );
    }

    const user = await registerUser(name, trimmedUsername, email, password);

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

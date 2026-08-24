import { NextResponse } from "next/server";
import { validateCredentials } from "@/lib/db";

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
    // Set secure HttpOnly session cookie
    response.cookies.set("session_user_id", user.id, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

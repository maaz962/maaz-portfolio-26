import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { consumeDailyHint, getDailyHintUsage } from "@/lib/db";
import { DAILY_HINT_LIMIT } from "@/lib/gamification";

/** GET /api/games/hints — how many hints the user has left today (shared across games). */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to use hints." },
        { status: 401 }
      );
    }
    const usage = await getDailyHintUsage(user.id);
    return NextResponse.json({ ...usage, limit: DAILY_HINT_LIMIT });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/games/hints — reveals cost one hint from the user's shared daily
 * pool of 3, which every game draws from. The server is the source of truth,
 * so the cap can never be circumvented by replaying a request or switching
 * games; the pool resets at midnight UTC.
 */
export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to use hints." },
        { status: 401 }
      );
    }
    const result = await consumeDailyHint(user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
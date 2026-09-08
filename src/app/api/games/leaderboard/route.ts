import { NextResponse } from "next/server";
import { getLeaderboard, getUserRank } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/games/leaderboard
 *   → { entries: LeaderboardEntry[], myRank: number | null }
 * Public: the top players list is visible to guests too; myRank is filled in
 * only when a session exists.
 */
export async function GET() {
  try {
    const entries = await getLeaderboard(10);
    const user = await getSessionUser();
    const myRank = user ? await getUserRank(user.id) : null;
    return NextResponse.json({ entries, myRank });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
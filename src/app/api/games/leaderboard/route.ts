import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, getUserRank } from "@/lib/db";
import { getAdminUser, getSessionUser } from "@/lib/auth";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

/**
 * GET /api/games/leaderboard
 *   → { entries: LeaderboardEntry[], myRank: number | null }
 * Public: the top players list is visible to guests too; myRank is filled in
 * only when a session exists.
 */
export async function GET(req: NextRequest) {
  try {
    if (req.nextUrl.searchParams.get("admin") === "1") {
      const admin = await getAdminUser();
      if (!admin) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401, headers: NO_STORE_HEADERS }
        );
      }

      const entries = await getLeaderboard(1000);
      return NextResponse.json(
        { entries, myRank: null },
        { headers: NO_STORE_HEADERS }
      );
    }

    const entries = await getLeaderboard(10);
    const user = await getSessionUser();
    const myRank = user ? await getUserRank(user.id) : null;
    return NextResponse.json(
      { entries, myRank },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

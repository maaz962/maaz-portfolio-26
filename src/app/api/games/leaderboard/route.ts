import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, getUserRank } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

/**
 * GET /api/games/leaderboard
 *   → { entries: LeaderboardEntry[], myRank: number | null }
 * Public: the top players list is visible to guests too; myRank is filled in
 * only when a session exists.
 *
 * This route is public-only. It used to also serve the admin panel behind
 * `?admin=1`, which put an admin-only 1,000-row response on a public URL
 * guarded by a query flag and made every admin page pay for a payload sized
 * for the worst case. The admin panel reads `/api/admin/leaderboard`, which is
 * admin-only by path and paginated.
 */
export async function GET(req: NextRequest) {
  try {
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

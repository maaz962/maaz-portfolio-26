import { NextResponse } from "next/server";
import { getLeaderboardSnapshot } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

/** How many rows the public board shows. The heading sizes itself from what
 *  comes back, so a short board reads as "the top 3" rather than a broken 10. */
const BOARD_SIZE = 10;

/**
 * GET /api/games/leaderboard
 *   → LeaderboardSnapshot
 *   { entries, limit, myRank, myEntry }
 * Public: the top players list is visible to guests too; `myRank`/`myEntry` are
 * filled in only when a session exists.
 *
 * Previously this called `getLeaderboard` + `getUserRank`, two independent
 * rankings of the same data, and when they disagreed the client rendered
 * "You are #4" above a list that had no #4 in it, with nothing to reconcile
 * against. `myEntry` is the same object the board is sliced from, so a viewer
 * inside the cut is always present in `entries`.
 *
 * This route is public-only. It used to also serve the admin panel behind
 * `?admin=1`, which put an admin-only 1,000-row response on a public URL
 * guarded by a query flag and made every admin page pay for a payload sized
 * for the worst case. The admin panel reads `/api/admin/leaderboard`, which is
 * admin-only by path and paginated.
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    const snapshot = await getLeaderboardSnapshot(BOARD_SIZE, user?.id ?? null);
    return NextResponse.json(snapshot, { headers: NO_STORE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

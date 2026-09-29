import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getAdminLeaderboardPage } from "@/lib/db";
import type { AdminLeaderboardQuery, AdminLeaderboardSortKey } from "@/types";

/**
 * GET /api/admin/leaderboard
 *   ?page=1&pageSize=25&q=&sort=rank&direction=asc
 *   → AdminLeaderboardPage
 *
 * Replaces the `?admin=1` branch that used to hang off the public
 * `/api/games/leaderboard` route. That put an admin-only 1,000-row response
 * behind a public URL guarded by a query flag, which meant the guard was one
 * refactor away from being wrong and every admin page inherited a 1,000-row
 * payload. This route is admin-only by path, and it returns one page.
 */
const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

const PAGE_SIZES = [25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

const SORT_KEYS: readonly AdminLeaderboardSortKey[] = ["rank", "xp", "name", "streak"];

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const params = req.nextUrl.searchParams;

  const rawSize = Number(params.get("pageSize"));
  const pageSize = (PAGE_SIZES as readonly number[]).includes(rawSize)
    ? rawSize
    : DEFAULT_PAGE_SIZE;

  const rawPage = Number(params.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawSort = params.get("sort") as AdminLeaderboardSortKey | null;
  const sort: AdminLeaderboardSortKey = rawSort && SORT_KEYS.includes(rawSort) ? rawSort : "rank";

  const rawDirection = params.get("direction");
  const direction = rawDirection === "desc" ? "desc" : "asc";

  // A pathological page number would make OFFSET enormous and the database
  // walk the whole table to produce nothing; the DB layer clamps anyway.
  const query: AdminLeaderboardQuery = {
    page: Math.min(page, 10_000),
    pageSize,
    query: (params.get("q") ?? "").slice(0, 100),
    sort,
    direction,
  };

  try {
    const result = await getAdminLeaderboardPage(query);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to load leaderboard" },
      { status: 500, headers: NO_STORE }
    );
  }
}

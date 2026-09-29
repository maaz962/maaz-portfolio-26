import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getAdminLogsPage } from "@/lib/tracking-store";
import type { AdminLogQuery, AdminLogSortKey } from "@/types/tracking";

/**
 * GET /api/admin/logs
 *   ?page=1&pageSize=25&q=&device=&sort=time&direction=desc
 *   → AdminLogPage
 *
 * The paginated replacement for the 100 inline logs the Overview response used
 * to carry. Admin-only by path, like the other admin reads, and it returns one
 * page rather than every retained session.
 */
const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

const PAGE_SIZES = [25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

const SORT_KEYS: readonly AdminLogSortKey[] = [
  "time",
  "ip",
  "page",
  "device",
  "browser",
  "os",
];

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

  const rawSort = params.get("sort") as AdminLogSortKey | null;
  const sort: AdminLogSortKey = rawSort && SORT_KEYS.includes(rawSort) ? rawSort : "time";

  const rawDirection = params.get("direction");
  const direction = rawDirection === "asc" ? "asc" : "desc";

  // Device comes from a closed set the database already holds, but it is still
  // a bound value rather than an interpolated one.
  const device = (params.get("device") ?? "").trim().slice(0, 40);

  const query: AdminLogQuery = {
    page: Math.min(page, 10_000),
    pageSize,
    query: (params.get("q") ?? "").slice(0, 100),
    device,
    sort,
    direction,
  };

  try {
    const result = await getAdminLogsPage(query);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to load logs" },
      { status: 500, headers: NO_STORE }
    );
  }
}

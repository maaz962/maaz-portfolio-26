import { NextRequest, NextResponse } from "next/server";
import { getAdminActor } from "@/lib/auth";
import { getAdminLogsPage, pruneOldLogs } from "@/lib/tracking-store";
import { can } from "@/lib/roles";
import { TRACKING_RETENTION_DAYS } from "@/lib/retention";
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
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }
  if (!can(actor.role, "logs:view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
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

/**
 * DELETE /api/admin/logs?days=60
 * Physically removes old sessions from the tracking store (file or Postgres).
 * Owner/admin only: unlike the automatic 60-day cleanup, this is an explicit
 * admin command and therefore goes through the same role permission model.
 */
export async function DELETE(req: NextRequest) {
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }
  if (!can(actor.role, "logs:purge")) {
    return NextResponse.json(
      { error: "Your role cannot delete visitor logs" },
      { status: 403, headers: NO_STORE }
    );
  }

  const rawDays = Number(req.nextUrl.searchParams.get("days"));
  const days =
    Number.isFinite(rawDays) && rawDays > 0
      ? Math.min(Math.floor(rawDays), 3650)
      : TRACKING_RETENTION_DAYS;

  try {
    const result = await pruneOldLogs(days);
    return NextResponse.json(
      {
        ok: true,
        ...result,
        message: `Deleted ${result.deleted} session${result.deleted === 1 ? "" : "s"} older than ${days} days`,
      },
      { headers: NO_STORE }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to delete old logs" },
      { status: 500, headers: NO_STORE }
    );
  }
}

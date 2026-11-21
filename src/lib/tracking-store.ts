import fs from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import type { AdminLogPage, AdminLogQuery, AdminLogSortKey, VisitorLog } from "@/types/tracking";
import { getPgConnectionString, usePostgres } from "./pg-connection";
import { TRACKING_RETENTION_DAYS } from "./retention";

/**
 * Persistent visitor-analytics store (dual-mode like the main DB).
 * - Postgres when a connection string (POSTGRES_URL / DATABASE_URL) is set,
 *   i.e. on Vercel (survives deploys/cold starts).
 * - JSON file otherwise (local development).
 */

const TRACK_FILE_PATH = path.join(process.cwd(), "src", "data", "tracking.json");

/**
 * Hard safety ceiling, NOT the retention policy. A 60-day prune is the real
 * retention window (see `pruneOldLogs`); this only stops a runaway traffic spike
 * from growing the store without bound. It is deliberately far above what a
 * normal 60-day window produces on a portfolio site — an earlier value of 500
 * silently turned "keep 60 days" into "keep the newest 500 sessions" on busy
 * days.
 */
const MAX_LOGS = 20_000;

/**
 * Analytics readers (especially "recent activity") assume one chronological
 * order. The file store appends oldest-first while Postgres `ORDER BY ts DESC`
 * returns newest-first, so normalize at this boundary instead of hoping every
 * caller remembers to sort.
 */
function byTimestampAsc(a: VisitorLog, b: VisitorLog): number {
  const ta = Date.parse(a.timestamp);
  const tb = Date.parse(b.timestamp);
  if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) return ta - tb;
  return a.id.localeCompare(b.id);
}

interface TrackingStore {
  logs: VisitorLog[];
}

let writePromise: Promise<void> = Promise.resolve();
/**
 * Read-modify-write operations on the JSON file are serialized. `writePromise`
 * alone only orders writes; without this lock a prune and a tracker POST could
 * both read the same file and the second save would resurrect deleted rows.
 */
let storeTaskQueue: Promise<unknown> = Promise.resolve();

function withStoreLock<T>(task: () => Promise<T>): Promise<T> {
  const run = storeTaskQueue.then(task);
  storeTaskQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/** Automatic pruning is checked at most once an hour per server instance. */
const PRUNE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
let lastPruneCheck = 0;

// Neon's tagged template returns a wide union type; narrow to Promise<any[]>.
type DbTag = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

const connectionString = getPgConnectionString();
const sql = (
  connectionString ? neon(connectionString) : null
) as unknown as DbTag & { unsafe: (raw: string) => any };
let initPromise: Promise<void> | null = null;

async function initAnalytics(): Promise<void> {
  if (!usePostgres) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_logs (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        utm JSONB,
        ip TEXT,
        user_agent TEXT,
        browser TEXT,
        os TEXT,
        device TEXT,
        language TEXT,
        timezone TEXT,
        screen_resolution TEXT,
        referrer TEXT,
        page TEXT,
        location JSONB,
        cookies JSONB,
        events JSONB,
        ts TEXT NOT NULL
      )
    `;
      // Deployments created before visitor ids/UTM existed need the columns
      // added in place; CREATE TABLE IF NOT EXISTS will not do it on its own.
      await sql`ALTER TABLE analytics_logs ADD COLUMN IF NOT EXISTS visitor_id TEXT`;
      await sql`ALTER TABLE analytics_logs ADD COLUMN IF NOT EXISTS utm JSONB`;
      // Indexes keep the 60-day delete and the logs pager cheap as rows grow.
      await sql`CREATE INDEX IF NOT EXISTS analytics_logs_ts_idx ON analytics_logs (ts DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS analytics_logs_visitor_idx ON analytics_logs (visitor_id)`;
    })();
  return initPromise;
}

// --- FILE backend ---

async function readFile(): Promise<TrackingStore> {
  try {
    const data = await fs.readFile(TRACK_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      const empty: TrackingStore = { logs: [] };
      await saveFile(empty);
      return empty;
    }
    return { logs: [] };
  }
}

async function saveFile(data: TrackingStore): Promise<void> {
  writePromise = writePromise.then(async () => {
    try {
      await fs.mkdir(path.dirname(TRACK_FILE_PATH), { recursive: true });
      await fs.writeFile(TRACK_FILE_PATH, JSON.stringify(data), "utf-8");
    } catch (error) {
      console.error("Error writing tracking file:", error);
    }
  });
  return writePromise;
}

// --- Public API ---

export async function listLogs(): Promise<VisitorLog[]> {
  if (usePostgres) {
    await initAnalytics();
    // Fetch the newest window, then hand callers a consistent oldest-first
    // array (same order as the file backend and the growth/activity helpers).
    const rows = await sql`SELECT * FROM analytics_logs ORDER BY ts DESC LIMIT ${MAX_LOGS}`;
    return rows.map(mapRow).sort(byTimestampAsc);
  }
  const store = await readFile();
  return [...store.logs].sort(byTimestampAsc);
}

/**
 * Deletes sessions older than `days` from the actual store (not just the
 * response). Called by the manual admin button and, on a throttle, by the
 * tracker itself so Vercel/Postgres never carry unbounded history.
 */
export async function pruneOldLogs(
  days: number = TRACKING_RETENTION_DAYS
): Promise<{ deleted: number; cutoff: string }> {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.min(days, 3650) : TRACKING_RETENTION_DAYS;
  const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();
  const cutoffMs = Date.parse(cutoff);

  if (usePostgres) {
    await initAnalytics();
    // `ts` is TEXT. Malformed/legacy values do not compare correctly against
    // an ISO cutoff, so treat anything that is not `YYYY-MM-DDTHH:MM:SS...`
    // as out-of-retention as well (same rule as the file backend below).
    const removed = await sql`
      DELETE FROM analytics_logs
      WHERE ts NOT LIKE '____-__-__T%' OR ts < ${cutoff}
      RETURNING id
    `;
    return { deleted: removed.length, cutoff };
  }

  const deleted = await withStoreLock(async () => {
    const store = await readFile();
    // Compare parsed instants, not ISO strings: a legacy row written with
    // Date#toString() sorts after every ISO string and would never be pruned.
    // Rows whose date cannot be parsed cannot be proven inside the window.
    const kept = store.logs.filter((log) => {
      const ts = Date.parse(log.timestamp);
      return Number.isFinite(ts) && ts >= cutoffMs;
    });
    const count = store.logs.length - kept.length;
    if (count > 0) {
      store.logs = kept;
      await saveFile(store);
    }
    return count;
  });
  return { deleted, cutoff };
}

/** Runs the 60-day cleanup at most once an hour, off the hot tracking path. */
async function autoPruneOldLogs(): Promise<void> {
  const now = Date.now();
  if (now - lastPruneCheck < PRUNE_CHECK_INTERVAL_MS) return;
  lastPruneCheck = now;
  try {
    await pruneOldLogs(TRACKING_RETENTION_DAYS);
  } catch (error) {
    // A cleanup failure must never lose the incoming visitor event.
    console.error("Analytics auto-prune failed:", error);
  }
}

/**
 * Escapes the LIKE metacharacters so a search for "1.2.3.4" or "a_b" matches
 * literally. Without this, `_` and `%` in an IP or a path act as wildcards and
 * the Postgres result set silently disagrees with the file backend.
 */
function likeEscape(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Column list per sort key, whitelisted — this reaches here from a query string. */
const LOG_ORDER_BY: Record<AdminLogSortKey, string> = {
  time: "ts",
  ip: "ip",
  page: "page",
  device: "device",
  browser: "browser",
  os: "os",
};

/**
 * One page of visitor logs, filtered, sorted and sliced.
 *
 * The Overview used to receive the newest 100 rows inline and render them as an
 * expandable list. That is now a preview of the summary only; the full list is
 * this query, paged on the server, so opening the Logs route costs one page
 * rather than every retained session.
 *
 * `ts` is a TEXT column holding ISO-8601 strings, which sort chronologically as
 * text only because every row is written by `Date#toISOString` in the same
 * fixed-width UTC format.
 */
export async function getAdminLogsPage(query: AdminLogQuery): Promise<AdminLogPage> {
  const needle = (query.query ?? "").trim();
  const device = (query.device ?? "").trim();
  const dir = query.direction === "asc" ? "ASC" : "DESC";

  if (usePostgres) {
    await initAnalytics();

    // A stable tail-breaker so equal sort keys never shuffle between pages,
    // which would let a row be skipped or repeated while paging.
    const orderBy = `${LOG_ORDER_BY[query.sort]} ${dir}, ts DESC, id ASC`;

    const search = needle
      ? sql`AND (ip ILIKE ${`%${likeEscape(needle)}%`} ESCAPE '\\' OR page ILIKE ${`%${likeEscape(needle)}%`} ESCAPE '\\')`
      : sql``;
    const deviceFilter = device ? sql`AND device = ${device}` : sql``;

    const facetRows = await sql`
      SELECT device AS name, COUNT(*)::int AS count
      FROM analytics_logs
      GROUP BY device
      ORDER BY count DESC, name ASC
    `;

    const [counts] = await sql`
      SELECT COUNT(*)::int AS total
      FROM analytics_logs
      WHERE TRUE ${search} ${deviceFilter}
    `;

    const total = counts?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(Math.max(1, query.page), pageCount);
    const offset = (page - 1) * query.pageSize;

    const rows = await sql`
      SELECT * FROM analytics_logs
      WHERE TRUE ${search} ${deviceFilter}
      ORDER BY ${sql.unsafe(orderBy)}
      LIMIT ${query.pageSize} OFFSET ${offset}
    `;

    return {
      rows: rows.map(mapRow),
      total,
      page,
      pageSize: query.pageSize,
      pageCount,
      devices: facetRows.map((r: any) => ({ name: r.name ?? "Unknown", count: r.count ?? 0 })),
    };
  }

  // --- FILE backend ---
  const store = await readFile();
  const lowerNeedle = needle.toLowerCase();

  const devices = new Map<string, number>();
  for (const log of store.logs) {
    const name = log.device || "Unknown";
    devices.set(name, (devices.get(name) ?? 0) + 1);
  }

  const matches = store.logs.filter((log) => {
    if (device && log.device !== device) return false;
    if (!lowerNeedle) return true;
    return (
      log.ip.toLowerCase().includes(lowerNeedle) ||
      log.page.toLowerCase().includes(lowerNeedle)
    );
  });

  const dirFactor = dir === "ASC" ? 1 : -1;
  const sorted = [...matches].sort((a, b) => {
    let delta = 0;
    switch (query.sort) {
      case "ip":
        delta = a.ip.localeCompare(b.ip);
        break;
      case "page":
        delta = a.page.localeCompare(b.page);
        break;
      case "device":
        delta = a.device.localeCompare(b.device);
        break;
      case "browser":
        delta = a.browser.localeCompare(b.browser);
        break;
      case "os":
        delta = a.os.localeCompare(b.os);
        break;
      case "time":
      default:
        delta = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
    }
    if (delta !== 0) return delta * dirFactor;
    // Same tail-breaker as the SQL path so both backends page identically.
    if (a.timestamp !== b.timestamp) return a.timestamp < b.timestamp ? 1 : -1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const offset = (page - 1) * query.pageSize;

  return {
    rows: sorted.slice(offset, offset + query.pageSize),
    total,
    page,
    pageSize: query.pageSize,
    pageCount,
    devices: [...devices.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}

export async function appendLog(log: VisitorLog): Promise<void> {
  // Old rows are removed before the new one is written, so a quiet site still
  // sheds its 60-day tail on the next real visit.
  await autoPruneOldLogs();

  if (usePostgres) {
    await initAnalytics();
    await sql`
      INSERT INTO analytics_logs
        (id, visitor_id, utm, ip, user_agent, browser, os, device, language, timezone, screen_resolution, referrer, page, location, cookies, events, ts)
      VALUES
        (${log.id}, ${log.visitorId ?? null}, ${JSON.stringify(log.utm ?? {})},
         ${log.ip}, ${log.userAgent}, ${log.browser}, ${log.os}, ${log.device},
         ${log.language}, ${log.timezone}, ${log.screenResolution}, ${log.referrer}, ${log.page},
         ${JSON.stringify(log.location ?? null)}, ${JSON.stringify(log.cookies ?? {})},
         ${JSON.stringify(log.events ?? [])}, ${log.timestamp})
    `;
    // Keep only the newest MAX_LOGS rows.
    await sql`
      DELETE FROM analytics_logs
      WHERE id NOT IN (
        SELECT id FROM analytics_logs ORDER BY ts DESC LIMIT ${MAX_LOGS}
      )
    `;
    return;
  }

  await withStoreLock(async () => {
    const store = await readFile();
    store.logs.push(log);
    if (store.logs.length > MAX_LOGS) store.logs.splice(0, store.logs.length - MAX_LOGS);
    await saveFile(store);
  });
}

function mapRow(row: any): VisitorLog {
  return {
    id: row.id,
    visitorId: row.visitor_id ?? undefined,
    utm: row.utm ?? undefined,
    ip: row.ip,
    userAgent: row.user_agent,
    browser: row.browser,
    os: row.os,
    device: row.device,
    language: row.language,
    timezone: row.timezone,
    screenResolution: row.screen_resolution,
    referrer: row.referrer,
    page: row.page,
    timestamp: row.ts,
    location: row.location ?? undefined,
    cookies: row.cookies ?? {},
    events: row.events ?? [],
  };
}

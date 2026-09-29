import fs from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import type { AdminLogPage, AdminLogQuery, AdminLogSortKey, VisitorLog } from "@/types/tracking";
import { getPgConnectionString, usePostgres } from "./pg-connection";

/**
 * Persistent visitor-analytics store (dual-mode like the main DB).
 * - Postgres when a connection string (POSTGRES_URL / DATABASE_URL) is set,
 *   i.e. on Vercel (survives deploys/cold starts).
 * - JSON file otherwise (local development).
 */

const TRACK_FILE_PATH = path.join(process.cwd(), "src", "data", "tracking.json");
const MAX_LOGS = 500;

interface TrackingStore {
  logs: VisitorLog[];
}

let writePromise: Promise<void> = Promise.resolve();

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
    const rows = await sql`SELECT * FROM analytics_logs ORDER BY ts DESC LIMIT ${MAX_LOGS}`;
    return rows.map(mapRow);
  }
  const store = await readFile();
  return store.logs;
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
  if (usePostgres) {
    await initAnalytics();
    await sql`
      INSERT INTO analytics_logs
        (id, ip, user_agent, browser, os, device, language, timezone, screen_resolution, referrer, page, location, cookies, events, ts)
      VALUES
        (${log.id}, ${log.ip}, ${log.userAgent}, ${log.browser}, ${log.os}, ${log.device},
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

  const store = await readFile();
  store.logs.push(log);
  if (store.logs.length > MAX_LOGS) store.logs.splice(0, store.logs.length - MAX_LOGS);
  await saveFile(store);
}

function mapRow(row: any): VisitorLog {
  return {
    id: row.id,
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

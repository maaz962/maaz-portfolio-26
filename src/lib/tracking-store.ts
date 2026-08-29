import fs from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import type { VisitorLog } from "@/types/tracking";

/**
 * Persistent visitor-analytics store (dual-mode like the main DB).
 * - Postgres when DATABASE_URL is set (survives deploys/cold starts).
 * - JSON file otherwise (local development).
 */

const usePostgres = Boolean(process.env.DATABASE_URL);

const TRACK_FILE_PATH = path.join(process.cwd(), "src", "data", "tracking.json");
const MAX_LOGS = 500;

interface TrackingStore {
  logs: VisitorLog[];
}

let writePromise: Promise<void> = Promise.resolve();

// Neon's tagged template returns a wide union type; narrow to Promise<any[]>.
type DbTag = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

const sql = (
  process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null
) as unknown as DbTag;
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

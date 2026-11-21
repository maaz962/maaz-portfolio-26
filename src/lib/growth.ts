import type { GrowthPoint } from "@/types/tracking";

/**
 * Growth series for the dashboard charts.
 *
 * Computed from the records the analytics route already reads, so the dashboard
 * costs no extra query. Every bucket is emitted (including zero days/months),
 * because a line that skips empty days turns a quiet week into a flat lie.
 *
 * Timestamps are ISO-8601 UTC strings (`Date#toISOString`), so bucketing by the
 * first 10 / 7 characters is equivalent to grouping by UTC day / month and
 * avoids timezone drift between the server and the browser.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function dayLabel(key: string): string {
  const [, month, day] = key.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1] ?? ""}`.trim();
}

function monthLabel(key: string): string {
  const [yearRaw, monthRaw] = key.split("-");
  const year = yearRaw ?? "";
  const month = monthRaw ?? "";
  const name = MONTHS[Number(month) - 1] ?? key;
  // Include the year only when the window crosses one, so most labels stay
  // short without ever being ambiguous.
  return year === String(new Date().getUTCFullYear()) ? name : `${name} '${year.slice(2)}`;
}

interface HasTimestamp {
  timestamp: string;
}

interface HasCreatedAt {
  createdAt: string;
}

function countBy<T>(rows: T[], keyOf: (row: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function buildGrowthSeries({
  logs,
  users,
  days = 14,
  months = 6,
  now = new Date(),
}: {
  logs: HasTimestamp[];
  users: HasCreatedAt[];
  days?: number;
  months?: number;
  now?: Date;
}): { daily: GrowthPoint[]; monthly: GrowthPoint[] } {
  const visitsByDay = countBy(logs, (log) => log.timestamp.slice(0, 10));
  const signupsByDay = countBy(users, (user) => user.createdAt.slice(0, 10));
  const visitsByMonth = countBy(logs, (log) => log.timestamp.slice(0, 7));
  const signupsByMonth = countBy(users, (user) => user.createdAt.slice(0, 7));

  const daily: GrowthPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(now);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - offset);
    const key = dayKey(date);
    daily.push({
      key,
      label: dayLabel(key),
      visits: visitsByDay.get(key) ?? 0,
      signups: signupsByDay.get(key) ?? 0,
    });
  }

  const monthly: GrowthPoint[] = [];
  for (let offset = months - 1; offset >= 0; offset--) {
    const date = new Date(now);
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCMonth(date.getUTCMonth() - offset);
    const key = monthKey(date);
    monthly.push({
      key,
      label: monthLabel(key),
      visits: visitsByMonth.get(key) ?? 0,
      signups: signupsByMonth.get(key) ?? 0,
    });
  }

  return { daily, monthly };
}

/**
 * Percentage change between the latest two buckets of a series.
 * Returns `null` when there is no previous value to compare against, so the UI
 * can say "new" instead of dividing by zero.
 */
export function latestTrend(
  points: GrowthPoint[],
  metric: "visits" | "signups"
): { current: number; previous: number; pct: number | null } | null {
  if (points.length === 0) return null;
  const current = points[points.length - 1]?.[metric] ?? 0;
  const previous = points[points.length - 2]?.[metric] ?? 0;
  if (previous === 0) return { current, previous, pct: current === 0 ? 0 : null };
  return { current, previous, pct: Math.round(((current - previous) / previous) * 100) };
}

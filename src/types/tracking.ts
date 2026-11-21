/** UTM fields captured from the landing URL on the first tracker flush. */
export type UtmParams = Partial<
  Record<"source" | "medium" | "campaign" | "term" | "content", string>
>;

export interface VisitorLog {
  id: string;
  /** Stable browser-side id, so "new vs returning" does not depend on IP alone. */
  visitorId?: string;
  utm?: UtmParams;
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  language: string;
  timezone: string;
  screenResolution: string;
  referrer: string;
  page: string;
  timestamp: string;
  location?: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lon: number;
    isp: string;
  };
  cookies: Record<string, string>;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  type: "pageview" | "click" | "scroll" | "time" | "input" | "copy" | "resize" | "visibility";
  target: string;
  data?: string;
  timestamp: string;
}

/** Generic label/count pair used by the source and UTM breakdowns. */
export interface NamedCount {
  label: string;
  count: number;
}

export interface VisitorStats {
  /** Unique visitors (a visitor can have several sessions). */
  totalVisitors: number;
  /** Raw tracked sessions — the number the old `totalVisitors` used to mean. */
  totalSessions: number;
  /** Visitors with one session in the retained window. */
  newVisitors: number;
  /** Visitors with more than one session in the retained window. */
  returningVisitors: number;
  /** Unique visitors seen in the last 5 minutes. */
  onlineNow: number;
  /** Percentage of sessions that viewed one page and left without engaging. */
  bounceRate: number;
  bouncedSessions: number;
  uniqueIPs: number;
  totalEvents: number;
  /** Number of accounts (deleted accounts excluded). */
  totalUsers: number;
  /** Referrer/UTM grouped into Google, Facebook, Direct, Other, ... */
  sources: NamedCount[];
  /** UTM source/medium/campaign combinations seen in landing URLs. */
  utmCampaigns: NamedCount[];
  topPages: { page: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  browsers: { name: string; count: number }[];
  devices: { name: string; count: number }[];
  locations: { country: string; city: string; count: number }[];
  recentActivity: TrackingEvent[];
  interests: { label: string; count: number }[];
  /** Visits + signups per UTC day, oldest first. Every bucket is present. */
  dailyGrowth: GrowthPoint[];
  /** Visits + signups per UTC month, oldest first. Every bucket is present. */
  monthlyGrowth: GrowthPoint[];
}

/**
 * One bucket of the growth charts.
 *
 * `key` is the machine grouping key (`YYYY-MM-DD` or `YYYY-MM`) and `label` the
 * short axis label. Both series ship together so a single chart can compare
 * traffic growth with account growth without a second request.
 */
export interface GrowthPoint {
  key: string;
  label: string;
  visits: number;
  signups: number;
}

/** Sort keys accepted by the admin visitor-log list. */
export type AdminLogSortKey = "time" | "ip" | "page" | "device" | "browser" | "os";

/** Server-side query for one page of the admin visitor logs. */
export interface AdminLogQuery {
  /** 1-based page number. */
  page: number;
  pageSize: number;
  /** Free-text match against the IP address or the page path. */
  query?: string;
  /** Exact device-type match, or empty for every device. */
  device?: string;
  sort: AdminLogSortKey;
  direction: "asc" | "desc";
}

/** One page of visitor logs plus the metadata the pager and toolbar need. */
export interface AdminLogPage {
  rows: VisitorLog[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Distinct device types with their row counts, for the filter dropdown. */
  devices: { name: string; count: number }[];
}

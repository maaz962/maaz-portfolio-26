export interface VisitorLog {
  id: string;
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

export interface VisitorStats {
  totalVisitors: number;
  uniqueIPs: number;
  totalEvents: number;
  topPages: { page: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  browsers: { name: string; count: number }[];
  devices: { name: string; count: number }[];
  locations: { country: string; city: string; count: number }[];
  recentActivity: TrackingEvent[];
  interests: { label: string; count: number }[];
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

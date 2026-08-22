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
}

import { LayoutDashboard, BarChart3, Users, Trophy, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Admin navigation. One flat list, no grouping headers: the panel has five
 * sections and a second axis of hierarchy would be noise.
 *
 * Each section owns one job: Overview is the KPI/growth summary, Analytics is
 * the detailed breakdown, Users/Leaderboard/Logs each own their own
 * server-paginated list. Nothing is duplicated across pages.
 */
export const adminNavItems: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
];

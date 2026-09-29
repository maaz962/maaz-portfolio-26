import { LayoutDashboard, Users, Trophy, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Flat admin navigation. Deliberately one list, no grouping headers: the
 * panel has four sections and a second axis of hierarchy would be noise.
 *
 * Ordering matches the audit's proposed restructure -- read-only analytics
 * first, then audience (users + leaderboard), then raw traffic.
 *
 * `/admin/users`, `/admin/leaderboard` and `/admin/logs` are the targets of
 * the later migration steps; until those routes land the links 404.
 */
export const adminNavItems: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
];

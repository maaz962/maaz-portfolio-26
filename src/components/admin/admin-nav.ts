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
 * `/admin/logs` is the target of the next migration step; until it lands that
 * link 404s. The other three routes exist.
 */
export const adminNavItems: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
];

import type { User } from "@/types";
import type { AdminSort } from "@/components/admin/admin-table";

/**
 * A user joined with the XP the leaderboard already reports for them.
 *
 * The two halves come from separate endpoints and are combined on the client,
 * which is why sorting by XP needs no new backend route in this step.
 */
export interface AdminUser extends User {
  /**
   * Every account gets a real total, admin and hidden included, since the
   * server totals them directly. `null` only means the server could not supply
   * one, so the column renders as "—" rather than a misleading 0.
   */
  totalXp: number | null;
}

export type UsersSortKey = "name" | "joined" | "xp";

/**
 * Case-insensitive match across name, username and email.
 *
 * Matching all three in one box is deliberate: an admin looking for a person
 * usually remembers only one of the three.
 */
export function filterUsers(users: AdminUser[], query: string): AdminUser[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return users;

  return users.filter((user) =>
    [user.name, user.username, user.email].some((field) =>
      (field ?? "").toLowerCase().includes(needle)
    )
  );
}

export function sortUsers(users: AdminUser[], sort: AdminSort | null): AdminUser[] {
  if (!sort) return users;

  const direction = sort.direction === "asc" ? 1 : -1;
  const key = sort.key as UsersSortKey;

  return [...users].sort((a, b) => {
    switch (key) {
      case "name":
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) * direction;
      case "joined":
        return a.createdAt.localeCompare(b.createdAt) * direction;
      case "xp":
        // Unknown XP (admins, hidden QA accounts) sorts to the outside of the
        // list rather than pretending to be zero: last when descending, first
        // when ascending.
        if (a.totalXp === null && b.totalXp === null) return 0;
        if (a.totalXp === null) return -direction;
        if (b.totalXp === null) return direction;
        return (a.totalXp - b.totalXp) * direction;
      default:
        return 0;
    }
  });
}

/** The slice of `rows` for a 1-based page, clamped to the list. */
export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return rows.slice((safePage - 1) * pageSize, safePage * pageSize);
}

export function pageCountFor(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

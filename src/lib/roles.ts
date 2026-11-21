import type { User, UserRole } from "@/types";

/**
 * Role model for the admin panel.
 *
 * This replaces the old binary `isAdmin` flag as the authorization source.
 * `isAdmin` is still kept on `User` (the public leaderboard excludes staff by
 * it, and old sessions carry it), but every panel decision goes through the
 * role + permission helpers here so "editor" can never accidentally inherit
 * the owner's delete button.
 *
 * The split is deliberately shallow — five roles, six permissions. A deeper
 * hierarchy would need a UI to explain it, and the panel does not have one.
 */

export const USER_ROLES = ["owner", "admin", "editor", "viewer", "player"] as const;

/** Roles that are allowed into `/admin` at all. */
export const ADMIN_ROLES = ["owner", "admin", "editor", "viewer"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type Permission =
  /** Overview, growth charts, KPIs. */
  | "dashboard:view"
  /** Analytics breakdown (pages, browsers, locations, interests). */
  | "analytics:view"
  /** Visitor logs. */
  | "logs:view"
  /** Delete old visitor logs from the database. */
  | "logs:purge"
  /** Leaderboard. */
  | "leaderboard:view"
  /** User list and user detail, including Trash. */
  | "users:view"
  /** XP adjustments, visibility toggles, soft-delete and restore. */
  | "users:manage"
  /** Grant/revoke roles. */
  | "roles:manage"
  /** Permanently erase an account from Trash. */
  | "users:purge";

const READ_ONLY: Permission[] = [
  "dashboard:view",
  "analytics:view",
  "logs:view",
  "leaderboard:view",
  "users:view",
];

export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  owner: [...READ_ONLY, "users:manage", "roles:manage", "users:purge", "logs:purge"],
  admin: [...READ_ONLY, "users:manage", "users:purge", "logs:purge"],
  editor: READ_ONLY,
  viewer: READ_ONLY,
};

/** Human labels — use these everywhere a role is rendered. */
export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
  player: "Player",
};

/** One-line description used in the role picker and badges' tooltips. */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: "Full access. Can grant roles and permanently erase accounts.",
  admin: "Can manage players, XP and visibility, and empty the trash.",
  editor: "Can read every admin page, but cannot change accounts.",
  viewer: "Read-only access to the admin pages.",
  player: "Normal site account. No admin panel access.",
};

export function isAdminRole(role: UserRole | null | undefined): role is AdminRole {
  return role === "owner" || role === "admin" || role === "editor" || role === "viewer";
}

export function isKnownRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

/**
 * The role a user actually has.
 *
 * Accounts created before roles existed have no `role` field. They are resolved
 * from `isAdmin` instead of being silently treated as players: an existing
 * admin must not lose access to the panel on deploy. Existing admins become
 * owners (there is only the seeded owner in practice).
 */
export function roleOf(user: Pick<User, "role" | "isAdmin">): UserRole {
  if (user.role && isKnownRole(user.role)) return user.role;
  return user.isAdmin ? "owner" : "player";
}

export function can(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role || !isAdminRole(role)) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Tailwind classes for a role pill, shared by tables, headers and the shell. */
export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  owner: "bg-primary/10 text-primary border-primary/20",
  admin: "bg-secondary/10 text-secondary border-secondary/20",
  editor: "bg-accent/10 text-accent border-accent/20",
  viewer: "bg-muted/10 text-muted border-border",
  player: "bg-muted/10 text-muted border-border",
};

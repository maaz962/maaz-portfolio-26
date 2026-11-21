import { cookies } from "next/headers";
import type { User } from "@/types";
import { findUserById } from "@/lib/db";
import { isAdminRole, roleOf, type AdminRole } from "@/lib/roles";
import {
  SESSION_COOKIE,
  verifySessionToken,
  claimsToUser,
} from "@/lib/session";

const DEFAULT_SECRET_MIN_LENGTH = 16;

interface SessionLookupOptions {
  /**
   * Admin authorization must fail closed. A token's `isAdmin`/`role` claims are
   * baked in at login and go stale on demote or soft-delete; if the DB lookup
   * fails we cannot prove the account is still eligible, so we must not let
   * those claims grant panel access. Player sessions keep the friendly fallback
   * so a transient DB error never logs someone out of the public site.
   */
  requireFresh?: boolean;
}

/**
 * Resolves the signed-in user from the signed session cookie.
 *
 * Strategy:
 *  1. Read + verify the cookie signature & expiry. If invalid → no session.
 *  2. Ask the DB for the freshest copy of the user (so role/avatar changes and
 *     Trash state take effect). If that succeeds → return the fresh record.
 *  3. If the DB lookup fails (ephemeral file store after a cold start, a
 *     transient DB error, etc.) → fall back to the verified token claims for
 *     ordinary sessions only. Admin callers pass `requireFresh: true`.
 *
 * Returns null when there is no valid cookie, the account is in Trash, or a
 * fresh record is required but the lookup failed.
 */
async function resolveSessionUser(options: SessionLookupOptions): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = verifySessionToken(token);
  if (!claims) return null;

  try {
    const fresh = await findUserById(claims.sub);
    if (!fresh || fresh.deletedAt) return null;
    return fresh;
  } catch {
    if (options.requireFresh) return null;
    // Transient lookup failure — fall through to token claims for players.
  }

  return claimsToUser(claims);
}

/** Public/player session resolution (tolerant of transient DB failures). */
export async function getSessionUser(): Promise<User | null> {
  return resolveSessionUser({});
}

/**
 * Resolves the signed-in user, their panel role and enforces that the role is
 * one of the admin roles. Returns null when the session is missing, the user
 * is a regular player, or their account is deleted.
 *
 * Fail-closed in production: session tokens are HMAC-signed with
 * SESSION_SECRET. When that env var is missing (or too short) we fall back to
 * the dev default in session-constants.ts — a key that ships in source code,
 * so anyone could forge a token claiming isAdmin=true. On Vercel we never
 * trust that default: admin access is disabled and the operator is told to set
 * a real SESSION_SECRET (this does NOT break regular player sessions).
 */
export async function getAdminActor(): Promise<{ user: User; role: AdminRole } | null> {
  // Fail closed: never authorize the panel from stale token claims. A deleted
  // or demoted admin must lose access even if the user lookup is temporarily
  // unavailable.
  const user = await resolveSessionUser({ requireFresh: true });
  if (!user) return null;

  const role = roleOf(user);
  if (!isAdminRole(role)) return null;

  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < DEFAULT_SECRET_MIN_LENGTH)
  ) {
    console.error(
      "[auth] SESSION_SECRET is not set in production: admin access is disabled. " +
        "Set a strong SESSION_SECRET env var to enable the /admin dashboard."
    );
    return null;
  }

  return { user, role };
}

/**
 * Backwards-compatible helper for routes that only need "is this an admin?".
 * Prefer `getAdminActor()` when the route also needs the role for permission
 * checks.
 */
export async function getAdminUser(): Promise<User | null> {
  const actor = await getAdminActor();
  return actor?.user ?? null;
}

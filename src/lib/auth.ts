import { cookies } from "next/headers";
import type { User } from "@/types";
import { findUserById } from "@/lib/db";
import {
  SESSION_COOKIE,
  verifySessionToken,
  claimsToUser,
} from "@/lib/session";

/**
 * Resolves the signed-in user from the signed session cookie.
 *
 * The cookie carries a self-contained, signed JWT, so we can resolve the user
 * identity without depending on a fragile DB lookup. Strategy:
 *  1. Read + verify the cookie signature & expiry. If invalid → no session.
 *  2. Ask the DB for the freshest copy of the user (so role/avatar changes
 *     take effect). If that succeeds → return the fresh record.
 *  3. If the DB lookup fails (ephemeral file store after a cold start, a
 *     transient DB error, etc.) → fall back to the verified token claims so
 *     the user is NEVER bounced out of an active session. A session is only
 *     cleared by an explicit logout, never by a transient lookup failure.
 *
 * Returns null only when there is genuinely no valid session cookie.
 */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = verifySessionToken(token);
  if (!claims) return null;

  try {
    const fresh = await findUserById(claims.sub);
    if (fresh) return fresh;
  } catch {
    // Transient lookup failure — fall through to token claims.
  }

  return claimsToUser(claims);
}

/**
 * Resolves the signed-in user and enforces admin privileges.
 * Returns null when the session is missing or the user is not an admin.
 */
export async function getAdminUser(): Promise<User | null> {
  const user = await getSessionUser();
  return user?.isAdmin ? user : null;
}

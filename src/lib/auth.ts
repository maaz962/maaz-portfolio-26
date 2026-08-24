import { cookies } from "next/headers";
import type { User } from "@/types";
import { findUserById } from "@/lib/db";

/**
 * Resolves the signed-in user from the session cookie.
 * Returns null when there is no valid session.
 */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  if (!userId) return null;

  try {
    return await findUserById(userId);
  } catch {
    return null;
  }
}

/**
 * Resolves the signed-in user and enforces admin privileges.
 * Returns null when the session is missing or the user is not an admin.
 */
export async function getAdminUser(): Promise<User | null> {
  const user = await getSessionUser();
  return user?.isAdmin ? user : null;
}

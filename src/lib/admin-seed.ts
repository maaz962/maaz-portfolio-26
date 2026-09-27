/**
 * The site owner's admin account, described entirely by environment variables.
 *
 * Why this module exists
 * ----------------------
 * The admin account used to be seeded with a hardcoded username + password
 * committed to this (public) repository, which handed `/admin` to anyone who
 * cloned it. There is deliberately NO default and NO fallback here: if the env
 * vars are missing or malformed the account is simply not seeded, so a fresh
 * deploy has no admin at all until the operator configures one. Failing closed
 * is the whole point - a reachable dashboard with a guessable password is far
 * worse than an unreachable one.
 *
 * The password never crosses the env boundary in plaintext. `ADMIN_PASSWORD_HASH`
 * holds the same `scrypt$<salt>$<hash>` string produced by `src/lib/password.ts`,
 * and the ordinary login path (`validateCredentials` -> `verifyPassword`) does the
 * comparison. Generate a value for it with:
 *
 *     node scripts/admin-credentials.mjs generate
 *
 * This module is Node-only by design; it is imported by the two DB backends and
 * must stay out of `session-constants.ts`, which the Edge middleware pulls in.
 */

/** Stable id for the owner account. Not a secret — it only keys the DB row. */
export const ADMIN_ID = "admin-user-id";

/** Fixed creation date so the owner's join date (and leaderboard tie-breaks) stay stable. */
export const ADMIN_CREATED_AT = "2026-08-01T12:00:00.000Z";

/**
 * The exact shape `hashPassword()` produces: a 16-byte salt and a 64-byte
 * digest, both hex. Validating it here is what guarantees a plaintext password
 * can never be pasted into `ADMIN_PASSWORD_HASH` by mistake and silently create
 * an account nobody can log into.
 */
const SCRYPT_HASH_PATTERN = /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/i;

export interface AdminEnvConfig {
  id: string;
  name: string;
  username: string;
  email: string;
  /** `scrypt$<salt>$<hash>` — verified by verifyPassword() on login. */
  passwordHash: string;
}

export type AdminEnvResult =
  | { ok: true; config: AdminEnvConfig }
  | { ok: false; reason: string };

const SETUP_HINT =
  "Set ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD_HASH in the " +
  "deployment environment, then run `node scripts/admin-credentials.mjs apply` " +
  "to create or rotate the account.";

/**
 * Reads + validates the owner account from the environment.
 *
 * Every field is required: a partially configured admin is treated as no admin
 * at all, because seeding one with a default identity or an empty password
 * would be exactly the hole this module exists to close.
 */
export function getAdminEnv(): AdminEnvResult {
  const name = process.env.ADMIN_NAME?.trim();
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const id = process.env.ADMIN_ID?.trim() || ADMIN_ID;

  const missing: string[] = [];
  if (!name) missing.push("ADMIN_NAME");
  if (!username) missing.push("ADMIN_USERNAME");
  if (!email) missing.push("ADMIN_EMAIL");
  if (!passwordHash) missing.push("ADMIN_PASSWORD_HASH");

  if (missing.length > 0) {
    return {
      ok: false,
      reason:
        `[admin-seed] not seeding an admin account: missing ${missing.join(", ")}. ` +
        SETUP_HINT,
    };
  }

  if (!SCRYPT_HASH_PATTERN.test(passwordHash!)) {
    return {
      ok: false,
      reason:
        "[admin-seed] not seeding an admin account: ADMIN_PASSWORD_HASH is not a " +
        "scrypt$<salt>$<hash> value. Never put a plaintext password there — run " +
        "`node scripts/admin-credentials.mjs generate` to produce a valid hash. " +
        SETUP_HINT,
    };
  }

  return {
    ok: true,
    config: { id, name: name!, username: username!, email: email!, passwordHash: passwordHash! },
  };
}

/** Dicebear avatar derived from the username, matching what registerUser() produces. */
export function adminAvatarUrl(username: string): string {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
}

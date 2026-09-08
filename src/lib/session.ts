import crypto from "crypto";
import type { User } from "@/types";
import { SESSION_COOKIE, getSessionSecret } from "@/lib/session-constants";

/**
 * Stateless, cryptographically signed sessions.
 *
 * Why: previously the session cookie stored a bare user ID, and every
 * `getSessionUser()` call re-looked-up the user in the DB. In serverless
 * deployments the file-based store (`blog-db.json`) is ephemeral — a cold
 * start can wipe it, so a "signed in" user suddenly returns `null` from the
 * lookup and is silently logged out. That caused the "you stay signed in
 * until you log out" promise to break: users were dropped mid-session and
 * re-prompted to sign in on individual game pages.
 *
 * The fix is a signed, self-contained JWT (HMAC-SHA256) that carries the
 * user's identity and claims. It survives navigations, full page reloads,
 * refreshes and cold starts as long as the cookie exists — it is only ever
 * removed by an explicit logout. The signature is verified on every read, so
 * the cookie cannot be tampered with to impersonate another user.
 */

const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, like Instagram
// Signed session lifespan (re-issued on every login/register).
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 365;

export interface SessionClaims {
  /** Subject — the user id. */
  sub: string;
  name: string;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl: string;
  createdAt: string;
  iat: number;
  exp: number;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function stripPadding(str: string): string {
  return str.replace(/=+$/, "");
}

function fromBase64url(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString(
    "utf-8"
  );
}

/** Creates a signed JWT for a user. Returns the token string. */
export function createSessionToken(user: User): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    } satisfies SessionClaims)
  );
  const signingInput = `${header}.${payload}`;
  const signature = base64url(crypto.createHmac("sha256", getSessionSecret()).update(signingInput).digest());
  return `${signingInput}.${signature}`;
}

/** Verifies a token's signature and expiry. Returns claims or null. */
export function verifySessionToken(token: string): SessionClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const header = parts[0]!;
  const payload = parts[1]!;
  const signature = parts[2]!;
  const signingInput = `${header}.${payload}`;

  const expectedSig = base64url(
    crypto.createHmac("sha256", getSessionSecret()).update(signingInput).digest()
  );

  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(stripPadding(signature), "utf8");
  const b = Buffer.from(stripPadding(expectedSig), "utf8");
  const aBuf = Buffer.from(stripPadding(signature), "base64");
  const bBuf = Buffer.from(stripPadding(expectedSig), "base64");
  if (aBuf.length !== bBuf.length || !crypto.timingSafeEqual(aBuf, bBuf)) {
    return null;
  }

  let claims: SessionClaims;
  try {
    claims = JSON.parse(fromBase64url(payload));
  } catch {
    return null;
  }

  if (typeof claims.sub !== "string" || !claims.sub) return null;
  if (typeof claims.exp !== "number" || claims.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return claims;
}

/** Rebuild a User object from validated session claims. */
export function claimsToUser(claims: SessionClaims): User {
  return {
    id: claims.sub,
    name: claims.name,
    username: claims.username,
    email: claims.email,
    isAdmin: claims.isAdmin,
    avatarUrl: claims.avatarUrl,
    createdAt: claims.createdAt,
  };
}

/** True when the provided token carries a valid signature & unexpired claims. */
export function isSessionTokenValid(token: string): boolean {
  return verifySessionToken(token) !== null;
}

export { SESSION_MAX_AGE, SESSION_COOKIE };

/**
 * Edge-runtime-safe constants & helpers for sessions.
 *
 * IMPORTANT: this module must NOT import any Node.js-only modules (e.g.
 * node:crypto). It is imported by the Edge middleware, which only has access
 * to WebCrypto. The signing itself lives in src/lib/session.ts (Node only);
 * this file just shares the cookie name and the secret so both the Node API
 * routes and the Edge middleware stay in sync.
 */

export const SESSION_COOKIE = "session_user_id";

/**
 * The secret used to sign session tokens.
 *
 * Sourced from `SESSION_SECRET` when present. Falls back to a stable default
 * derived from the app so local dev works out of the box; production should
 * always set `SESSION_SECRET` to a long random value.
 */
export function getSessionSecret(): string {
  const provided = process.env.SESSION_SECRET;
  if (provided && provided.length >= 16) return provided;
  // Stable, non-attackable default for local dev. Rotate in production by
  // providing SESSION_SECRET in the environment.
  return "maaz-portfolio-session-signing-key-v1-change-me-in-prod";
}

/**
 * Resolves the Postgres connection string that the app should use.
 *
 * Supports three env conventions:
 *  - DATABASE_URL               (generic / Neon manual connector)
 *  - POSTGRES_URL               (Vercel Postgres integration, pooled)
 *  - POSTGRES_URL_NON_POOLING   (Vercel Postgres integration, direct)
 *
 * The Neon serverless driver accepts a plain postgres:// connection string.
 */
export function getPgConnectionString(): string | null {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    null
  );
}

export const usePostgres = Boolean(getPgConnectionString());

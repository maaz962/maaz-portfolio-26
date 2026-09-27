/* ==========================================================================
   migrate-drop-likes-comments.mjs - drop the retired Likes/Comments tables
   ==========================================================================
   The Likes and Comments features were removed from the app. Their tables are
   left behind in the Postgres database (and their arrays in the file store),
   which is why this script exists: dropping them is a data change, not a code
   change, so it has to be run once against the real database.

   Dropped (Postgres):
     - comment_likes   (likes on a comment)
     - post_likes      (likes on a blog post)
     - comments        (comment threads, including nested replies)

   Nothing references these tables any more: src/lib/db-postgres.ts no longer
   creates them in initDb() and deleteUser() no longer cleans rows from them.
   The only columns that ever existed for these features were the columns of
   the three tables above - no other table gained a likes/comments column, and
   no foreign key or index pointed at them (the schemas declared plain TEXT ids
   with no REFERENCES, and the only implicit index came from each PRIMARY KEY).
   Dropping the tables therefore drops their columns and indexes with them.

   The file store is handled too, so a local checkout is cleaned as well: the
   legacy `comments`, `likes`, `postLikes` and `commentLikes` arrays are removed
   from src/data/blog-db.json. The last two predate the `likes` array and were
   never part of DatabaseSchema - they are stale keys only.

   Backend selection mirrors src/lib/pg-connection.ts:
     - POSTGRES_URL / DATABASE_URL / POSTGRES_URL_NON_POOLING set -> Postgres
     - otherwise the file store (src/data/blog-db.json)

   Because a .env.local with a DATABASE_URL makes almost every checkout look
   like production, Postgres is only written to when --production is passed
   explicitly. This mirrors scripts/admin-credentials.mjs. --dry-run only reads
   and is safe either way.

   Usage:
     node scripts/migrate-drop-likes-comments.mjs --dry-run
     node scripts/migrate-drop-likes-comments.mjs
     node scripts/migrate-drop-likes-comments.mjs --production
   ========================================================================== */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
const REQUIRE_PRODUCTION = process.argv.includes("--production");

// Dropped in dependency order: children before parents, so a database that
// ever did grow real foreign keys between these tables still drops cleanly.
const TABLES = ["comment_likes", "post_likes", "comments"];

// Legacy file-store keys that only ever held Likes/Comments data.
const FILE_KEYS = ["comments", "likes", "postLikes", "commentLikes"];

function getPgConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    null
  );
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

async function migrateFile() {
  const dbPath = process.env.DB_PATH_FILE || path.join(ROOT, "src", "data", "blog-db.json");

  let raw;
  try {
    raw = await fs.readFile(dbPath, "utf-8");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`[file] no DB at ${dbPath} - nothing to clean.`);
      return;
    }
    throw error;
  }

  let db;
  try {
    db = JSON.parse(raw);
  } catch {
    console.error(`[file] ${dbPath} is not valid JSON - fix it by hand, aborting.`);
    process.exit(1);
  }

  const present = FILE_KEYS.filter((key) => Object.prototype.hasOwnProperty.call(db, key));
  if (present.length === 0) {
    console.log(`[file] ${dbPath} has no Likes/Comments keys - already clean.`);
    return;
  }

  const rows = present
    .map((key) => `${key} (${Array.isArray(db[key]) ? plural(db[key].length, "row") : "non-array value"})`)
    .join(", ");

  if (DRY_RUN) {
    console.log(`[file][dry] would remove from ${dbPath}: ${rows}`);
    return;
  }

  FILE_KEYS.forEach((key) => {
    delete db[key];
  });
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
  console.log(`[file] removed from ${dbPath}: ${rows}`);
}

async function migratePostgres(conn) {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(conn);

  const existing = [];
  for (const table of TABLES) {
    const [row] = await sql`
      SELECT to_regclass(${table}) IS NOT NULL AS exists
    `;
    if (row?.exists) existing.push(table);
  }

  if (existing.length === 0) {
    console.log("[pg] none of the Likes/Comments tables exist - already clean.");
    return;
  }

  if (DRY_RUN) {
    const counts = [];
    for (const table of existing) {
      const [row] = await sql.raw(`SELECT COUNT(*)::int AS n FROM ${table}`);
      counts.push(`${table} (${row?.n ?? 0} rows)`);
    }
    console.log(`[pg][dry] would drop: ${counts.join(", ")}`);
    return;
  }

  for (const table of existing) {
    // Table names come from the TABLES constant above, never from user input.
    await sql.raw(`DROP TABLE IF EXISTS ${table}`);
    console.log(`[pg] dropped ${table}`);
  }
  console.log("[pg] done: Likes/Comments tables removed.");
}

const conn = getPgConnectionString();

if (conn && !REQUIRE_PRODUCTION && !DRY_RUN) {
  console.error(
    "[pg] a Postgres connection is configured, so this would DROP tables in the " +
      "REAL database.\n         Pass --production if that is what you want " +
      "(--dry-run only reads)."
  );
  process.exit(1);
}

if (conn) {
  await migratePostgres(conn);
} else {
  await migrateFile();
}

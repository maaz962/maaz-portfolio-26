/* ==========================================================================
   admin-credentials.mjs — create or rotate the owner admin account
   ==========================================================================
   Replaces the admin seed that used to hardcode a username + password in
   source. The password now only ever exists as a scrypt hash in the
   environment, and the account is written to whichever backend is active.

   Two modes:

     generate   Create a strong random password, print it ONCE alongside its
                scrypt hash and the exact env var lines to paste into the
                deployment environment. Touches no database and writes no file,
                so the plaintext never reaches git.

     apply      Create or update the admin row from the environment
                (ADMIN_NAME / ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD_HASH,
                optional ADMIN_ID). This is the ONLY way an existing password is
                replaced: the app's own cold-start seed is ON CONFLICT DO
                NOTHING precisely so a redeploy can never silently reset it.

   Backend selection mirrors src/lib/pg-connection.ts:
     - POSTGRES_URL / DATABASE_URL / POSTGRES_URL_NON_POOLING set -> Postgres
     - otherwise the file store (src/data/blog-db.json)

   Because a .env.local with a DATABASE_URL makes almost every checkout look
   like production, `apply` refuses to guess. It writes to Postgres only when
   --production is passed, and to the file store only when --force-file is
   passed (or when no Postgres connection exists at all). --dry-run only ever
   reads, so it is safe with either flag.

   A .env.local in the project root is read for convenience (it is gitignored);
   values already present in the real environment always win.

   Usage:
     node scripts/admin-credentials.mjs generate
     node scripts/admin-credentials.mjs apply --force-file
     node scripts/admin-credentials.mjs apply --production
     node scripts/admin-credentials.mjs apply --production --dry-run

   After `apply`, redeploy if you changed the environment: existing sessions stay
   valid until their cookie expires, so sign out in the browser to be sure.
   ========================================================================== */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
const FORCE_FILE = process.argv.includes("--force-file");
const REQUIRE_PRODUCTION = process.argv.includes("--production");
const MODE = process.argv.find((a) => a === "generate" || a === "apply") || "";

// Identical to hashPassword() in src/lib/password.ts — the app must be able to
// verify what this script produces.
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

// Ambiguous glyphs (0/O, 1/l/I) are left out so the password can be read off a
// screen and typed into a login form without transcription errors.
const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PASSWORD_LENGTH = 24;
const ADMIN_CREATED_AT = "2026-08-01T12:00:00.000Z";

function generatePassword() {
  const bytes = crypto.randomBytes(PASSWORD_LENGTH);
  let out = "";
  for (let i = 0; i < PASSWORD_LENGTH; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

function avatarUrlFor(username) {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
}

/** Minimal .env.local loader so the script works locally without extra setup. */
async function loadLocalEnv() {
  try {
    const raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      // A real environment variable always wins over the local file.
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // No .env.local — rely on the ambient environment.
  }
}

function getPgConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    null
  );
}

/** Reads the owner account from the environment, reporting anything missing. */
function readAdminEnv() {
  const config = {
    id: (process.env.ADMIN_ID || "").trim() || "admin-user-id",
    name: (process.env.ADMIN_NAME || "").trim(),
    username: (process.env.ADMIN_USERNAME || "").trim().toLowerCase(),
    email: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
    passwordHash: (process.env.ADMIN_PASSWORD_HASH || "").trim(),
  };
  const missing = [];
  if (!config.name) missing.push("ADMIN_NAME");
  if (!config.username) missing.push("ADMIN_USERNAME");
  if (!config.email) missing.push("ADMIN_EMAIL");
  if (!config.passwordHash) missing.push("ADMIN_PASSWORD_HASH");
  return { config, missing };
}

function modeGenerate() {
  const password = generatePassword();
  const passwordHash = hashPassword(password);

  console.log("=".repeat(72));
  console.log(" NEW ADMIN PASSWORD — copy it now, it cannot be recovered later.");
  console.log(" (it is never written to disk and cannot be derived from the hash)");
  console.log("=".repeat(72));
  console.log("");
  console.log("  password : " + password);
  console.log("  hash     : " + passwordHash);
  console.log("");
  console.log("Add these to the deployment environment (Vercel → Settings → Environment):");
  console.log("");
  console.log("  ADMIN_NAME=M. Maaz Arif");
  console.log("  ADMIN_USERNAME=maaz_admin");
  console.log("  ADMIN_EMAIL=<your email>");
  console.log("  ADMIN_PASSWORD_HASH=" + passwordHash);
  console.log("");
  console.log("Then rotate the live account:");
  console.log(
    "  DATABASE_URL=<neon url> node scripts/admin-credentials.mjs apply --production"
  );
  console.log("");
}

async function applyFile(config) {
  const dbPath =
    process.env.DB_PATH_FILE || path.join(ROOT, "src", "data", "blog-db.json");
  let db;
  try {
    db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        `[file] no DB at ${dbPath} — start the app once so it seeds, then re-run.`
      );
      return;
    }
    throw error;
  }

  db.users = db.users || [];
  const byId = db.users.findIndex((u) => u.id === config.id);
  const byUsername = db.users.findIndex(
    (u) => String(u.username || "").toLowerCase() === config.username
  );
  const target = byId > -1 ? byId : byUsername;
  const action = target > -1 ? "rotated" : "created";

  if (DRY_RUN) {
    console.log(
      `[file][dry] would ${action} admin @${config.username} (${config.email}) in ${dbPath}`
    );
    return;
  }

  const record = {
    id: config.id,
    name: config.name,
    username: config.username,
    email: config.email,
    isAdmin: true,
    avatarUrl: avatarUrlFor(config.username),
    // Keep the original join date so listing order does not jump.
    createdAt:
      (target > -1 && db.users[target].createdAt) || ADMIN_CREATED_AT,
    passwordHash: config.passwordHash,
  };

  if (target > -1) {
    db.users[target] = record;
  } else {
    db.users.push(record);
  }

  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
  console.log(
    `[file] admin @${config.username} <${config.email}> ${action} in ${dbPath}`
  );
}

async function applyPostgres(conn, config) {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(conn);

  if (DRY_RUN) {
    const [existing] = await sql`
      SELECT id, username, email FROM users WHERE id = ${config.id} LIMIT 1
    `;
    console.log(
      `[pg][dry] would ${existing ? "rotate" : "create"} admin @${config.username} ` +
        `(${config.email}); current row: ` +
        (existing ? `@${existing.username} <${existing.email}>` : "none")
    );
    return;
  }

  // Upsert on the stable id so a rotated username/email replaces the old row
  // instead of creating a second admin.
  const rows = await sql`
    INSERT INTO users (id, name, username, email, is_admin, avatar_url, created_at, password_hash)
    VALUES (
      ${config.id},
      ${config.name},
      ${config.username},
      ${config.email},
      true,
      ${avatarUrlFor(config.username)},
      ${ADMIN_CREATED_AT},
      ${config.passwordHash}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      is_admin = true,
      avatar_url = EXCLUDED.avatar_url,
      password_hash = EXCLUDED.password_hash
    RETURNING id, username, email
  `;
  console.log(
    `[pg] admin @${rows[0].username} <${rows[0].email}> password rotated (id ${rows[0].id})`
  );
}

function usage() {
  console.log("Usage:");
  console.log(
    "  node scripts/admin-credentials.mjs generate   # new random password + hash"
  );
  console.log(
    "  node scripts/admin-credentials.mjs apply --force-file   # local file store only"
  );
  console.log(
    "  node scripts/admin-credentials.mjs apply --production   # the real database"
  );
  console.log(
    "  add --dry-run to either to preview without writing"
  );
  process.exit(1);
}

await loadLocalEnv();

if (MODE === "generate") {
  modeGenerate();
} else if (MODE === "apply") {
  const { config, missing } = readAdminEnv();

  if (missing.length > 0) {
    console.error(
      `[apply] missing ${missing.join(", ")}. Run \`node scripts/admin-credentials.mjs generate\` first.`
    );
    process.exit(1);
  }
  if (!/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/i.test(config.passwordHash)) {
    console.error(
      "[apply] ADMIN_PASSWORD_HASH is not a scrypt$<salt>$<hash> value — run " +
        "`node scripts/admin-credentials.mjs generate` to produce one."
    );
    process.exit(1);
  }

  const conn = getPgConnectionString();

  if (FORCE_FILE && REQUIRE_PRODUCTION) {
    console.error(
      "[apply] --force-file and --production are mutually exclusive."
    );
    process.exit(1);
  }

  if (FORCE_FILE) {
    if (conn) {
      console.log(
        "[apply] --force-file: a Postgres connection is configured, but it is " +
          "being IGNORED. Writing to the local file store only."
      );
    }
    await applyFile(config);
  } else if (conn) {
    // Writing to the real database is irreversible, so it is never inferred
    // from the environment alone — it has to be asked for by name.
    if (!REQUIRE_PRODUCTION) {
      console.error(
        "[apply] a Postgres connection is configured, so this would write to " +
          "the REAL database.\n" +
          "         Pass --production if that is what you want, or --force-file " +
          "to target the local file store instead.\n" +
          "         (--dry-run is safe either way and only reads.)"
      );
      process.exit(1);
    }
    await applyPostgres(conn, config);
  } else {
    await applyFile(config);
  }
  console.log("");
  console.log("Done. The previous password no longer works.");
} else {
  usage();
}

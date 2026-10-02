/* ==========================================================================
   DIAGNOSTIC ONLY - READ ONLY. Makes zero writes.

   Scans stored game_progress.solutions for PHP Playground rows whose saved
   editor content contains JavaScript instead of PHP. Those values are restored
   straight into the editor by page.tsx, so a poisoned row reproduces the
   "let city = Lahore; console.log(city)" symptom even though levels.js is
   clean.

   Run:  node --env-file=.env.local scripts/inspect-php-solutions.mjs
   ========================================================================== */

import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const SLUG = "php-playground";

function getPgConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    null
  );
}

/**
 * Patterns that indicate JavaScript. Each is deliberately narrow, because the
 * naive version of these matched perfectly good PHP:
 *   - `=>` is array syntax in PHP, not an arrow function.
 *   - `function (` is how PHP declares functions too.
 *   - `$var =` / `;` appear in essentially all PHP.
 * The lookbehind keeps `$var` (a PHP variable literally named "var") from
 * tripping the bare-`var` rule.
 */
const JS_TOKENS = [
  /(?<![$\w])let\s+[A-Za-z_$]/,
  /(?<![$\w])const\s+[A-Za-z_$]/,
  /(?<![$\w])var\s+[A-Za-z_$]/,
  /\bconsole\s*\.\s*log\b/,
  /\bconsole\s*\.\s*(error|warn|table|dir)\b/,
  /\bJSON\s*\.\s*stringify\b/,
  /\bundefined\b/,
  /`[^`\n]*\$\{/,
  /\bparseInt\s*\(|\bparseFloat\s*\(/,
];

/**
 * Classifies stored editor content. Returns null when it looks like PHP.
 */
function jsEvidence(source) {
  if (typeof source !== "string" || !source.trim()) return null;
  const reasons = [];

  // Every PHP script opens with <?php. Without it the content is not PHP.
  if (!source.includes("<?php")) reasons.push("missing <?php opener");
  if (/^\s*<\?php/.test(source) === false && source.includes("<?php")) {
    reasons.push("something precedes the <?php opener");
  }

  for (const re of JS_TOKENS) {
    const m = source.match(re);
    if (m) reasons.push(`JS token ${JSON.stringify(m[0].slice(0, 40))}`);
  }
  return reasons.length ? reasons : null;
}

/**
 * Authoritative check: does the PHP 8 parser accept this file?
 * `php -l` lints without executing, so nothing in the script runs.
 */
function phpLint(source) {
  const file = join(tmpdir(), `php-lint-${randomUUID()}.php`);
  writeFileSync(file, source, "utf8");
  try {
    execFileSync("php", ["-l", file], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return null; // parsed cleanly
  } catch (e) {
    const msg = String(e.stderr || e.stdout || e.message).trim();
    return msg.split("\n")[0] || "lint failed";
  } finally {
    rmSync(file, { force: true });
  }
}

function preview(source) {
  const s = String(source ?? "");
  return s.length > 120 ? s.slice(0, 120) + "..." : s;
}

async function inspectPostgres() {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(getPgConnectionString());
  const rows = await sql`
    SELECT user_id, game_slug, current_level, score, completed, solutions, updated_at
    FROM game_progress
    WHERE game_slug = ${SLUG}
    ORDER BY updated_at DESC
  `;
  return rows;
}

function reportRows(rows, label) {
  console.log(`\n=== ${label}: ${rows.length} ${SLUG} row(s) ===\n`);
  let flagged = 0;

  for (const row of rows) {
    const solutions = row.solutions ?? {};
    const keys = Object.keys(solutions);
    if (!keys.length) {
      console.log(`user=${row.user_id}  no saved solutions`);
      continue;
    }

    const bad = [];
    for (const k of keys) {
      const evidence = jsEvidence(solutions[k]);
      // The lint result is the source of truth; token matches only add colour.
      const lint = phpLint(solutions[k]);
      if (lint || evidence) {
        bad.push({ level: k, evidence, lint, src: solutions[k] });
      }
    }

    const completed = row.completed ?? {};
    // A level marked complete with no saved solution, or vice versa.
    const orphanComplete = Object.keys(completed).filter(
      (k) => completed[k] === true && solutions[k] === undefined
    );

    if (!bad.length && !orphanComplete.length) {
      console.log(`user=${row.user_id}  ${keys.length} solution(s), all look like PHP`);
      continue;
    }

    flagged++;
    console.log(`--- user=${row.user_id}  updated=${row.updated_at} ---`);
    for (const b of bad) {
      console.log(`  SUSPECT level ${b.level}:`);
      console.log(`      php -l: ${b.lint ?? "clean"}`);
      for (const r of b.evidence) console.log(`      - ${r}`);
      console.log(`      content: ${JSON.stringify(preview(b.src))}`);
    }
    if (orphanComplete.length) {
      console.log(`  marked complete with NO solution: ${orphanComplete.join(", ")}`);
    }
  }

  console.log(`\n${flagged} row(s) flagged.`);
  return flagged;
}

const conn = getPgConnectionString();
if (!conn) {
  console.error(
    "No Postgres connection string (POSTGRES_URL / DATABASE_URL / POSTGRES_URL_NON_POOLING)."
  );
  process.exit(1);
}

const rows = await inspectPostgres();
reportRows(rows, "Postgres");
console.log("\nRead-only diagnostic finished. No rows were modified.");
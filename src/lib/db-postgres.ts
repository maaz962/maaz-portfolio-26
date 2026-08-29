import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import type { User, Comment, GameProgress } from "@/types";
import { hashPassword, verifyPassword } from "./password";

/**
 * Postgres-backed persistent data layer. Used when process.env.DATABASE_URL is
 * set (i.e. on Vercel). Unlike the file-based store, this survives deploys and
 * cold starts — game progress, likes, comments and users are never reset.
 */

// Neon's tagged template returns a wide union type that is awkward to map over;
// we narrow it to Promise<any[]> since the driver always returns arrays of rows.
type DbTag = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

const sql = (
  process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null
) as unknown as DbTag;

let initPromise: Promise<void> | null = null;

async function initDb(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        avatar_url TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        password_hash TEXT NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS game_progress (
        user_id TEXT NOT NULL,
        game_slug TEXT NOT NULL,
        current_level INT NOT NULL DEFAULT 0,
        score INT NOT NULL DEFAULT 0,
        completed JSONB NOT NULL DEFAULT '{}',
        total_levels INT NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, game_slug)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS post_likes (
        id TEXT PRIMARY KEY,
        blog_slug TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id TEXT PRIMARY KEY,
        comment_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        blog_slug TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_avatar TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        parent_id TEXT,
        is_deleted BOOLEAN NOT NULL DEFAULT false,
        created_at TEXT NOT NULL,
        updated_at TEXT
      )
    `;
  })();
  return initPromise;
}

function nowISO(): string {
  return new Date().toISOString();
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    isAdmin: row.is_admin,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

function rowToComment(row: any, likesCount = 0, userLiked = false): Comment {
  return {
    id: row.id,
    blogSlug: row.blog_slug,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar,
    content: row.content,
    parentId: row.parent_id ?? undefined,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    likesCount,
    userLiked,
  };
}

function rowToGameProgress(row: any): GameProgress {
  return {
    userId: row.user_id,
    gameSlug: row.game_slug,
    currentLevel: row.current_level,
    score: row.score,
    completed: row.completed ?? {},
    totalLevels: row.total_levels,
    updatedAt: row.updated_at,
  };
}

// --- USERS ---

export async function findUserById(id: string): Promise<User | null> {
  await initDb();
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  return rowToUser(rows[0]);
}

export async function listUsers(): Promise<User[]> {
  await initDb();
  const rows = await sql`SELECT * FROM users ORDER BY created_at DESC`;
  return rows.map(rowToUser);
}

export async function registerUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<User> {
  await initDb();
  const id = `user-${crypto.randomUUID()}`;
  const formattedEmail = email.toLowerCase().trim();
  const formattedUsername = username.toLowerCase().trim();
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedUsername)}`;

  try {
    const rows = await sql`
      INSERT INTO users (id, name, username, email, is_admin, avatar_url, created_at, password_hash)
      VALUES (${id}, ${name.trim()}, ${formattedUsername}, ${formattedEmail}, false, ${avatarUrl}, ${nowISO()}, ${hashPassword(password)})
      RETURNING *
    `;
    return rowToUser(rows[0]);
  } catch (err: any) {
    // Unique constraint violations map to the same friendly messages as the file store.
    if (err?.code === "23505") {
      const detail: string = err.detail || "";
      if (detail.includes("email")) throw new Error("Email already registered");
      if (detail.includes("username")) throw new Error("Username already taken");
    }
    throw err;
  }
}

export async function validateCredentials(
  emailOrUsername: string,
  password: string
): Promise<User | null> {
  await initDb();
  const lowerInput = emailOrUsername.toLowerCase().trim();
  const rows = await sql`
    SELECT * FROM users
    WHERE email = ${lowerInput} OR username = ${lowerInput}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const row = rows[0];
  if (!verifyPassword(password, row.password_hash)) return null;
  return rowToUser(row);
}

// --- GAME PROGRESS ---

export async function getGameProgressForUser(userId: string): Promise<Record<string, GameProgress>> {
  await initDb();
  const rows = await sql`SELECT * FROM game_progress WHERE user_id = ${userId}`;
  const bySlug: Record<string, GameProgress> = {};
  rows.forEach((r) => {
    bySlug[r.game_slug] = rowToGameProgress(r);
  });
  return bySlug;
}

export async function getGameProgress(
  userId: string,
  gameSlug: string
): Promise<GameProgress | null> {
  await initDb();
  const rows = await sql`
    SELECT * FROM game_progress WHERE user_id = ${userId} AND game_slug = ${gameSlug} LIMIT 1
  `;
  return rows[0] ? rowToGameProgress(rows[0]) : null;
}

export async function saveGameProgress(
  userId: string,
  gameSlug: string,
  data: {
    currentLevel: number;
    score: number;
    completed: Record<string, boolean>;
    totalLevels: number;
  }
): Promise<GameProgress> {
  await initDb();

  const cleanCompleted: Record<string, boolean> = {};
  if (data.completed && typeof data.completed === "object") {
    Object.keys(data.completed).forEach((k) => {
      const idx = Number(k);
      if (Number.isInteger(idx) && idx >= 0 && data.completed[k]) {
        cleanCompleted[String(idx)] = true;
      }
    });
  }

  const currentLevel = Math.max(
    0,
    Number.isInteger(data.currentLevel) && data.currentLevel >= 0 ? data.currentLevel : 0
  );
  const score = Math.max(
    0,
    typeof data.score === "number" && Number.isFinite(data.score) ? data.score : 0
  );
  const totalLevels = Math.max(
    1,
    Number.isInteger(data.totalLevels) && data.totalLevels > 0 ? data.totalLevels : 1
  );
  const updatedAt = nowISO();

  const rows = await sql`
    INSERT INTO game_progress (user_id, game_slug, current_level, score, completed, total_levels, updated_at)
    VALUES (${userId}, ${gameSlug}, ${currentLevel}, ${score}, ${JSON.stringify(cleanCompleted)}, ${totalLevels}, ${updatedAt})
    ON CONFLICT (user_id, game_slug)
    DO UPDATE SET
      current_level = EXCLUDED.current_level,
      score = EXCLUDED.score,
      completed = EXCLUDED.completed,
      total_levels = EXCLUDED.total_levels,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `;

  return rowToGameProgress(rows[0]);
}

// --- LIKES & COMMENTS ---

export async function getBlogEngagement(blogSlug: string, userId?: string) {
  await initDb();

  const likeRows = await sql`
    SELECT l.*, u.name, u.username, u.avatar_url
    FROM post_likes l
    LEFT JOIN users u ON u.id = l.user_id
    WHERE l.blog_slug = ${blogSlug}
  `;

  const likesCount = likeRows.length;

  const commentsRow = await sql`
    SELECT COUNT(*)::int AS count FROM comments
    WHERE blog_slug = ${blogSlug} AND is_deleted = false
  `;
  const commentsCount = commentsRow[0]?.count ?? 0;

  let userLiked = false;
  if (userId) {
    const mine = await sql`
      SELECT 1 FROM post_likes WHERE blog_slug = ${blogSlug} AND user_id = ${userId} LIMIT 1
    `;
    userLiked = mine.length > 0;
  }

  const recentLikers = likeRows
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5)
    .map((r) => ({
      id: r.user_id,
      name: r.name || "User",
      username: r.username || "user",
      avatarUrl: r.avatar_url || "",
    }));

  return { likesCount, commentsCount, userLiked, recentLikers };
}

async function commentLikeStats(commentId: string, userId?: string) {
  const countRow = await sql`
    SELECT COUNT(*)::int AS count FROM comment_likes WHERE comment_id = ${commentId}
  `;
  const likesCount = countRow[0]?.count ?? 0;
  let userLiked = false;
  if (userId) {
    const mine = await sql`
      SELECT 1 FROM comment_likes WHERE comment_id = ${commentId} AND user_id = ${userId} LIMIT 1
    `;
    userLiked = mine.length > 0;
  }
  return { likesCount, userLiked };
}

export async function getComments(blogSlug: string, userId?: string): Promise<Comment[]> {
  await initDb();
  const rows = await sql`
    SELECT * FROM comments
    WHERE blog_slug = ${blogSlug} AND is_deleted = false
    ORDER BY created_at ASC
  `;
  const result: Comment[] = [];
  for (const row of rows) {
    const stats = await commentLikeStats(row.id, userId);
    result.push(rowToComment(row, stats.likesCount, stats.userLiked));
  }
  return result;
}

export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<{ likesCount: number; userLiked: boolean }> {
  await initDb();

  const existing = await sql`
    SELECT 1 FROM comment_likes WHERE comment_id = ${commentId} AND user_id = ${userId} LIMIT 1
  `;

  if (existing.length > 0) {
    await sql`
      DELETE FROM comment_likes WHERE comment_id = ${commentId} AND user_id = ${userId}
    `;
  } else {
    await sql`
      INSERT INTO comment_likes (id, comment_id, user_id, created_at)
      VALUES (${crypto.randomUUID()}, ${commentId}, ${userId}, ${nowISO()})
    `;
  }

  return commentLikeStats(commentId, userId);
}

export async function toggleLike(blogSlug: string, userId: string): Promise<boolean> {
  await initDb();

  const existing = await sql`
    SELECT 1 FROM post_likes WHERE blog_slug = ${blogSlug} AND user_id = ${userId} LIMIT 1
  `;

  let liked = false;
  if (existing.length > 0) {
    await sql`DELETE FROM post_likes WHERE blog_slug = ${blogSlug} AND user_id = ${userId}`;
  } else {
    await sql`
      INSERT INTO post_likes (id, blog_slug, user_id, created_at)
      VALUES (${crypto.randomUUID()}, ${blogSlug}, ${userId}, ${nowISO()})
    `;
    liked = true;
  }

  return liked;
}

export async function addComment(
  blogSlug: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  await initDb();

  const userRow = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
  if (!userRow[0]) throw new Error("User not found");

  const trimmedContent = content.trim();
  if (trimmedContent === "") throw new Error("Comment cannot be empty");

  const id = `comment-${crypto.randomUUID()}`;
  const rows = await sql`
    INSERT INTO comments (id, blog_slug, user_id, user_name, user_avatar, content, parent_id, is_deleted, created_at)
    VALUES (${id}, ${blogSlug}, ${userId}, ${userRow[0].name}, ${userRow[0].avatar_url}, ${trimmedContent}, ${parentId || null}, false, ${nowISO()})
    RETURNING *
  `;

  return rowToComment(rows[0], 0, false);
}

export async function editComment(
  commentId: string,
  userId: string,
  content: string
): Promise<Comment> {
  await initDb();

  const trimmedContent = content.trim();
  if (trimmedContent === "") throw new Error("Comment cannot be empty");

  const rows = await sql`
    UPDATE comments
    SET content = ${trimmedContent}, updated_at = ${nowISO()}
    WHERE id = ${commentId} AND user_id = ${userId}
    RETURNING *
  `;

  if (!rows[0]) throw new Error("Unauthorized editing or comment not found");
  return rowToComment(rows[0], 0, false);
}

export async function deleteComment(
  commentId: string,
  userId: string,
  isAdmin: boolean
): Promise<Comment> {
  await initDb();

  const rows = await sql`
    UPDATE comments
    SET is_deleted = true, content = '[Comment deleted by user]', updated_at = ${nowISO()}
    WHERE id = ${commentId} AND (user_id = ${userId} OR ${isAdmin})
    RETURNING *
  `;

  if (!rows[0]) throw new Error("Unauthorized deletion or comment not found");
  return rowToComment(rows[0], 0, false);
}

// Re-export hashes for any external consumers (kept for API parity).
export { hashPassword, verifyPassword };

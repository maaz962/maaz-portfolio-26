import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type {
  User,
  Comment,
  Like,
  BlogCategory,
  BlogPost,
  BlogSettings,
  GameProgress,
} from "@/types";
import { hashPassword, verifyPassword } from "./password";

// DB Types
interface DatabaseSchema {
  users: UserWithPassword[];
  comments: Comment[];
  likes: Like[];
  blogSettings?: BlogSettings;
  gameProgress: GameProgress[];
}

const DEFAULT_BLOG_SETTINGS: BlogSettings = {
  disabledSources: [],
  featuredSlugs: [],
  hiddenSlugs: [],
};

interface UserWithPassword extends User {
  passwordHash: string;
}

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "blog-db.json");

const MAX_COMMENT_LENGTH = 2000;

// Thread-safe-ish sequential lock queue to prevent race conditions on write
let writePromise: Promise<void> = Promise.resolve();

async function readDbFile(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(DB_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    // If file doesn't exist, create it with seed data
    if (error.code === "ENOENT") {
      const seeded = getSeedData();
      await saveDbFile(seeded);
      return seeded;
    }
    console.error("Error reading database file:", error);
    return {
      users: [],
      comments: [],
      likes: [],
      blogSettings: DEFAULT_BLOG_SETTINGS,
      gameProgress: [],
    };
  }
}

async function saveDbFile(data: DatabaseSchema): Promise<void> {
  // Chain the write promise to run sequentially
  writePromise = writePromise.then(async () => {
    try {
      // Ensure the parent directory exists
      await fs.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing database file:", error);
    }
  });
  return writePromise;
}

// Full read-modify-write operations are serialized through this queue so that
// concurrent requests (e.g. a like POST racing a register) never clobber each
// other's changes — each task re-reads the freshest file while holding the lock.
let dbTaskQueue: Promise<unknown> = Promise.resolve();

async function withDbLock<T>(task: () => Promise<T>): Promise<T> {
  const run = dbTaskQueue.then(task);
  dbTaskQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function getSeedData(): DatabaseSchema {
  const adminId = "admin-user-id";
  const user1Id = "user-jane-id";
  const user2Id = "user-ninja-id";

  const users: UserWithPassword[] = [
    {
      id: adminId,
      name: "M. Maaz Arif",
      username: "maaz_admin",
      email: "muhammadmaaz4405@gmail.com",
      isAdmin: true,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=maaz_admin",
      createdAt: new Date("2026-08-01T12:00:00Z").toISOString(),
      passwordHash: hashPassword("maaz-analytics-2026"),
    },
    {
      id: user1Id,
      name: "Jane Doe",
      username: "jane_dev",
      email: "jane@example.com",
      isAdmin: false,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=jane_dev",
      createdAt: new Date("2026-08-05T08:30:00Z").toISOString(),
      passwordHash: hashPassword("password123"),
    },
    {
      id: user2Id,
      name: "Security Ninja",
      username: "security_ninja",
      email: "ninja@example.com",
      isAdmin: false,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=security_ninja",
      createdAt: new Date("2026-08-10T14:45:00Z").toISOString(),
      passwordHash: hashPassword("password123"),
    },
  ];

  const comments: Comment[] = [
    {
      id: "comment-1",
      blogSlug: "building-high-performance-canvas-animations-flutter",
      userId: user1Id,
      userName: "Jane Doe",
      userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=jane_dev",
      content: "This CustomPainter explanation is fantastic! I was having issues with drops in frame rate on canvas rebuilds. Storing path references did the trick.",
      isDeleted: false,
      createdAt: new Date("2026-08-19T09:15:00Z").toISOString(),
    },
    {
      id: "comment-2",
      blogSlug: "building-high-performance-canvas-animations-flutter",
      userId: adminId,
      userName: "M. Maaz Arif",
      userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=maaz_admin",
      content: "Agree. RepaintBoundary is another life-saver for heavy canvas widgets. It isolates repaints so you don't rebuild the entire page context.",
      parentId: "comment-1",
      isDeleted: false,
      createdAt: new Date("2026-08-19T10:30:00Z").toISOString(),
    },
    {
      id: "comment-3",
      blogSlug: "securing-nextjs-api-routes-against-owasp-top-10",
      userId: user2Id,
      userName: "Security Ninja",
      userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=security_ninja",
      content: "Great overview! Do you have any code snippets for rate limiting using Upstash Redis on App Router edge runtime?",
      isDeleted: false,
      createdAt: new Date("2026-08-21T15:20:00Z").toISOString(),
    },
    {
      id: "comment-4",
      blogSlug: "securing-nextjs-api-routes-against-owasp-top-10",
      userId: adminId,
      userName: "M. Maaz Arif",
      userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=maaz_admin",
      content: "Yes! I will publish a dedicated post with full code examples of the middleware rate-limiting flow soon.",
      parentId: "comment-3",
      isDeleted: false,
      createdAt: new Date("2026-08-21T18:40:00Z").toISOString(),
    },
  ];

  const likes: Like[] = [
    {
      id: "like-1",
      blogSlug: "building-high-performance-canvas-animations-flutter",
      userId: user1Id,
      createdAt: new Date("2026-08-19T09:16:00Z").toISOString(),
    },
    {
      id: "like-2",
      blogSlug: "securing-nextjs-api-routes-against-owasp-top-10",
      userId: user2Id,
      createdAt: new Date("2026-08-21T15:21:00Z").toISOString(),
    },
  ];

  return { users, comments, likes, blogSettings: DEFAULT_BLOG_SETTINGS, gameProgress: [] };
}

// --- DATABASE FUNCTIONS ---

export async function findUserById(id: string): Promise<User | null> {
  const db = await readDbFile();
  const found = db.users.find((u) => u.id === id);
  if (!found) return null;
  const { passwordHash, ...user } = found;
  return user;
}

/** All registered users (never exposes password hashes), newest first. */
export async function listUsers(): Promise<User[]> {
  const db = await readDbFile();
  return db.users
    .map(({ passwordHash, ...user }) => user)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function registerUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<User> {
  return withDbLock(async () => {
    const db = await readDbFile();

    const formattedEmail = email.toLowerCase().trim();
    const formattedUsername = username.toLowerCase().trim();

    // Validate unique user
    const emailExists = db.users.some((u) => u.email.toLowerCase() === formattedEmail);
    const usernameExists = db.users.some((u) => u.username.toLowerCase() === formattedUsername);

    if (emailExists) throw new Error("Email already registered");
    if (usernameExists) throw new Error("Username already taken");

    const id = `user-${crypto.randomUUID()}`;
    // Privileges are only granted via the seeded admin account — never
    // automatically based on email/username, which would be an escalation hole.
    const isAdmin = false;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedUsername)}`;

    const newUser: UserWithPassword = {
      id,
      name: name.trim(),
      username: formattedUsername,
      email: formattedEmail,
      isAdmin,
      avatarUrl,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
    };

    db.users.push(newUser);
    await saveDbFile(db);

    const { passwordHash, ...user } = newUser;
    return user;
  });
}

export async function validateCredentials(
  emailOrUsername: string,
  password: string
): Promise<User | null> {
  return withDbLock(async () => {
    const db = await readDbFile();
    const lowerInput = emailOrUsername.toLowerCase().trim();
    const found = db.users.find(
      (u) => u.email.toLowerCase() === lowerInput || u.username.toLowerCase() === lowerInput
    );

    if (!found) return null;

    if (!verifyPassword(password, found.passwordHash)) return null;

    // Transparently upgrade legacy unsalted hashes to salted scrypt on login
    if (!found.passwordHash.startsWith("scrypt$")) {
      found.passwordHash = hashPassword(password);
      await saveDbFile(db);
    }

    const { passwordHash, ...user } = found;
    return user;
  });
}

// --- GAME PROGRESS ---

const GAME_SLUGS = ["html-hero", "grid-garden", "flexbox-zoo"] as const;

/** All game progress rows for one user, keyed by game slug. */
export async function getGameProgressForUser(userId: string): Promise<Record<string, GameProgress>> {
  const db = await readDbFile();
  const rows = (db.gameProgress ?? []).filter((p) => p.userId === userId);
  const bySlug: Record<string, GameProgress> = {};
  rows.forEach((p) => {
    bySlug[p.gameSlug] = p;
  });
  return bySlug;
}

/** A single game's progress for one user (null when never started). */
export async function getGameProgress(
  userId: string,
  gameSlug: string
): Promise<GameProgress | null> {
  const all = await getGameProgressForUser(userId);
  return all[gameSlug] ?? null;
}

/**
 * Persists (upserts) one user's progress for a game, inside the write lock so
 * a save racing a register/like never clobbers the file.
 */
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
  return withDbLock(async () => {
    const db = await readDbFile();

    const cleanCompleted: Record<string, boolean> = {};
    if (data.completed && typeof data.completed === "object") {
      Object.keys(data.completed).forEach((k) => {
        const idx = Number(k);
        if (Number.isInteger(idx) && idx >= 0 && data.completed[k]) {
          cleanCompleted[String(idx)] = true;
        }
      });
    }

    const progress = {
      userId,
      gameSlug,
      currentLevel: Math.max(
        0,
        Number.isInteger(data.currentLevel) && data.currentLevel >= 0
          ? data.currentLevel
          : 0
      ),
      score: Math.max(
        0,
        typeof data.score === "number" && Number.isFinite(data.score) ? data.score : 0
      ),
      completed: cleanCompleted,
      totalLevels: Math.max(
        1,
        Number.isInteger(data.totalLevels) && data.totalLevels > 0 ? data.totalLevels : 1
      ),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = (db.gameProgress ?? []).findIndex(
      (p) => p.userId === userId && p.gameSlug === gameSlug
    );

    if (existingIndex > -1) {
      db.gameProgress[existingIndex] = progress;
    } else {
      if (!db.gameProgress) db.gameProgress = [];
      db.gameProgress.push(progress);
    }

    await saveDbFile(db);
    return progress;
  });
}

// --- BLOG INTERACTIONS ---

export async function getBlogEngagement(blogSlug: string, userId?: string) {
  const db = await readDbFile();
  const likes = db.likes.filter((l) => l.blogSlug === blogSlug);
  const comments = db.comments.filter((c) => c.blogSlug === blogSlug && !c.isDeleted);

  const userLiked = userId ? likes.some((l) => l.userId === userId) : false;

  // Most recent unique likers (max 5), so the UI can render an avatar strip.
  const recentLikers = Array.from(
    new Map(
      likes
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((l) => {
          const u = db.users.find((u) => u.id === l.userId);
          return [
            l.userId,
            u
              ? { id: u.id, name: u.name, username: u.username, avatarUrl: u.avatarUrl }
              : { id: l.userId, name: "User", username: "user", avatarUrl: "" },
          ];
        })
    ).values()
  ).slice(0, 5);

  return {
    likesCount: likes.length,
    commentsCount: comments.length,
    userLiked,
    recentLikers,
  };
}

export async function getComments(blogSlug: string, userId?: string): Promise<Comment[]> {
  const db = await readDbFile();
  return db.comments
    .filter((c) => c.blogSlug === blogSlug && !c.isDeleted)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((c) => ({ ...c, ...commentLikeStats(c, db.likes, userId) }));
}

function commentLikeStats(comment: Comment, allLikes: Like[], userId?: string) {
  const likes = allLikes.filter((l) => l.commentId === comment.id);
  return {
    likesCount: likes.length,
    userLiked: userId ? likes.some((l) => l.userId === userId) : false,
  };
}

export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<{ likesCount: number; userLiked: boolean }> {
  return withDbLock(async () => {
    const db = await readDbFile();

    const comment = db.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error("Comment not found");

    const existingIndex = db.likes.findIndex(
      (l) => l.commentId === commentId && l.userId === userId
    );

    if (existingIndex > -1) {
      db.likes.splice(existingIndex, 1);
    } else {
      db.likes.push({
        id: `like-${crypto.randomUUID()}`,
        commentId,
        userId,
        createdAt: new Date().toISOString(),
      });
    }

    await saveDbFile(db);
    return commentLikeStats(comment, db.likes, userId);
  });
}

export async function toggleLike(blogSlug: string, userId: string): Promise<boolean> {
  return withDbLock(async () => {
    const db = await readDbFile();

    const existingLikeIndex = db.likes.findIndex(
      (l) => l.blogSlug === blogSlug && l.userId === userId
    );

    let liked = false;
    if (existingLikeIndex > -1) {
      db.likes.splice(existingLikeIndex, 1);
    } else {
      db.likes.push({
        id: `like-${crypto.randomUUID()}`,
        blogSlug,
        userId,
        createdAt: new Date().toISOString(),
      });
      liked = true;
    }

    await saveDbFile(db);
    return liked;
  });
}

export async function addComment(
  blogSlug: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  return withDbLock(async () => {
    const db = await readDbFile();

    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    const trimmedContent = content.trim();
    if (trimmedContent === "") throw new Error("Comment cannot be empty");
    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
    }

    const newComment: Comment = {
      id: `comment-${crypto.randomUUID()}`,
      blogSlug,
      userId,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content: trimmedContent,
      parentId: parentId || undefined,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    db.comments.push(newComment);
    await saveDbFile(db);
    return newComment;
  });
}

export async function editComment(
  commentId: string,
  userId: string,
  content: string
): Promise<Comment> {
  return withDbLock(async () => {
    const db = await readDbFile();
    const comment = db.comments.find((c) => c.id === commentId);

    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== userId) throw new Error("Unauthorized editing");

    const trimmedContent = content.trim();
    if (trimmedContent === "") throw new Error("Comment cannot be empty");
    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
    }

    comment.content = trimmedContent;
    comment.updatedAt = new Date().toISOString();

    await saveDbFile(db);
    return comment;
  });
}

export async function deleteComment(
  commentId: string,
  userId: string,
  isAdmin: boolean
): Promise<Comment> {
  return withDbLock(async () => {
    const db = await readDbFile();
    const comment = db.comments.find((c) => c.id === commentId);

    if (!comment) throw new Error("Comment not found");

    // Only owner or admin can delete
    if (comment.userId !== userId && !isAdmin) {
      throw new Error("Unauthorized deletion");
    }

    comment.isDeleted = true;
    comment.content = "[Comment deleted by user]";
    comment.updatedAt = new Date().toISOString();

    await saveDbFile(db);
    return comment;
  });
}

// Re-export hashes for any external consumers (kept for API parity).
export { hashPassword, verifyPassword };

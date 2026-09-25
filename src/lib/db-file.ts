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
  Gamification,
  LeaderboardEntry,
} from "@/types";
import { hashPassword, verifyPassword } from "./password";
import {
  dateKeyFromDaysAgo,
  levelForXp,
  scoreForCompleted,
  DAILY_HINT_LIMIT,
} from "./gamification";

// DB Types
interface DatabaseSchema {
  users: UserWithPassword[];
  comments: Comment[];
  likes: Like[];
  blogSettings?: BlogSettings;
  gameProgress: GameProgress[];
  gamification: Gamification[];
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

// Usernames that must never appear on the public leaderboard, regardless of
// the DB state (defense-in-depth on top of the hiddenFromLeaderboard flag).
const HIDDEN_USERNAMES = new Set([
  "test4",
  "test5",
  "dua",
  "dua_zainab",
  "zainab",
  "rania",
  "rania_afzal",
  "Rania Afzal",
  "Dua",
  "@dua_zainab",
]);

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
      gamification: [],
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
// other's changes â€” each task re-reads the freshest file while holding the lock.
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

  return { users, comments, likes, blogSettings: DEFAULT_BLOG_SETTINGS, gameProgress: [], gamification: [] };
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
    // Privileges are only granted via the seeded admin account â€” never
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

const GAME_SLUGS = [
  "html-hero",
  "grid-garden",
  "flexbox-zoo",
  "js-detective",
  "animation-arena",
  "php-playground",
  "query-quest",
] as const;

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
    solutions?: Record<string, string>;
    hints?: { date: string; used: number };
    version?: number;
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

    const cleanSolutions: Record<string, string> = {};
    if (data.solutions && typeof data.solutions === "object") {
      Object.keys(data.solutions).forEach((k) => {
        const idx = Number(k);
        const v = data.solutions?.[k];
        if (Number.isInteger(idx) && idx >= 0 && typeof v === "string" && v.length <= 20000) {
          cleanSolutions[String(idx)] = v;
        }
      });
    }

    const cleanHints =
      data.hints && typeof data.hints === "object" && typeof data.hints.date === "string"
        ? {
            date: data.hints.date.slice(0, 10),
            used: Math.max(0, Number(data.hints.used) || 0),
          }
        : { date: "", used: 0 };

    const progress = {
      userId,
      gameSlug,
      currentLevel: Math.max(
        0,
        Number.isInteger(data.currentLevel) && data.currentLevel >= 0
          ? data.currentLevel
          : 0
      ),
      // The server is the source of truth for scoring: recompute the total
      // from the completed map for games with a points table, so scores can
      // never diverge from the shipped XP values.
      score:
        scoreForCompleted(gameSlug, cleanCompleted) ??
        Math.max(
          0,
          typeof data.score === "number" && Number.isFinite(data.score) ? data.score : 0
        ),
      completed: cleanCompleted,
      solutions: cleanSolutions,
      hints: cleanHints,
      totalLevels: Math.max(
        1,
        Number.isInteger(data.totalLevels) && data.totalLevels > 0 ? data.totalLevels : 1
      ),
      version: Number.isInteger(data.version) && data.version! > 0 ? data.version! : 3,
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

    // Every play session bumps the user's streak / XP (same write lock, so no
    // nested locking needed here â€” recompute mutates the already-locked db).
    recomputeGamificationLocked(db, userId);

    await saveDbFile(db);
    return progress;
  });
}

// --- GAMIFICATION (XP, levels, streaks) ---

/**
 * Recomputes a user's gamification row from their game-progress rows and
 * advances the daily streak. Must only be called while holding the DB write
 * lock (it mutates `db` in place) â€” i.e. from saveGameProgress' locked task.
 */
function recomputeGamificationLocked(
  db: DatabaseSchema,
  userId: string
): Gamification {
  const rows = (db.gameProgress ?? []).filter((p) => p.userId === userId);
  const baseXp = rows.reduce((sum, p) => sum + (p.score || 0), 0);
  const gamesPlayed = new Set(rows.map((p) => p.gameSlug)).size;

  const today = dateKeyFromDaysAgo(0);
  const yesterday = dateKeyFromDaysAgo(1);
  const existing = (db.gamification ?? []).find((g) => g.userId === userId);

  let currentStreak = existing?.currentStreak ?? 0;
  let longestStreak = existing?.longestStreak ?? 0;
  const lastPlayedAt = existing?.lastPlayedAt ?? null;

  if (lastPlayedAt === today) {
    // Already counted a play today — streak unchanged.
  } else if (lastPlayedAt === yesterday) {
    currentStreak += 1;
    longestStreak = Math.max(longestStreak, currentStreak);
  } else {
    // Missed a day (or first play ever) — streak restarts at 1.
    currentStreak = 1;
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  const gamification: Gamification = {
    userId,
    // Recompute the score-derived total, then carry any admin adjustment so
    // a new play session never erases a manual XP grant/penalty.
    totalXp: baseXp + (existing?.xpAdjustment ?? 0),
    gamesPlayed,
    currentStreak,
    longestStreak,
    lastPlayedAt: today,
    // The shared daily hint budget lives on the gamification row (one pool
    // across all games) — preserve whatever was already spent today.
    hints: existing?.hints,
    xpAdjustment: existing?.xpAdjustment ?? 0,
    updatedAt: new Date().toISOString(),
  };

  db.gamification = [
    ...(db.gamification ?? []).filter((g) => g.userId !== userId),
    gamification,
  ];
  return gamification;
}

/** Current gamification summary for one user (XP is always recomputed from progress). */
export async function getGamification(userId: string): Promise<Gamification> {
  const db = await readDbFile();
  const rows = (db.gameProgress ?? []).filter((p) => p.userId === userId);
  const baseXp = rows.reduce((sum, p) => sum + (p.score || 0), 0);
  const gamesPlayed = new Set(rows.map((p) => p.gameSlug)).size;
  const stored = (db.gamification ?? []).find((g) => g.userId === userId);

  return {
    userId,
    totalXp: baseXp + (stored?.xpAdjustment ?? 0),
    gamesPlayed,
    currentStreak: stored?.currentStreak ?? 0,
    longestStreak: stored?.longestStreak ?? 0,
    lastPlayedAt: stored?.lastPlayedAt ?? null,
    hints: stored?.hints,
    xpAdjustment: stored?.xpAdjustment ?? 0,
    updatedAt: stored?.updatedAt ?? new Date().toISOString(),
  };
}

// --- SHARED DAILY HINT BUDGET ---

/**
 * How many of today's shared 3 hints the user has left across all games
 * (the pool is per user, not per game).
 */
export async function getDailyHintUsage(
  userId: string
): Promise<{ used: number; left: number }> {
  const db = await readDbFile();
  const stored = (db.gamification ?? []).find((g) => g.userId === userId);
  const today = dateKeyFromDaysAgo(0);
  const used =
    stored?.hints && stored.hints.date === today
      ? Math.max(0, Number(stored.hints.used) || 0)
      : 0;
  return { used, left: Math.max(0, DAILY_HINT_LIMIT - used) };
}

/**
 * Consumes one hint from the user's shared daily budget. Server-authoritative:
 * the count rolls over at midnight UTC and can never climb above the daily cap,
 * regardless of which game the reveal happens in.
 */
export async function consumeDailyHint(
  userId: string
): Promise<{ ok: boolean; used: number; left: number }> {
  return withDbLock(async () => {
    const db = await readDbFile();
    const today = dateKeyFromDaysAgo(0);
    const idx = (db.gamification ?? []).findIndex((g) => g.userId === userId);
    const existing = idx > -1 ? db.gamification[idx] : null;

    const used =
      existing?.hints && existing.hints.date === today
        ? Math.max(0, Number(existing.hints.used) || 0)
        : 0;

    if (used >= DAILY_HINT_LIMIT) {
      return { ok: false, used, left: 0 };
    }

    const nextUsed = used + 1;
    const gamification: Gamification = {
      userId,
      totalXp: existing?.totalXp ?? 0,
      gamesPlayed: existing?.gamesPlayed ?? 0,
      currentStreak: existing?.currentStreak ?? 0,
      longestStreak: existing?.longestStreak ?? 0,
      lastPlayedAt: existing?.lastPlayedAt ?? null,
      hints: { date: today, used: nextUsed },
      xpAdjustment: existing?.xpAdjustment ?? 0,
      updatedAt: new Date().toISOString(),
    };

    if (idx > -1) {
      db.gamification[idx] = gamification;
    } else {
      if (!db.gamification) db.gamification = [];
      db.gamification.push(gamification);
    }

    await saveDbFile(db);
    return { ok: true, used: nextUsed, left: DAILY_HINT_LIMIT - nextUsed };
  });
}

/** Top players by total XP (admins excluded â€” they're the site owners). */
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const db = await readDbFile();
  const scored = db.users
    .filter((u) => !u.isAdmin && !HIDDEN_USERNAMES.has(u.username))
    .map((u) => {
      const gp = (db.gameProgress ?? []).filter((p) => p.userId === u.id);
      const stored = (db.gamification ?? []).find((g) => g.userId === u.id);
      const totalXp = gp.reduce((sum, p) => sum + (p.score || 0), 0) + (stored?.xpAdjustment ?? 0);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
        totalXp,
        gamesPlayed: new Set(gp.map((p) => p.gameSlug)).size,
        currentStreak: stored?.currentStreak ?? 0,
        // QA/test accounts only drop off when they have nothing to show
        // for it; anyone who earned 100+ XP stays on the board.
        hidden: u.hiddenFromLeaderboard && totalXp < 100,
      };
    })
    .filter((s) => !s.hidden)
    .sort(
      (a, b) =>
        b.totalXp - a.totalXp || a.createdAt.localeCompare(b.createdAt)
    );

  return scored.slice(0, limit).map((s, i) => ({
    rank: i + 1,
    user: { id: s.id, name: s.name, username: s.username, avatarUrl: s.avatarUrl },
    totalXp: s.totalXp,
    level: levelForXp(s.totalXp),
    gamesPlayed: s.gamesPlayed,
    currentStreak: s.currentStreak,
  }));
}

/** 1-based rank among all non-admin players; null for admins / unknown users. */
export async function getUserRank(userId: string): Promise<number | null> {
  const db = await readDbFile();
  const target = db.users.find((u) => u.id === userId);
  if (!target || target.isAdmin) return null;

  const ranked = db.users
    .filter((u) => !u.isAdmin && !HIDDEN_USERNAMES.has(u.username))
    .map((u) => {
      const gp = (db.gameProgress ?? []).filter((p) => p.userId === u.id);
      const stored = (db.gamification ?? []).find((g) => g.userId === u.id);
      const xp = gp.reduce((sum, p) => sum + (p.score || 0), 0) + (stored?.xpAdjustment ?? 0);
      return {
        id: u.id,
        xp,
        createdAt: u.createdAt,
        hidden: u.hiddenFromLeaderboard && xp < 100,
      };
    })
    .filter((r) => !r.hidden)
    .sort((a, b) => b.xp - a.xp || a.createdAt.localeCompare(b.createdAt));

  const idx = ranked.findIndex((r) => r.id === userId);
  return idx > -1 ? idx + 1 : null;
}

// --- ADMIN USER MANAGEMENT ---

/**
 * Applies an XP bonus/penalty to a non-admin user. The adjustment is stored on
 * the gamification row and layered on top of the score-derived total, so it
 * survives future recomputes (new play sessions, hint consumption, etc.).
 */
export async function adjustUserXp(
  userId: string,
  delta: number
): Promise<Gamification> {
  return withDbLock(async () => {
    const db = await readDbFile();
    const target = db.users.find((u) => u.id === userId);
    if (!target) throw new Error("User not found");
    if (target.isAdmin) throw new Error("Cannot adjust an admin account");

    const baseXp = (db.gameProgress ?? [])
      .filter((p) => p.userId === userId)
      .reduce((sum, p) => sum + (p.score || 0), 0);
    const gamesPlayed = new Set(
      (db.gameProgress ?? []).filter((p) => p.userId === userId).map((p) => p.gameSlug)
    ).size;

    const stored = (db.gamification ?? []).find((g) => g.userId === userId);
    const adjustment = (stored?.xpAdjustment ?? 0) + delta;

    const gamification: Gamification = {
      userId,
      totalXp: baseXp + adjustment,
      gamesPlayed,
      currentStreak: stored?.currentStreak ?? 0,
      longestStreak: stored?.longestStreak ?? 0,
      lastPlayedAt: stored?.lastPlayedAt ?? null,
      hints: stored?.hints,
      xpAdjustment: adjustment,
      updatedAt: new Date().toISOString(),
    };

    db.gamification = [
      ...(db.gamification ?? []).filter((g) => g.userId !== userId),
      gamification,
    ];
    await saveDbFile(db);
    return gamification;
  });
}

/**
 * Permanently removes a non-admin user and every record referencing them
 * (game progress, gamification, comments, likes). Admin accounts are protected.
 */
export async function deleteUser(userId: string): Promise<{ ok: boolean }> {
  return withDbLock(async () => {
    const db = await readDbFile();
    const target = db.users.find((u) => u.id === userId);
    if (!target) throw new Error("User not found");
    if (target.isAdmin) throw new Error("Cannot delete an admin account");

    db.users = db.users.filter((u) => u.id !== userId);
    db.gameProgress = (db.gameProgress ?? []).filter((p) => p.userId !== userId);
    db.gamification = (db.gamification ?? []).filter((g) => g.userId !== userId);
    db.comments = (db.comments ?? []).filter((c) => c.userId !== userId);
    db.likes = (db.likes ?? []).filter((l) => l.userId !== userId);
    await saveDbFile(db);
    return { ok: true };
  });
}

// Re-export hashes for any external consumers (kept for API parity).
export { hashPassword, verifyPassword };

import { NextResponse } from "next/server";
import {
  getGameProgress,
  getGameProgressForUser,
  saveGameProgress,
  getGamification,
  getUserRank,
} from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { levelStatsForXp, dateKey } from "@/lib/gamification";
import type { Gamification, GamificationSummary } from "@/types";

const GAME_SLUGS = ["html-hero", "grid-garden", "flexbox-zoo", "js-detective"];

function buildGamificationSummary(
  gam: Gamification,
  rank: number | null
): GamificationSummary {
  const { level, floor, next, progressPct } = levelStatsForXp(gam.totalXp);
  return {
    totalXp: gam.totalXp,
    level,
    levelFloor: floor,
    levelNext: next,
    levelProgressPct: progressPct,
    gamesPlayed: gam.gamesPlayed,
    currentStreak: gam.currentStreak,
    longestStreak: gam.longestStreak,
    rank,
    playedToday: gam.lastPlayedAt === dateKey(new Date()),
  };
}

/**
 * GET /api/games/progress
 *   ?slug=html-hero      → { progress: {...} | null }
 *   (no slug)             → { progress: { [gameSlug]: {...} }, gamification: {...} }
 * Requires an active session.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to sync your progress." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      if (!GAME_SLUGS.includes(slug)) {
        return NextResponse.json({ error: "Unknown game" }, { status: 400 });
      }
      const progress = await getGameProgress(user.id, slug);
      return NextResponse.json({ progress });
    }

    const [progress, gamification, rank] = await Promise.all([
      getGameProgressForUser(user.id),
      getGamification(user.id),
      getUserRank(user.id),
    ]);
    return NextResponse.json({
      progress,
      gamification: buildGamificationSummary(gamification, rank),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** POST /api/games/progress — upsert one game's progress for the logged-in user. */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to save your progress." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { slug, currentLevel, score, completed, totalLevels, solutions, hints } = body;

    if (!slug || !GAME_SLUGS.includes(slug)) {
      return NextResponse.json({ error: "Unknown game" }, { status: 400 });
    }

    const cleanSolutions: Record<string, string> = {};
    if (solutions && typeof solutions === "object") {
      Object.keys(solutions).forEach((k) => {
        const idx = Number(k);
        const v = solutions[k];
        if (Number.isInteger(idx) && idx >= 0 && typeof v === "string" && v.length <= 20000) {
          cleanSolutions[String(idx)] = v;
        }
      });
    }

    const cleanHints =
      hints && typeof hints === "object" && typeof hints.date === "string"
        ? {
            date: hints.date.slice(0, 10),
            used: Math.max(0, Number(hints.used) || 0),
          }
        : undefined;

    const progress = await saveGameProgress(user.id, slug, {
      currentLevel: Number(currentLevel ?? 0),
      score: Number(score ?? 0),
      completed: completed && typeof completed === "object" ? completed : {},
      totalLevels: Number(totalLevels ?? 1),
      solutions: Object.keys(cleanSolutions).length ? cleanSolutions : undefined,
      hints: cleanHints,
    });

    const [gamification, rank] = await Promise.all([
      getGamification(user.id),
      getUserRank(user.id),
    ]);

    return NextResponse.json({
      progress,
      gamification: buildGamificationSummary(gamification, rank),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
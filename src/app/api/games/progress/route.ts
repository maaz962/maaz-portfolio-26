import { NextResponse } from "next/server";
import {
  getGameProgress,
  getGameProgressForUser,
  saveGameProgress,
} from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const GAME_SLUGS = ["html-hero", "grid-garden", "flexbox-zoo"];

/**
 * GET /api/games/progress
 *   ?slug=html-hero      → { progress: {...} | null }
 *   (no slug)             → { progress: { [gameSlug]: {...} } }
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

    const progress = await getGameProgressForUser(user.id);
    return NextResponse.json({ progress });
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
    const { slug, currentLevel, score, completed, totalLevels } = body;

    if (!slug || !GAME_SLUGS.includes(slug)) {
      return NextResponse.json({ error: "Unknown game" }, { status: 400 });
    }

    const progress = await saveGameProgress(user.id, slug, {
      currentLevel: Number(currentLevel ?? 0),
      score: Number(score ?? 0),
      completed: completed && typeof completed === "object" ? completed : {},
      totalLevels: Number(totalLevels ?? 1),
    });

    return NextResponse.json({ progress });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
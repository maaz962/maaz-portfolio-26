import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { adjustUserXp } from "@/lib/db";

/**
 * POST /api/admin/users/[id]/xp
 * Body: { delta: number } — applies an XP bonus (positive) or penalty
 * (negative) to a non-admin user. Admin-only.
 */

// Sane cap so a bad request can never corrupt a leaderboard.
const MAX_DELTA = 100000;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const raw = Number(body?.delta);
    if (!Number.isInteger(raw) || !Number.isFinite(raw)) {
      return NextResponse.json({ error: "Invalid delta" }, { status: 400 });
    }
    const delta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, raw));
    if (delta === 0) {
      return NextResponse.json({ error: "Delta cannot be zero" }, { status: 400 });
    }

    const gamification = await adjustUserXp(params.id, delta);
    return NextResponse.json({ ok: true, totalXp: gamification.totalXp });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
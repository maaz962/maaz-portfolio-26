import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import {
  deleteUser,
  getAdminUserDetail,
  setUserHiddenFromLeaderboard,
  setUserTotalXp,
} from "@/lib/db";

/**
 * Admin-only access to a single account.
 *
 *   GET    → identity, per-game progress, XP standing, XP audit trail
 *   PATCH  → { totalXp, reason } | { hiddenFromLeaderboard }
 *   DELETE → permanently remove the account
 *
 * The session-scoped `/api/games/progress` cannot back the GET: it only ever
 * returns the caller's own progress, while an admin needs to read any account.
 */

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

// Sane ceiling so a typo cannot produce an absurd leaderboard total.
const MAX_TOTAL_XP = 1_000_000;
const MAX_REASON_LENGTH = 200;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const detail = await getAdminUserDetail(params.id);
    return NextResponse.json(detail, { headers: NO_STORE });
  } catch (error: any) {
    const status = error?.message === "User not found" ? 404 : 500;
    return NextResponse.json({ error: error.message ?? "Failed to load user" }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const wantsVisibility = body?.hiddenFromLeaderboard !== undefined;
    const wantsXp = body?.totalXp !== undefined;

    // Rejecting the combination beats picking a winner: silently ignoring the
    // XP field would leave the admin believing a change applied that did not.
    if (wantsVisibility && wantsXp) {
      return NextResponse.json(
        { error: "Update totalXp and hiddenFromLeaderboard separately" },
        { status: 400 }
      );
    }

    if (wantsVisibility) {
      if (typeof body.hiddenFromLeaderboard !== "boolean") {
        return NextResponse.json({ error: "hiddenFromLeaderboard must be a boolean" }, { status: 400 });
      }
      const result = await setUserHiddenFromLeaderboard(params.id, body.hiddenFromLeaderboard);
      return NextResponse.json({ ...result, detail: await getAdminUserDetail(params.id) }, { headers: NO_STORE });
    }

    if (wantsXp) {
      const totalXp = Number(body.totalXp);
      if (!Number.isInteger(totalXp) || totalXp < 0 || totalXp > MAX_TOTAL_XP) {
        return NextResponse.json(
          { error: `totalXp must be a whole number between 0 and ${MAX_TOTAL_XP}` },
          { status: 400 }
        );
      }

      // Required: an unexplained XP change is indistinguishable from a bug,
      // and the reason is the only record of who changed what and why.
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      if (!reason) {
        return NextResponse.json({ error: "A reason is required for XP changes" }, { status: 400 });
      }
      if (reason.length > MAX_REASON_LENGTH) {
        return NextResponse.json(
          { error: `Reason must be ${MAX_REASON_LENGTH} characters or fewer` },
          { status: 400 }
        );
      }

      const detail = await setUserTotalXp(params.id, totalXp, reason, admin.username);
      return NextResponse.json({ ok: true, detail }, { headers: NO_STORE });
    }

    return NextResponse.json(
      { error: "Nothing to update. Provide totalXp or hiddenFromLeaderboard." },
      { status: 400 }
    );
  } catch (error: any) {
    const status = error?.message === "User not found" ? 404 : 400;
    return NextResponse.json({ error: error.message ?? "Update failed" }, { status });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Permanently removes a non-admin user and all their records
 * (game progress, gamification, XP audit trail). Admin-only.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteUser(params.id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

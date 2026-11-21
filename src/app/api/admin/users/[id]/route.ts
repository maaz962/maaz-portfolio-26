import { NextRequest, NextResponse } from "next/server";
import { getAdminActor } from "@/lib/auth";
import {
  deleteUser,
  getAdminUserDetail,
  listUsers,
  purgeUser,
  restoreUser,
  setUserHiddenFromLeaderboard,
  setUserRole,
  setUserTotalXp,
} from "@/lib/db";
import { can, isKnownRole, roleOf } from "@/lib/roles";

/**
 * Admin-only access to a single account.
 *
 *   GET    → identity, per-game progress, XP standing, XP audit trail
 *   PATCH  → { totalXp, reason } | { hiddenFromLeaderboard } | { role }
 *   POST   → restore this account from Trash
 *   DELETE → move to Trash (default) or permanently erase (?permanent=1)
 *
 * Every mutation is permission-checked against the caller's panel role, not
 * just "is an admin". Editors and viewers reach GET; owners/admins reach the
 * mutations; only owners may grant roles or erase from Trash.
 *
 * The session-scoped `/api/games/progress` cannot back the GET: it only ever
 * returns the caller's own progress, while an admin needs to read any account.
 */

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

// Sane ceiling so a typo cannot produce an absurd leaderboard total.
const MAX_TOTAL_XP = 1_000_000;
const MAX_REASON_LENGTH = 200;

function forbidden() {
  return NextResponse.json({ error: "Your role cannot change accounts" }, { status: 403 });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!can(actor.role, "users:view")) return forbidden();

  try {
    const detail = await getAdminUserDetail(params.id);
    return NextResponse.json(detail, { headers: NO_STORE });
  } catch (error: any) {
    const status = error?.message === "User not found" ? 404 : 500;
    return NextResponse.json({ error: error.message ?? "Failed to load user" }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!can(actor.role, "users:manage")) return forbidden();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const wantsRole = body?.role !== undefined;
    const wantsVisibility = body?.hiddenFromLeaderboard !== undefined;
    const wantsXp = body?.totalXp !== undefined;

    const requested = [wantsRole, wantsVisibility, wantsXp].filter(Boolean).length;
    // Rejecting the combination beats picking a winner: silently ignoring a
    // field would leave the admin believing a change applied that did not.
    if (requested > 1) {
      return NextResponse.json(
        { error: "Update role, XP and visibility in separate requests" },
        { status: 400 }
      );
    }

    if (wantsRole) {
      if (!can(actor.role, "roles:manage")) {
        return NextResponse.json(
          { error: "Only an owner can grant or revoke roles" },
          { status: 403 }
        );
      }
      if (!isKnownRole(body.role)) {
        return NextResponse.json({ error: "Unknown role" }, { status: 400 });
      }
      if (params.id === actor.user.id) {
        return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
      }

      // Never allow the last owner to be demoted: that would lock every role
      // change (including the fix) out of the panel.
      if (body.role !== "owner") {
        const accounts = await listUsers();
        const owners = accounts.filter((user) => roleOf(user) === "owner");
        if (owners.some((user) => user.id === params.id) && owners.length <= 1) {
          return NextResponse.json(
            { error: "Promote another owner before changing the last owner's role" },
            { status: 400 }
          );
        }
      }

      const user = await setUserRole(params.id, body.role);
      return NextResponse.json({ ok: true, user }, { headers: NO_STORE });
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

      const detail = await setUserTotalXp(params.id, totalXp, reason, actor.user.username);
      return NextResponse.json({ ok: true, detail }, { headers: NO_STORE });
    }

    return NextResponse.json(
      { error: "Nothing to update. Provide role, totalXp or hiddenFromLeaderboard." },
      { status: 400 }
    );
  } catch (error: any) {
    const status = error?.message === "User not found" ? 404 : 400;
    return NextResponse.json({ error: error.message ?? "Update failed" }, { status });
  }
}

/**
 * POST /api/admin/users/[id]
 * Restores an account from Trash. Undo is a first-class action, so it gets its
 * own verb rather than a magic PATCH field.
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!can(actor.role, "users:manage")) return forbidden();

  try {
    const user = await restoreUser(params.id);
    return NextResponse.json({ ok: true, user }, { headers: NO_STORE });
  } catch (error: any) {
    const status = error?.message === "User not found" ? 404 : 400;
    return NextResponse.json({ error: error.message ?? "Restore failed" }, { status });
  }
}

/**
 * DELETE /api/admin/users/[id]
 *   default        → soft delete (move to Trash), reversible
 *   ?permanent=1   → erase the account and all its rows (owner only, Trash only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!can(actor.role, "users:manage")) return forbidden();

  const permanent = req.nextUrl.searchParams.get("permanent") === "1";
  if (permanent && !can(actor.role, "users:purge")) {
    return NextResponse.json(
      { error: "Only an owner can permanently erase an account" },
      { status: 403 }
    );
  }

  try {
    const result = permanent ? await purgeUser(params.id) : await deleteUser(params.id);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error: any) {
    const status = error?.message === "User not found" ? 404 : 400;
    return NextResponse.json({ error: error?.message ?? "Delete failed" }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { deleteUser } from "@/lib/db";

/**
 * DELETE /api/admin/users/[id]
 * Permanently removes a non-admin user and all their records
 * (game progress, gamification, comments, likes). Admin-only.
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
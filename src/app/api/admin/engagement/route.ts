import { NextResponse } from "next/server";
import { getEngagementStats } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await getEngagementStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

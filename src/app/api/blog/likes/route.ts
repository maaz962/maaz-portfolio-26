import { NextResponse } from "next/server";
import { getBlogEngagement, toggleLike } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug || slug.length > 300) {
      return NextResponse.json({ error: "Invalid slug parameter" }, { status: 400 });
    }

    const user = await getSessionUser();
    const stats = await getBlogEngagement(slug, user?.id);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();

    if (!slug || typeof slug !== "string" || slug.length > 300) {
      return NextResponse.json({ error: "Invalid slug parameter" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to like this post." },
        { status: 401 }
      );
    }

    const liked = await toggleLike(slug, user.id);
    const stats = await getBlogEngagement(slug, user.id);

    return NextResponse.json({ ...stats, liked });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

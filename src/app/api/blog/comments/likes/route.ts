import { NextResponse } from "next/server";
import { toggleCommentLike } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { commentId } = await req.json();

    if (!commentId || typeof commentId !== "string" || commentId.length > 300) {
      return NextResponse.json({ error: "Invalid commentId parameter" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to like this comment." },
        { status: 401 }
      );
    }

    const result = await toggleCommentLike(commentId, user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
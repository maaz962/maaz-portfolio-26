import { NextResponse } from "next/server";
import { getAdminComments, adminDeleteComment, addComment } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const comments = await getAdminComments();
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug, content, parentId } = await req.json();

    if (!slug || !content || typeof content !== "string") {
      return NextResponse.json({ error: "slug and content are required" }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: "Comment cannot exceed 2000 characters" }, { status: 400 });
    }

    const comment = await addComment(slug, admin.id, content, parentId);
    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId parameter" }, { status: 400 });
    }

    await adminDeleteComment(commentId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

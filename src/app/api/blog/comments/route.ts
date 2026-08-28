import { NextResponse } from "next/server";
import { getComments, addComment, editComment, deleteComment } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const MAX_COMMENT_LENGTH = 2000;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug || slug.length > 300) {
      return NextResponse.json({ error: "Invalid slug parameter" }, { status: 400 });
    }

    const user = await getSessionUser();
    const comments = await getComments(slug, user?.id);
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { slug, content, parentId } = await req.json();

    if (!slug || !content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to post a comment." },
        { status: 401 }
      );
    }

    if (content.trim().length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const comment = await addComment(slug, user.id, content, parentId);
    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { commentId, content } = await req.json();

    if (!commentId || !content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (content.trim().length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const comment = await editComment(commentId, user.id, content);
    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId parameter" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const comment = await deleteComment(commentId, user.id, user.isAdmin);
    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

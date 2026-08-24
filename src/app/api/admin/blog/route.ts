import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminBlogPosts } from "@/lib/blog-service";
import {
  setSourceEnabled,
  toggleFeaturedPost,
  setPostHidden,
} from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await getAdminBlogPosts();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

interface AdminBlogAction {
  action: "toggle-source" | "toggle-featured" | "toggle-hidden";
  category?: string;
  slug?: string;
  enabled?: boolean;
  hidden?: boolean;
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body: AdminBlogAction = await req.json();

    if (body.action === "toggle-source") {
      if (!body.category || typeof body.enabled !== "boolean") {
        return NextResponse.json({ error: "category and enabled are required" }, { status: 400 });
      }
      await setSourceEnabled(body.category, body.enabled);
    } else if (body.action === "toggle-featured") {
      if (!body.slug) {
        return NextResponse.json({ error: "slug is required" }, { status: 400 });
      }
      await toggleFeaturedPost(body.slug);
    } else if (body.action === "toggle-hidden") {
      if (!body.slug || typeof body.hidden !== "boolean") {
        return NextResponse.json({ error: "slug and hidden are required" }, { status: 400 });
      }
      await setPostHidden(body.slug, body.hidden);
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Public blog is statically rendered — refresh it so moderation
    // (hidden posts, disabled sources, featured order) shows up immediately.
    revalidatePath("/blog");

    const data = await getAdminBlogPosts();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { getAdminBlogPosts } from "@/lib/blog-service";
import { getAdminComments } from "@/lib/db";
import { AdminBlogClient } from "./admin-blog-client";

export const metadata = {
  title: "Blog Admin | Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  // Server-side authorization: only admins can reach this page.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?from=/admin/blog");

  const [{ posts, settings }, comments] = await Promise.all([
    getAdminBlogPosts(),
    getAdminComments(),
  ]);

  return (
    <AdminBlogClient
      adminName={admin.name}
      initialPosts={posts}
      initialSettings={settings}
      initialComments={comments}
    />
  );
}

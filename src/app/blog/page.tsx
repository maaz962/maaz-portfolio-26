import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { BlogClient } from "./blog-client";

import { getBlogPosts } from "@/lib/blog-service";

export const metadata: Metadata = {
  title: `Blog | ${profile.name} | Full Stack Developer`,
  description: `Technical blog and articles by ${profile.name} specializing in Flutter, React, Next.js, and Cybersecurity.`,
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogClient initialPosts={posts} />;
}

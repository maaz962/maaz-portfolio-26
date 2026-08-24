import { cache } from "react";
import type { BlogPost, BlogCategory, BlogSettings, AdminBlogPost } from "@/types";
import { blogPosts as localBlogPosts, blogCategories } from "@/data/blog";
import { getBlogSettings, getAllEngagementCounts } from "@/lib/db";

const CATEGORY_TAGS: Record<BlogCategory, string> = {
  "Flutter": "flutter",
  "Web Development": "webdev",
  "React": "react",
  "Next.js": "nextjs",
  "Cybersecurity": "cybersecurity",
};

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  reading_time_minutes: number;
  cover_image: string | null;
  social_image: string | null;
  user: {
    name: string;
    profile_image: string;
  };
}

/** Map public Dev.to metadata onto our BlogPost shape. Article bodies are never fetched or stored. */
function mapDevToArticle(item: DevToArticle, category: BlogCategory): BlogPost {
  const date = new Date(item.published_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    slug: `devto-${item.id}`,
    title: item.title,
    description: item.description || "Click read more to view the full article on Dev.to.",
    category: category,
    image: item.cover_image || item.social_image || undefined,
    imageAlt: `${item.title} featured image`,
    author: {
      name: item.user.name,
      avatar: item.user.profile_image || undefined,
    },
    publishedDate: formattedDate,
    readTime: `${item.reading_time_minutes || 5} min read`,
    sourceUrl: item.url,
    sourceName: "Dev.to",
  };
}

/** Resolve one of our categories from an article's tags; falls back to Web Development. */
function categoryFromTags(tags: string[]): BlogCategory {
  const normalized = tags.map((t) => t.toLowerCase());
  for (const [category, tag] of Object.entries(CATEGORY_TAGS)) {
    if (normalized.includes(tag)) return category as BlogCategory;
  }
  return "Web Development";
}

async function fetchCategoryPosts(category: BlogCategory): Promise<BlogPost[]> {
  const tag = CATEGORY_TAGS[category];
  const url = `https://dev.to/api/articles?tag=${tag}&per_page=6`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Next.js cache revalidation of 1 hour (ISR)
      headers: {
        "User-Agent": "maaz-portfolio-agent",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Dev.to posts for category ${category}. Status: ${res.status}`);
    }

    const data: DevToArticle[] = await res.json();
    return data.map((item) => mapDevToArticle(item, category));
  } catch (error) {
    console.error(`Error fetching category ${category} from Dev.to:`, error);
    // Return empty array so other categories can still succeed
    return [];
  }
}

/**
 * Fetch a single article's metadata directly by its Dev.to id.
 * Used when a listed post rotates out of the per-category feed windows
 * between the listing render and the detail page render.
 */
async function fetchDevToArticleById(id: string): Promise<BlogPost | null> {
  const url = `https://dev.to/api/articles/${id}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "maaz-portfolio-agent" },
    });
    if (!res.ok) return null;

    const item = (await res.json()) as DevToArticle & { tags?: string[] };
    if (!item || !item.id) return null;
    return mapDevToArticle(item, categoryFromTags(item.tags ?? []));
  } catch (error) {
    console.error(`Error fetching Dev.to article ${id}:`, error);
    return null;
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Dev.to tag searches overlap — the same article can match several categories. */
function dedupeBySlug(posts: BlogPost[]): BlogPost[] {
  const seen = new Set<string>();
  const unique: BlogPost[] = [];
  for (const post of posts) {
    if (seen.has(post.slug)) continue;
    seen.add(post.slug);
    unique.push(post);
  }
  return unique;
}

function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => {
    const dateA = new Date(a.publishedDate).getTime();
    const dateB = new Date(b.publishedDate).getTime();
    // Handle invalid date parsing safely by checking for NaN
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
}

/** Public listing: skips disabled sources, drops hidden posts, pins featured posts first. */
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  try {
    const settings = await getBlogSettings();
    const enabledCategories = blogCategories.filter(
      (cat) => !settings.disabledSources.includes(cat)
    );
    const apiPosts: BlogPost[] = [];

    for (const cat of enabledCategories) {
      const posts = await fetchCategoryPosts(cat);
      apiPosts.push(...posts);
      // Stagger fetches to avoid HTTP 429 Rate Limiting
      await delay(150);
    }

    let result: BlogPost[];
    if (apiPosts.length === 0) {
      console.warn("Dev.to API returned 0 posts. Falling back to local static posts.");
      // Local fallback respects the same moderation settings
      result = localBlogPosts
        .filter((p) => !settings.hiddenSlugs.includes(p.slug))
        .map((p) => ({
          ...p,
          featured: settings.featuredSlugs.includes(p.slug),
        }));
    } else {
      result = dedupeBySlug(apiPosts)
        .filter((p) => !settings.hiddenSlugs.includes(p.slug))
        .map((p) => ({
          ...p,
          featured: settings.featuredSlugs.includes(p.slug),
        }));
    }

    // Featured first, then newest
    return result.sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      const dateA = new Date(a.publishedDate).getTime();
      const dateB = new Date(b.publishedDate).getTime();
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error in getBlogPosts service layer:", error);
    return localBlogPosts;
  }
});

/**
 * Single public post by slug. Resolution order:
 * 1. Current public listing (respects moderation settings)
 * 2. Direct Dev.to metadata lookup for `devto-<id>` slugs that rotated
 *    out of the feed windows after being listed (hidden slugs still blocked)
 * 3. Local static posts
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const settings = await getBlogSettings();
  if (settings.hiddenSlugs.includes(slug)) return null;

  const posts = await getBlogPosts();
  const listed = posts.find((post) => post.slug === slug);
  if (listed) return listed;

  if (slug.startsWith("devto-")) {
    const id = slug.slice("devto-".length);
    const fetched = await fetchDevToArticleById(id);
    if (fetched) {
      return { ...fetched, featured: settings.featuredSlugs.includes(fetched.slug) };
    }
  }

  const local = localBlogPosts.find((post) => post.slug === slug);
  if (local) {
    return { ...local, featured: settings.featuredSlugs.includes(local.slug) };
  }

  return null;
}

/** Related reading: same category first, then newest remaining posts to fill the row. */
export async function getRelatedBlogPosts(
  currentSlug: string,
  category: BlogCategory,
  limit = 3
): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  const sameCategory = posts.filter((p) => p.slug !== currentSlug && p.category === category);
  const others = posts.filter((p) => p.slug !== currentSlug && p.category !== category);
  return [...sameCategory, ...others].slice(0, limit);
}

/** Admin listing: every imported post (including hidden + disabled sources) with engagement counts. */
export async function getAdminBlogPosts(): Promise<{
  posts: AdminBlogPost[];
  settings: BlogSettings;
}> {
  const settings = await getBlogSettings();
  const counts = await getAllEngagementCounts();

  const categories = Object.keys(CATEGORY_TAGS) as BlogCategory[];
  const apiPosts: BlogPost[] = [];

  for (const cat of categories) {
    const posts = await fetchCategoryPosts(cat);
    apiPosts.push(...posts);
    await delay(150);
  }

  // If Dev.to is unreachable, fall back to the local static posts for the admin view too
  const source = apiPosts.length > 0 ? dedupeBySlug(apiPosts) : localBlogPosts;

  const posts: AdminBlogPost[] = source.map((post) => {
    const stats = counts[post.slug] ?? { likes: 0, comments: 0 };
    return {
      ...post,
      featured: settings.featuredSlugs.includes(post.slug),
      hidden: settings.hiddenSlugs.includes(post.slug),
      likesCount: stats.likes,
      commentsCount: stats.comments,
    };
  });

  return { posts, settings };
}

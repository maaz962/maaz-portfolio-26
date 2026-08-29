import type { LucideIcon } from "lucide-react";

/** A single link used in nav bars, footers, or social rows. */
export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Broad category used to group and color-code skills/tech-stack items. */
export type SkillCategory =
  | "frontend"
  | "backend"
  | "database"
  | "mobile"
  | "security"
  | "tools";

/** Honest proficiency label — no misleading percentage bars. */
export type SkillProficiency = "development" | "familiar" | "learning";

export interface Skill {
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  icon?: LucideIcon;
}

/** Filter keys used by the Projects section — only show tabs with matching projects. */
export type ProjectFilterCategory =
  | "web"
  | "react"
  | "nextjs"
  | "php"
  | "laravel"
  | "flutter"
  | "cybersecurity";

export interface Project {
  slug: string;
  title: string;
  description: string;
  /** Short label shown on cards, e.g. "Mobile" or "Cybersecurity". */
  category: string;
  technologies: string[];
  /** One or more filter categories this project belongs to. */
  categories: ProjectFilterCategory[];
  image?: string;
  imageAlt?: string;
  github?: string;
  liveDemo?: string;
  featured?: boolean;
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  affiliation?: string;
  location?: string;
  /** Display period, e.g. "May 2025 – May 2026" or "Before Joint Secretary". */
  period: string;
  summary?: string;
  highlights?: string[];
  /** Visually emphasize the current / most recent role. */
  featured?: boolean;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string | "Present";
  /** Highlight the in-progress degree (e.g. BSCS). */
  current?: boolean;
  summary?: string;
}

export interface Service {
  slug: string;
  title: string;
  description: string;
  technologies: string[];
  icon: LucideIcon;
  featured?: boolean;
}

export type Theme = "light" | "dark";

export type BlogCategory =
  | "Flutter"
  | "Web Development"
  | "React"
  | "Next.js"
  | "Cybersecurity";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  image?: string;
  imageAlt?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedDate: string;
  readTime: string;
  content?: string;
  sourceUrl?: string;
  sourceName?: string;
  /** Set server-side for posts the admin has featured. */
  featured?: boolean;
}

/** Admin-controlled blog configuration persisted in the JSON DB. */
export interface BlogSettings {
  /** Source categories (e.g. Dev.to tags) that are currently disabled. */
  disabledSources: string[];
  /** Post slugs marked as featured — pinned first on the public blog. */
  featuredSlugs: string[];
  /** Post slugs hidden from the public blog but visible in admin. */
  hiddenSlugs: string[];
}

/** A blog post enriched with moderation flags + engagement counts for the admin dashboard. */
export interface AdminBlogPost extends BlogPost {
  featured: boolean;
  hidden: boolean;
  likesCount: number;
  commentsCount: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  blogSlug: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  parentId?: string; // For nesting reply threads
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  /** Computed for API responses: how many users liked this comment. */
  likesCount?: number;
  /** Computed for API responses: whether the current user liked this comment. */
  userLiked?: boolean;
}

export interface Like {
  id: string;
  /** Set when the like targets a post/game (keyed by slug). */
  blogSlug?: string;
  /** Set when the like targets an individual comment. */
  commentId?: string;
  userId: string;
  createdAt: string;
}

/** Per-user progress for a single game, so the user can resume where they left off. */
export interface GameProgress {
  userId: string;
  gameSlug: string;
  /** Zero-based index of the level to resume on next visit. */
  currentLevel: number;
  score: number;
  /** Zero-based level indices that have been completed (object so it round-trips like the engines' STATE.completed). */
  completed: Record<string, boolean>;
  /** Total number of levels in this game (used by the hub for "x of y levels"). */
  totalLevels: number;
  updatedAt: string;
}

export interface BlogEngagement {
  likesCount: number;
  commentsCount: number;
  userLiked: boolean;
  /** Most recent likers (with avatar) so games can show an "Instagram-style" strip. */
  recentLikers?: { id: string; name: string; username: string; avatarUrl: string }[];
}

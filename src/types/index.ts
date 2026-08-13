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


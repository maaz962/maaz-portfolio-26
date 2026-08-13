import type { Project, ProjectFilterCategory } from "@/types";

/** Human-readable labels for project filter tabs. */
export const projectFilterLabels: Record<ProjectFilterCategory, string> = {
  web: "Web",
  react: "React",
  nextjs: "Next.js",
  php: "PHP",
  laravel: "Laravel",
  flutter: "Flutter",
  cybersecurity: "Cybersecurity",
};

/** Preferred display order for filter tabs (excluding "All"). */
export const projectFilterOrder: ProjectFilterCategory[] = [
  "web",
  "react",
  "nextjs",
  "php",
  "laravel",
  "flutter",
  "cybersecurity",
];

/**
 * Portfolio projects — sourced from verified GitHub repos and the existing
 * M44Z portfolio content. Do not add invented URLs; leave github/liveDemo
 * undefined when unverified.
 *
 * TODO: Replace placeholder visuals at /public/images/projects/{slug}.jpg
 * once real screenshots are available (Flutter To-Do, E-Commerce, Move-Go).
 */
export const projects: Project[] = [
  {
    slug: "cyber-scam-checker",
    title: "Cyber Scam Checker App",
    description:
      "Android app that checks URLs and messages for suspicious scam keywords, with clear safe vs. scam results — built for cybersecurity awareness and Android practice.",
    category: "Cybersecurity",
    technologies: ["Java", "Android", "XML"],
    categories: ["cybersecurity"],
    image:
      "https://github.com/maaz962/CyberScamCheckerApp/raw/master/1app.png",
    imageAlt:
      "Cyber Scam Checker App screenshot showing the main scam detection screen",
    github: "https://github.com/maaz962/CyberScamCheckerApp",
    featured: true,
  },
  {
    slug: "move-go",
    title: "Move-Go App",
    description:
      "Ride-hailing Flutter app for moving people or parcels — client-side flow with mapping and geocoding, inspired by inDrive-style transport apps.",
    category: "Mobile",
    technologies: ["Flutter", "Dart"],
    categories: ["flutter"],
    github: "https://github.com/maaz962/move-go-app",
  },
  {
    slug: "flutter-todo",
    title: "Flutter To-Do App",
    description:
      "Flutter mobile app for managing everyday tasks and to-do lists with a focused, lightweight interface.",
    category: "Mobile",
    technologies: ["Flutter", "Dart"],
    categories: ["flutter"],
  },
  {
    slug: "e-commerce",
    title: "E-Commerce App",
    description:
      "Full-featured online store with product browsing, admin dashboard, and PHP/MySQL backend — from the earlier M44Z portfolio build.",
    category: "Web",
    technologies: ["PHP", "MySQL", "JavaScript"],
    categories: ["web", "php"],
  },
  {
    slug: "scholarship-website",
    title: "Scholarship Website",
    description:
      "Scholarship listing and management site with search, admin panel, and assistant views — built with PHP and MySQL.",
    category: "Web",
    technologies: ["PHP", "MySQL", "HTML"],
    categories: ["web", "php"],
    github: "https://github.com/maaz962/Scholarship_website",
  },
  {
    slug: "m44z-web-dev",
    title: "M44Z Web Dev Portfolio",
    description:
      "Earlier developer portfolio showcasing projects and skills through a responsive HTML, CSS, and JavaScript site.",
    category: "Web",
    technologies: ["HTML", "CSS", "JavaScript"],
    categories: ["web"],
    github: "https://github.com/maaz962/M44Z-WEB-DEV",
    liveDemo: "https://m44z-web-dev.vercel.app",
  },
  {
    slug: "my-card-view",
    title: "My Card View",
    description:
      "Android app for presenting a digital card interface — a compact Java project built in Android Studio.",
    category: "Mobile",
    technologies: ["Java", "Android"],
    categories: [],
    github: "https://github.com/maaz962/My_Card_View",
  },
];

/** Filter tabs that have at least one matching project. */
export function getActiveProjectFilters(
  items: Project[] = projects
): ProjectFilterCategory[] {
  return projectFilterOrder.filter((key) =>
    items.some((project) => project.categories.includes(key))
  );
}

export function filterProjects(
  items: Project[],
  filter: ProjectFilterCategory | "all"
): Project[] {
  if (filter === "all") return items;
  return items.filter((project) => project.categories.includes(filter));
}

export const featuredProject =
  projects.find((project) => project.featured) ?? projects[0];

export const standardProjects = projects.filter((project) => !project.featured);

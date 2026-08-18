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
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop&q=80",
    imageAlt:
      "Cybersecurity concept representing the Cyber Scam Checker scam detection app",
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
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80",
    imageAlt:
      "Urban city view representing the Move-Go ride-hailing transport app",
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
    image:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80",
    imageAlt:
      "Checklist and notes representing the Flutter To-Do task management app",
  },
  {
    slug: "e-commerce",
    title: "E-Commerce App",
    description:
      "Full-featured online store with product browsing, admin dashboard, and PHP/MySQL backend — from the earlier M44Z portfolio build.",
    category: "Web",
    technologies: ["PHP", "MySQL", "JavaScript"],
    categories: ["web", "php"],
    image:
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop&q=80",
    imageAlt:
      "Online shopping and e-commerce representing the E-Commerce App store",
  },
  {
    slug: "scholarship-website",
    title: "Scholarship Website",
    description:
      "Scholarship listing and management site with search, admin panel, and assistant views — built with PHP and MySQL.",
    category: "Web",
    technologies: ["PHP", "MySQL", "HTML"],
    categories: ["web", "php"],
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop&q=80",
    imageAlt:
      "Graduation celebration representing the Scholarship Website for education",
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
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop&q=80",
    imageAlt:
      "Laptop with code representing the M44Z Web Dev Portfolio website",
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
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&q=80",
    imageAlt:
      "Mobile app interface representing the My Card View Android digital card app",
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

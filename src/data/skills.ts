import type { Skill, SkillCategory } from "@/types";

/** Human-readable labels for skill proficiency levels. */
export const proficiencyLabels = {
  development: "Development",
  familiar: "Familiar",
  learning: "Learning",
} as const;

/** Display order and labels for skill category groups. */
export const skillCategoryMeta: Record<
  SkillCategory,
  { label: string; description: string }
> = {
  frontend: {
    label: "Frontend",
    description: "Interfaces, layouts, and client-side logic.",
  },
  backend: {
    label: "Backend",
    description: "Server-side logic and APIs.",
  },
  database: {
    label: "Database",
    description: "Data storage and querying.",
  },
  mobile: {
    label: "Mobile",
    description: "Cross-platform mobile development.",
  },
  tools: {
    label: "Tools",
    description: "Version control and workflow.",
  },
  security: {
    label: "Cybersecurity",
    description: "Security concepts and ongoing learning.",
  },
};

export const skillCategoryOrder: SkillCategory[] = [
  "frontend",
  "backend",
  "database",
  "mobile",
  "tools",
  "security",
];

export const skills: Skill[] = [
  { name: "HTML", category: "frontend", proficiency: "development" },
  { name: "CSS", category: "frontend", proficiency: "development" },
  { name: "JavaScript", category: "frontend", proficiency: "development" },
  { name: "Bootstrap", category: "frontend", proficiency: "familiar" },
  { name: "React", category: "frontend", proficiency: "development" },
  { name: "Next.js", category: "frontend", proficiency: "development" },
  { name: "Tailwind CSS", category: "frontend", proficiency: "development" },

  { name: "PHP", category: "backend", proficiency: "development" },
  { name: "Node.js", category: "backend", proficiency: "familiar" },
  { name: "Express.js", category: "backend", proficiency: "familiar" },

  { name: "MySQL", category: "database", proficiency: "development" },
  { name: "MongoDB", category: "database", proficiency: "familiar" },

  { name: "Flutter", category: "mobile", proficiency: "development" },
  { name: "Dart", category: "mobile", proficiency: "development" },

  { name: "Git", category: "tools", proficiency: "development" },
  { name: "GitHub", category: "tools", proficiency: "development" },

  {
    name: "Cybersecurity",
    category: "security",
    proficiency: "learning",
  },
  {
    name: "Networking / security",
    category: "security",
    proficiency: "learning",
  },
];

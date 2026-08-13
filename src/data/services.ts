import { Layers, Cpu, Smartphone, Globe, Settings } from "lucide-react";
import type { Service } from "@/types";

export const services: Service[] = [
  {
    slug: "full-stack-web-dev",
    title: "Full Stack Web Development",
    description:
      "Modern, responsive web applications with client interfaces, backend APIs, and database integrations. Designed for speed, security, and scalability.",
    technologies: ["React", "Next.js", "JavaScript", "PHP", "MySQL"],
    icon: Layers,
    featured: true,
  },
  {
    slug: "react-nextjs-dev",
    title: "React / Next.js Development",
    description:
      "High-performance client-side and server-rendered web applications built with clean, component-driven layouts and smooth transitions.",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    icon: Cpu,
  },
  {
    slug: "flutter-app-dev",
    title: "Flutter Mobile Development",
    description:
      "Cross-platform mobile applications for iOS and Android with smooth, responsive interfaces and native functionality.",
    technologies: ["Flutter", "Dart"],
    icon: Smartphone,
  },
  {
    slug: "website-dev",
    title: "Website Development",
    description:
      "Responsive portfolio websites, business websites, and landing pages tailored to convey professional brand identity.",
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    icon: Globe,
  },
  {
    slug: "website-maintenance",
    title: "Website Maintenance & Management",
    description:
      "Iterative performance optimization, bug fixing, layout refinements, content updates, and continuous improvements to keep sites running smoothly.",
    technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
    icon: Settings,
  },
];

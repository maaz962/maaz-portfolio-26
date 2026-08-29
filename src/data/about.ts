/**
 * Copy and structured content for the About section.
 * Kept separate from profile.ts so hero identity stays concise.
 */
export const aboutContent = {
  intro:
    "I'm a Computer Science student who builds across web and mobile mostly with React, Next.js, and Flutter, with PHP and MySQL on the backend when a project needs it.",
  identity: {
    title: "How I work",
    body: "Full-stack minded. I like owning a feature from the UI down to the data layer, and I tend to test things until they break so they hold up better in production.",
  },
  builds: {
    title: "What I build",
    items: [
      "Web apps with React and Next.js",
      "Mobile apps with Flutter and Dart",
      "Backend APIs and sites with PHP and MySQL",
      "Freelance client work: web and mobile",
    ],
  },
  aside: {
    title: "Beyond code",
    items: [
      "Freelancer taking on web and mobile projects",
      "Taught a Basic Web Development course through the UAF Freelancing Club",
    ],
  },
  learning: {
    title: "Currently exploring",
    items: ["Cybersecurity fundamentals", "Networking and security concepts"],
  },
  focusAreas: [
    "Full Stack Development",
    "React",
    "Next.js",
    "Flutter",
    "Dart",
    "PHP",
    "MySQL",
    "JavaScript",
    "Cybersecurity learning",
  ],
} as const;

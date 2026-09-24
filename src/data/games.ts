export type GameMeta = {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  animal: string;
  color: string;
  borderColor: string;
  accentColor: string;
  comingSoon: boolean;
  /** Total number of levels shipped with this game (used for X/Y on cards). */
  totalLevels: number;
};

export const games: GameMeta[] = [
  {
    slug: "html-hero",
    title: "HTML Hero",
    description:
      "Become an HTML Master! Write real tags for headings, lists, tables, forms and full pages across easy to advanced challenges.",
    difficulty: "Beginner \u2192 Advanced",
    topics: ["HTML", "Tags", "Semantics", "Forms"],
    animal: "\uD83E\uDDD8",
    color: "from-indigo-500/20 to-violet-500/20",
    borderColor: "border-indigo-500/30",
    accentColor: "text-indigo-600 dark:text-indigo-500",
    comingSoon: false,
    totalLevels: 16,
  },
  {
    slug: "flexbox-zoo",
    title: "Flexbox Zoo",
    description:
      "Help adorable animals find their enclosures by mastering CSS Flexbox properties. Learn justify-content, align-items, flex-direction and more through fun challenges!",
    difficulty: "Beginner",
    topics: ["Flexbox", "CSS Layout", "justify-content", "align-items"],
    animal: "\uD83E\uDD81",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    accentColor: "text-green-600 dark:text-green-500",
    comingSoon: false,
    totalLevels: 15,
  },
  {
    slug: "grid-garden",
    title: "Grid Garden",
    description:
      "Build layouts and master CSS Grid. Learn grid-template-columns, grid-areas, spanning, and more through fun challenges!",
    difficulty: "Intermediate",
    topics: ["CSS Grid", "grid-template", "grid-areas", "spanning"],
    animal: "\uD83C\uDF31",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    accentColor: "text-emerald-600 dark:text-emerald-500",
    comingSoon: false,
    totalLevels: 15,
  },
  {
    slug: "js-detective",
    title: "JS Detective",
    description:
      "Solve coding mysteries and master core JavaScript! Variables, loops, arrays, functions, .map, .filter and event handlers through fun console challenges.",
    difficulty: "Beginner \u2192 Advanced",
    topics: ["JavaScript", "Variables", "Loops", "Functions"],
    animal: "\uD83D\uDD75\uFE0F",
    color: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-amber-500/30",
    accentColor: "text-amber-600 dark:text-amber-500",
    comingSoon: false,
    totalLevels: 18,
  },
  {
    slug: "animation-arena",
    title: "Animation Arena",
    description:
      "Bring robots to life with CSS transitions, transforms and keyframes. Fade, spin, float and dance your way from first steps to hover tricks!",
    difficulty: "Beginner \u2192 Intermediate",
    topics: ["Animations", "Transitions", "Transforms", "Keyframes"],
    animal: "\uD83E\uDD16",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    accentColor: "text-purple-600 dark:text-purple-500",
    comingSoon: false,
    totalLevels: 12,
  },
  {
    slug: "php-playground",
    title: "PHP Playground",
    description:
      "Type real PHP and watch it run live in your browser. Variables, loops, functions, arrays and string functions - all executed by a WebAssembly PHP engine right on the page.",
    difficulty: "Beginner \u2192 Advanced",
    topics: ["PHP", "Echo", "Variables", "Loops", "Functions", "Arrays"],
    animal: "\uD83D\uDC18",
    color: "from-violet-500/20 to-purple-600/20",
    borderColor: "border-violet-500/30",
    accentColor: "text-violet-600 dark:text-violet-500",
    comingSoon: false,
    totalLevels: 16,
  },
  {
    slug: "query-quest",
    title: "Query Quest",
    description:
      "Master SQL by querying a real in-your-browser database. SELECT, WHERE, ORDER BY, JOIN, GROUP BY and more - run against an actual SQLite engine via sql.js.",
    difficulty: "Beginner \u2192 Advanced",
    topics: ["SQL", "SELECT", "WHERE", "ORDER BY", "JOIN", "GROUP BY"],
    animal: "\uD83D\uDDC3\uFE0F",
    color: "from-sky-500/20 to-cyan-500/20",
    borderColor: "border-sky-500/30",
    accentColor: "text-sky-600 dark:text-sky-500",
    comingSoon: false,
    totalLevels: 16,
  },
];
import type { BlogPost, BlogCategory } from "@/types";

export const blogCategories: BlogCategory[] = [
  "Flutter",
  "Web Development",
  "React",
  "Next.js",
  "Cybersecurity",
];

export const blogPosts: BlogPost[] = [
  {
    slug: "building-high-performance-canvas-animations-flutter",
    title: "Building High-Performance Canvas Animations in Flutter",
    description: "Learn how to leverage CustomPainter and Canvas APIs in Flutter to build 60fps animations without dropping frames or causing memory leaks.",
    category: "Flutter",
    image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&h=600&fit=crop&q=80",
    imageAlt: "Abstract generative pattern representing high-performance canvas rendering in Flutter",
    author: {
      name: "M. Maaz Arif",
    },
    publishedDate: "Aug 18, 2026",
    readTime: "7 min read",
  },
  {
    slug: "shift-to-local-first-web-architectures",
    title: "The Shift to Local-First Web Architectures",
    description: "An in-depth exploration of CRDTs, RxDB, and WebSQL/OPFS to build modern web applications that work offline-first and sync seamlessly.",
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&q=80",
    imageAlt: "Computer screen showing code editor representing local-first web architecture",
    author: {
      name: "M. Maaz Arif",
    },
    publishedDate: "Aug 12, 2026",
    readTime: "8 min read",
  },
  {
    slug: "mastering-react-19-compiler-server-actions",
    title: "Mastering React 19 Compiler and Server Actions",
    description: "A deep dive into how the new React Compiler removes the need for useMemo/useCallback, and how to structure Server Actions securely.",
    category: "React",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop&q=80",
    imageAlt: "React logo with glowing neon abstract shapes",
    author: {
      name: "M. Maaz Arif",
    },
    publishedDate: "Aug 5, 2026",
    readTime: "6 min read",
  },
  {
    slug: "optimizing-nextjs-app-router-for-scale",
    title: "Optimizing Next.js App Router for Scale",
    description: "Practical strategies for ISR caching, streaming with suspense, and resolving route handler performance bottlenecks in production.",
    category: "Next.js",
    image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&h=600&fit=crop&q=80",
    imageAlt: "Modern server architecture representational illustration",
    author: {
      name: "M. Maaz Arif",
    },
    publishedDate: "Jul 28, 2026",
    readTime: "9 min read",
  },
  {
    slug: "securing-nextjs-api-routes-against-owasp-top-10",
    title: "Securing Next.js API Routes Against OWASP Top 10",
    description: "Common security loopholes in App Router API routes, including SSRF, IDOR, and rate limiting strategies using Upstash Redis.",
    category: "Cybersecurity",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop&q=80",
    imageAlt: "Cybersecurity visual with digital shield and locks",
    author: {
      name: "M. Maaz Arif",
    },
    publishedDate: "Jul 20, 2026",
    readTime: "10 min read",
  },
  {
    slug: "flutter-state-management-2026-bloc-riverpod-signals",
    title: "State Management in 2026: BLoC vs Riverpod vs Signals",
    description: "An unbiased comparison of state management paradigms in Flutter, focusing on memory footprint, testability, and rebuild efficiency.",
    category: "Flutter",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=600&fit=crop&q=80",
    imageAlt: "Flutter dashboard design concept",
    author: {
      name: "M. Maaz Arif",
    },
    publishedDate: "Jul 10, 2026",
    readTime: "6 min read",
  },
];

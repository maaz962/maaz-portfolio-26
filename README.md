# M. Maaz Arif — Developer Portfolio

A premium, dark-first, highly optimized developer portfolio website built with Next.js, TypeScript, and Tailwind CSS. Fully responsive, lightweight, accessible, and structured for fast page loads and custom updates.

---

## Project Overview

The website represents **M. Maaz Arif** — a computer science student and developer focused on:
- **Full Stack Web Development** (React, Next.js, JavaScript, PHP, MySQL)
- **Mobile Application Development** (Flutter, Dart)
- **Cybersecurity Learning** (Networking and security concepts)

### Design & Branding
- **Dark Theme (Default)**: A rich, technical developer atmosphere featuring a deep navy background (`#0A0A0F`), purple primary highlights (`#7C3AED`), blue support shades, and cyan accents (`#06B6D4`). Includes subtle glow animations and scanlines.
- **Light Theme**: A separate warm neutral composition ("paper" style background `#FAFAF8` and `#F2F1EE`) with high-contrast readable dark navy text and deepened purple/blue accents to meet accessibility guidelines.
- **Typography**: Uses Space Grotesk (display headers), Inter (clean body text), and JetBrains Mono (monospaced code styling), self-hosted via `@fontsource` for local font delivery.
- **Motion & Animations**: Handled via Framer Motion with standard transition speeds and fallback rules respect `prefers-reduced-motion`.

---

## Tech Stack

| Purpose | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS |
| Motion / Animations | Framer Motion |
| Icons | Lucide React |
| Font Delivery | `@fontsource` (Self-hosted css/woff2 files) |
| Class Merging | `clsx` + `tailwind-merge` |

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx         # Page wrappers, SEO metadata, ThemeProvider, no-flash scripts
│   ├── page.tsx           # Home entry point: loads sections in logical order
│   └── globals.css        # Tailwind directives, theme colors, CSS patterns/noise
│
├── components/
│   ├── layout/            # Sticky Header, Footer, Theme toggle switches
│   ├── sections/          # Content blocks: Hero, About, Skills, Education, Experience, Projects, Services, Testimonials, Contact
│   ├── ui/                # Core design cards, buttons, wrappers, and visual handlers
│   └── animations/        # Reusable reveals, staggered lists, and background backdrops
│
├── data/
│   ├── nav.ts             # Navigation link structures
│   ├── profile.ts         # Central identity (Name, Taglines, Social Row URLs)
│   ├── about.ts           # About copy & key highlights
│   ├── skills.ts          # Categorized skills list
│   ├── education.ts       # Degrees and timelines
│   ├── experience.ts      # Freelancing Club leadership records & timeline highlights
│   ├── projects.ts        # Projects data index (GitHub links, stack indicators)
│   └── services.ts        # Services data array (Full stack, React, Flutter, etc.)
│
├── lib/
│   ├── use-active-section.ts # Custom scrollspy hook with click-navigation override
│   └── utils.ts           # tailwind-merge / cn helper
│
└── types/
    └── index.ts           # Common type safety models
```

---

## Connecting a Contact Form Service

The current contact form performs strict client-side validation and generates a prefilled `mailto:` link that triggers the user's local mail editor on submit.

## AI Assistant Setup

The portfolio features a secure AI Assistant powered by Google Gemini. To enable the AI chat functionality, you must configure a Gemini API key.

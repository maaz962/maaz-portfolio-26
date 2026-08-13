# M. Maaz Arif — Developer Portfolio

A premium, dark-first, highly optimized developer portfolio website built with Next.js, TypeScript, and Tailwind CSS. Fully responsive, lightweight, accessible, and structured for fast page loads and custom updates.

---

## 1. Project Overview

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

## 2. Tech Stack

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

## 3. Folder Structure

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

## 4. Local Development

### Requirements
- Node.js `18.18` or higher (Node `20+` recommended)
- npm or yarn package manager

### Steps
1. Clone the project and install all dependencies:
   ```bash
   npm install
   ```
2. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 5. Production Build

Verify code quality, strict typing, lint rules, and compile the static bundle:
```bash
npm run build
npm run start
```
A clean build command exit verification ensures types are valid and there are no build blocks.

---

## 6. How to Edit Personal Information

The portfolio is architected to keep design and content separate. To update copy or add new items:

### Profile & Identity
- Open [**`src/data/profile.ts`**](file:///c:/Users/Ehsan%20Computers/OneDrive/Desktop/m-p-cur/maaz-portfolio/src/data/profile.ts) to edit name, tagline, email address, locations, and social profile links.

### Resume PDF
- Place the latest resume PDF file inside the public assets folder at: `public/resume/maaz-arif-resume.pdf`. The download link in the Hero and Contact sections points directly here.

### Profile Photo
- Drop the latest square profile picture at `public/images/profile.jpg` (minimum recommended resolution: `800x800px`).
- Open [**`src/components/ui/profile-photo.tsx`**](file:///c:/Users/Ehsan%20Computers/OneDrive/Desktop/m-p-cur/maaz-portfolio/src/components/ui/profile-photo.tsx) and follow the `// TODO` comment to swap out the placeholder block with the optimized `next/image` tag.

### Projects & Images
- Add or remove entries in [**`src/data/projects.ts`**](file:///c:/Users/Ehsan%20Computers/OneDrive/Desktop/m-p-cur/maaz-portfolio/src/data/projects.ts).
- For images: Save project screenshots in the `public/images/projects/` folder named by the project's slug (e.g. `public/images/projects/cyber-scam-checker.jpg`). Update the `image` path attribute in the data file. The visual wrapper handles missing assets gracefully.

### Skills & Tech List
- Customize, categorise, or reorder listed items inside [**`src/data/skills.ts`**](file:///c:/Users/Ehsan%20Computers/OneDrive/Desktop/m-p-cur/maaz-portfolio/src/data/skills.ts).

### Timeline & Education
- Edit experience timeline roles, club positions, or Kashmir walk notes in [**`src/data/experience.ts`**](file:///c:/Users/Ehsan%20Computers/OneDrive/Desktop/m-p-cur/maaz-portfolio/src/data/experience.ts).
- Edit degrees and semesters in [**`src/data/education.ts`**](file:///c:/Users/Ehsan%20Computers/OneDrive/Desktop/m-p-cur/maaz-portfolio/src/data/education.ts).

---

## 7. Connecting a Contact Form Service

The current contact form performs strict client-side validation and generates a prefilled `mailto:` link that triggers the user's local mail editor on submit.

To transition to an automated email service later:
1. In [**`src/components/sections/contact.tsx`**](file:///c:/Users/Ehsan%20Computers/OneDrive/Desktop/m-p-cur/maaz-portfolio/src/components/sections/contact.tsx), locate the `handleSubmit` event handler.
2. Replace the simulated timeout/mailto logic with a standard fetch request pointing to your Formspree/Resend endpoint:
   ```typescript
   const response = await fetch("https://formspree.io/f/YOUR_ENDPOINT_ID", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(formData),
   });
   if (response.ok) {
     setFormState("success");
   }
   ```
3. Set appropriate success visual overlays within the React state blocks.

---

## 8. AI Assistant Setup

The portfolio features a secure AI Assistant powered by Google Gemini. To enable the AI chat functionality, you must configure a Gemini API key.

### Setup Instructions
1. Obtain a free Gemini API key from the [Google AI Studio](https://aistudio.google.com/).
2. Create a local environment variable file named `.env.local` in the root of the project:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Restart the development server:
   ```bash
   npm run dev
   ```
4. **Security Notice**: Never commit `.env.local` or expose your API key in client-side code. The API key is securely loaded and called inside the Next.js API route (`src/app/api/chat/route.ts`).
5. **Quota / rate-limits**: The assistant is subject to Google's current free-tier quotas and limits. The app includes quota exceed error handling and client-side message limits to manage this gracefully.

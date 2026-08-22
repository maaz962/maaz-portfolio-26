import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { profile } from "@/data/profile";
import "./globals.css";

// Self-hosted via next/font: woff2 files are preloaded from the HTML
// (no render-blocking font CSS, no HTML → CSS → font request chain) and
// the variable axes cover every weight previously imported from @fontsource.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${profile.name} | Full Stack Developer`,
  description: `Portfolio of ${profile.name}, a Full Stack & Flutter Developer specializing in React, Next.js, Flutter, and web development. Available for freelance work and collaborations.`,
  keywords: [
    "M. Maaz Arif",
    "Maaz Arif",
    "Full Stack Developer",
    "React Developer",
    "Next.js Developer",
    "Flutter Developer",
    "Web Development",
    "Freelancer",
    "Software Engineer",
    "Lahore",
    "Pakistan",
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maaz-arif-portfolio.vercel.app", // configurable production domain
    title: `${profile.name} | Full Stack Developer`,
    description: `Portfolio of ${profile.name}, a Full Stack & Flutter Developer specializing in React, Next.js, Flutter, and web development. Available for freelance work and collaborations.`,
    siteName: `${profile.name} Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | Full Stack Developer`,
    description: `Portfolio of ${profile.name}, a Full Stack & Flutter Developer specializing in React, Next.js, Flutter, and web development. Available for freelance work and collaborations.`,
  },
};


// Runs before hydration so the correct theme class is present on first
// paint — prevents a light/dark flash regardless of stored preference.
const noFlashThemeScript = `
(function () {
  try {
    var stored = localStorage.getItem('maaz-portfolio-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <main>{children}</main>
          <Footer />
          <AIAssistant />
        </ThemeProvider>
      </body>
    </html>
  );
}

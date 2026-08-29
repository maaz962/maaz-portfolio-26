import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { AnalyticsGate } from "@/components/tracking/analytics-gate";
import { AuthProvider } from "@/lib/auth-context";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  "https://maaz-arif-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: `${profile.name} | Full Stack Developer`,
    description: `Portfolio of ${profile.name}, a Full Stack & Flutter Developer specializing in React, Next.js, Flutter, and web development. Available for freelance work and collaborations.`,
    siteName: `${profile.name} Portfolio`,
    images: [{ url: "/images/profile.jpg", width: 512, height: 512, alt: profile.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | Full Stack Developer`,
    description: `Portfolio of ${profile.name}, a Full Stack & Flutter Developer specializing in React, Next.js, Flutter, and web development. Available for freelance work and collaborations.`,
    images: ["/images/profile.jpg"],
  },
};


// Runs before hydration so the correct theme class is present on first
// paint — sets it both ways (light removes 'dark', dark adds it) to prevent
// a light/dark flash regardless of stored preference or system setting.
const noFlashThemeScript = `
(function () {
  try {
    var stored = localStorage.getItem('maaz-portfolio-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            <main>{children}</main>
            <Footer />
            <AIAssistant />
            <AnalyticsGate />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { profile } from "@/data/profile";
import "./globals.css";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <AIAssistant />
        </ThemeProvider>
      </body>
    </html>
  );
}

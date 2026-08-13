"use client";

import { ArrowUp } from "lucide-react";
import { profile, socialLinks } from "@/data/profile";
import { navLinks } from "@/data/nav";
import { Container } from "@/components/ui/container";

export function Footer() {
  const year = new Date().getFullYear();

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t border-border bg-background-secondary/20 py-12">
      <Container className="space-y-10">
        {/* Top Section: Brand & Nav Links */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
          <div className="space-y-3 max-w-sm">
            <a
              href="#top"
              className="text-mono text-sm font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
            >
              {profile.name}
              <span className="text-primary">.</span>
            </a>
            <p className="text-xs text-muted leading-relaxed">
              Full Stack Developer | React / Next.js | Flutter
            </p>
            <p className="text-xs text-muted/80 leading-relaxed">
              Building responsive codebases, performant mobile apps, and robust systems with clean engineering practices.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap gap-x-6 gap-y-2.5 max-w-md">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-muted hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Copyright, Socials & Back to Top */}
        <div className="flex flex-col gap-6 border-t border-border pt-8 items-center md:flex-row md:justify-between text-xs text-muted">
          <p className="text-mono">
            © {year} {profile.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted transition-colors hover:text-primary"
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </a>
              ))}
            </div>

            {/* Back to Top */}
            <button
              type="button"
              onClick={handleBackToTop}
              className="flex items-center gap-1 text-muted hover:text-primary transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-1"
              aria-label="Back to top"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}

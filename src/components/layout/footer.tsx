"use client";

import { ArrowUp } from "lucide-react";
import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-background-secondary/20 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 text-xs text-muted">
        <p className="text-mono">
          © {year} {profile.name}. All rights reserved.
        </p>

        <button
          type="button"
          onClick={handleBackToTop}
          className="flex items-center gap-1 text-muted hover:text-primary transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-1"
          aria-label="Back to top"
        >
          Back to top
          <ArrowUp className="h-3 w-3" strokeWidth={2} />
        </button>
      </div>
    </footer>
  );
}

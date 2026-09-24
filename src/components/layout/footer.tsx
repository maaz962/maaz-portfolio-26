"use client";

import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  // Home sections each carry their own bottom border (Section's `border-b`),
  // so the footer border-t would stack into a double line. Non-home pages
  // (games, admin) have no section borders, so they keep the top border.
  const isHomePage = pathname === "/";

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={
        isHomePage
          ? "bg-background-secondary/20 py-4"
          : "border-t border-border bg-background-secondary/20 py-4"
      }
    >
      <div className="mx-auto flex w-full max-w-content-wide items-center justify-between px-[var(--content-pad-inline)] text-xs text-muted">
        <p>
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

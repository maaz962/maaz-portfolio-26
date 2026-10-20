"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { sections } from "@/data/sections";

interface SectionPagerProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

/**
 * Prev/next arrows rendered at the end of every home section (mobile only).
 *
 * Non-technical visitors on phones scroll a single section and assume that
 * is the whole page. A large, obvious "Previous / Next" pair at the bottom
 * makes the multi-page structure self-evident and gives a zero-discovery
 * path through the whole portfolio — including the Games page from the
 * final section.
 */
export function SectionPager({ activeSection, onNavigate }: SectionPagerProps) {
  const index = sections.findIndex((s) => s.id === activeSection);
  if (index === -1) return null;

  const prev = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;

  return (
    <nav
      aria-label="Section pager"
      className="border-b border-border bg-background-secondary/20 lg:hidden"
    >
      <div className="mx-auto flex w-full max-w-content items-center gap-3 px-[var(--content-pad-inline)] py-6">
        {prev ? (
          <a
            href={`/#${prev.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(prev.id);
            }}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
            {prev.label}
          </a>
        ) : (
          <div aria-hidden="true" className="flex-1" />
        )}

        <span
          aria-hidden="true"
          className="text-mono shrink-0 text-[11px] text-muted"
        >
          {index + 1}/{sections.length}
        </span>

        {next ? (
          <a
            href={`/#${next.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(next.id);
            }}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            {next.label}
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} />
          </a>
        ) : (
          <a
            href="/games"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
          >
            Games
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} />
          </a>
        )}
      </div>
    </nav>
  );
}

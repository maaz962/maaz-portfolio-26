"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft } from "lucide-react";
import { GlassNavbar } from "@/components/layout/glass-navbar";

interface GameShellProps {
  title: string;
  tagline: string;
  icon: ReactNode;
  iconClass?: string;
  scriptSrc?: string[];
  doneCount: number;
  totalLevels: number;
  children: ReactNode;
}

/**
 * Shared chrome for every /games/[slug] page: floating navbar, "All Games"
 * back link, title header with a slim "X/Y levels" progress bar, the main
 * content container, and the game engine scripts. Pages render their own grid
 * (using .game-shell-grid/.game-shell-sidebar/.game-shell-panel) as children.
 */
export function GameShell({
  title,
  tagline,
  icon,
  iconClass = "bg-primary/10 text-primary",
  scriptSrc = [],
  doneCount,
  totalLevels,
  children,
}: GameShellProps) {
  const done = totalLevels > 0 ? Math.min(doneCount, totalLevels) : 0;
  const pct = totalLevels > 0 ? Math.round((done / totalLevels) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-background">
      <GlassNavbar activeSection="games" />

      <main
        id="main-content"
        className="main-content mx-auto w-full max-w-content-wide px-[var(--content-pad-inline)] pb-24"
      >
        <Link
          href="/games"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          All Games
        </Link>

        <header className="game-shell-header">
          <div className={`game-shell-icon ${iconClass}`}>{icon}</div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            <p className="mt-0.5 text-xs text-muted">{tagline}</p>
          </div>
          <div
            className="game-shell-progress"
            title={`${done} of ${totalLevels} levels completed`}
            aria-label={`${done} of ${totalLevels} levels completed`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">
                Progress
              </span>
              <span className="font-mono text-[0.6rem] font-semibold text-foreground">
                {done}/{totalLevels} levels
              </span>
            </div>
            <div className="game-shell-progress-track">
              <div className="game-shell-progress-bar" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </header>

        {children}
      </main>

      {scriptSrc.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
    </div>
  );
}
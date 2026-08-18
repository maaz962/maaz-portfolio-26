"use client";

import { motion } from "framer-motion";
import { navLinks } from "@/data/nav";
import { profile } from "@/data/profile";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface GlassNavbarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function GlassNavbar({ activeSection, onNavigate }: GlassNavbarProps) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
    >
      <nav
        aria-label="Primary"
        className="glass-nav flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-background/40 dark:shadow-black/20"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("top");
          }}
          className="text-mono shrink-0 px-3 py-1.5 text-sm font-medium tracking-tight text-foreground transition-colors hover:text-primary"
        >
          <span className="hidden sm:inline">{profile.name}</span>
          <span className="sm:hidden">{profile.initials}</span>
          <span className="text-primary">.</span>
        </a>

        <div className="mx-1 hidden h-4 w-px bg-border sm:block" />

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(id);
                }}
                aria-current={isActive ? "true" : undefined}
                className="relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="glass-nav-pill"
                    className="absolute inset-0 rounded-full bg-primary/15 text-primary"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-primary" : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </span>
              </a>
            );
          })}
        </div>

        <div className="mx-1 hidden h-4 w-px bg-border sm:block" />

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </nav>
    </motion.div>
  );
}

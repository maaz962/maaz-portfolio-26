"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/data/nav";
import { profile } from "@/data/profile";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface GlassNavbarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function GlassNavbar({ activeSection, onNavigate }: GlassNavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4"
    >
      <nav
        aria-label="Primary"
        className="glass-nav flex w-full max-w-[700px] items-center justify-between gap-2 rounded-2xl border border-white/10 bg-background/50 px-3 py-2 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-4 dark:border-white/10 dark:bg-background/50 dark:shadow-black/20"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("top");
          }}
          className="text-mono shrink-0 text-sm font-medium tracking-tight text-foreground transition-colors hover:text-primary"
        >
          <span className="hidden sm:inline">{profile.name}</span>
          <span className="sm:hidden">{profile.initials}</span>
          <span className="text-primary">.</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
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
                    className="absolute inset-0 rounded-full bg-primary/15"
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

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass-nav absolute left-4 right-4 top-full z-50 mt-2 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-background/80 py-3 shadow-lg shadow-black/10 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-background/80 dark:shadow-black/20"
          >
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
                    setOpen(false);
                  }}
                  className={`w-full text-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

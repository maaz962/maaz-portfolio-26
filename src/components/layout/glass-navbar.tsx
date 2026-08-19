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
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-content items-center px-6 md:px-10">
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

        <nav
          className="hidden items-center gap-7 lg:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2"
          aria-label="Primary"
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
                }}
                aria-current={isActive ? "true" : undefined}
                className="relative py-1 text-sm font-medium transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="glass-nav-pill"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </span>
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}

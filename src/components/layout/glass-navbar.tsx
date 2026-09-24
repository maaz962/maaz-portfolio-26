"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/nav";
import { profile } from "@/data/profile";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface GlassNavbarProps {
  activeSection: string;
  onNavigate?: (id: string) => void;
}

export function GlassNavbar({ activeSection, onNavigate }: GlassNavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

return (
    <header>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 z-50 flex justify-center px-4"
        style={{ top: "var(--nav-top)" }}
      >
        <nav
          aria-label="Primary"
          className="glass-nav flex h-[var(--nav-h)] w-fit max-w-[1100px] items-center justify-between gap-2 rounded-2xl border border-white/10 bg-background/70 px-2 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-3 dark:border-white/10 dark:bg-background/70 dark:shadow-black/20"
        >
          <a
            href="/#top"
            onClick={(e) => {
              if (isHomePage && onNavigate) {
                e.preventDefault();
                onNavigate("top");
              }
            }}
            className="text-mono shrink-0 pl-1 text-[15px] font-medium tracking-tight text-foreground transition-colors hover:text-primary"
          >
            <span className="hidden sm:inline">{profile.name}</span>
            <span className="sm:hidden">{profile.initials}</span>
            <span className="text-primary">.</span>
          </a>

          <div className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => {
              const isHash = link.href.includes("#");
              const id = isHash ? link.href.replace("/#", "").replace("#", "") : "";
              const isGames = link.href === "/games";
              const isActive = isGames
                ? pathname === "/games" || pathname.startsWith("/games/")
                : isHomePage && activeSection === id;

              return isGames ? (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className="relative flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-violet-600 px-4 text-[15px] font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 motion-safe:hover:-translate-y-px"
                >
                  <Gamepad2 className="h-4 w-4" strokeWidth={2} />
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (isHomePage && isHash && onNavigate) {
                      e.preventDefault();
                      onNavigate(id);
                    }
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className="relative flex h-9 items-center whitespace-nowrap rounded-full px-3 text-[15px] transition-colors"
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
                      isActive
                        ? "font-medium text-primary"
                        : "text-muted hover:text-foreground"
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground lg:hidden lg:h-9 lg:w-9"
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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
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
              className="glass-nav absolute left-4 right-4 top-full z-50 mt-2 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-background/85 py-3 shadow-lg shadow-black/10 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-background/85 dark:shadow-black/20"
            >
              {navLinks.map((link) => {
                const isHash = link.href.includes("#");
                const id = isHash ? link.href.replace("/#", "").replace("#", "") : "";
                const isGames = link.href === "/games";
                const isActive = isGames
                  ? pathname === "/games" || pathname.startsWith("/games/")
                  : isHomePage && activeSection === id;

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      if (isHomePage && isHash && onNavigate) {
                        e.preventDefault();
                        onNavigate(id);
                      }
                      setOpen(false);
                    }}
                    className={`flex min-h-11 w-full items-center justify-center rounded-full px-5 text-[15px] transition-colors ${
                      isGames
                        ? "bg-gradient-to-r from-primary to-violet-600 font-semibold text-white shadow-lg shadow-primary/25"
                        : isActive
                          ? "bg-primary/15 font-medium text-primary"
                          : "font-medium text-muted hover:text-foreground"
                    }`}
                  >
                    {isGames && <Gamepad2 className="mr-2 h-4 w-4" strokeWidth={2} />}
                    {link.label}
                  </a>
                );
              })}
            </motion.nav>
          )}
</AnimatePresence>
      </motion.div>
    </header>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Gamepad2, Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/nav";
import { profile } from "@/data/profile";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useTheme } from "@/components/layout/theme-provider";
import { buttonStyles } from "@/components/ui/button";

interface GlassNavbarProps {
  activeSection: string;
  onNavigate?: (id: string) => void;
}

const sheetMainLinks = [
  { label: "Home", id: "top" },
  { label: "Work", id: "projects" },
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
] as const;

const sheetAboutSubLinks = [
  { label: "Skills", id: "skills" },
  { label: "Education", id: "education" },
  { label: "Experience", id: "experience" },
] as const;

export function GlassNavbar({ activeSection, onNavigate }: GlassNavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      document.body.style.overflow = "hidden";
      const frame = requestAnimationFrame(() => {
        sheetRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
    document.body.style.overflow = "";
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      hamburgerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeMenu]);

  const handleSheetNavigate = (id: string) => {
    if (isHomePage && onNavigate) onNavigate(id);
    closeMenu();
  };

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
        className="fixed inset-x-0 top-0 z-50 flex justify-center lg:top-[var(--nav-top)] lg:px-4"
      >
        <nav
          aria-label="Primary"
          className="glass-nav flex h-[var(--nav-h)] w-full items-center justify-between gap-1.5 rounded-none border-b border-border bg-background/70 px-4 shadow-lg shadow-black/10 backdrop-blur-xl dark:bg-background/70 dark:shadow-black/20 lg:w-fit lg:max-w-[1100px] lg:rounded-2xl lg:border lg:border-white/10 lg:px-3 lg:dark:border-white/10"
        >
          <a
            href="/#top"
            onClick={(e) => {
              if (isHomePage && onNavigate) {
                e.preventDefault();
                onNavigate("top");
              }
            }}
            className="text-mono shrink-0 text-[15px] font-medium tracking-tight text-foreground transition-colors hover:text-primary lg:pl-1"
          >
            {profile.name}
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
                  className="relative flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110 motion-safe:hover:-translate-y-px"
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
                  className="relative flex h-9 items-center whitespace-nowrap rounded-full px-2.5 text-sm transition-colors"
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
            <span className="hidden lg:block">
              <ThemeToggle />
            </span>
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav-menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-sheet"
            ref={sheetRef}
            id="mobile-nav-menu"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-background outline-none lg:hidden"
          >
            <div className="h-[var(--nav-h)] shrink-0" aria-hidden />

            <nav
              aria-label="Mobile"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              <ul className="shrink-0 px-6">
                {sheetMainLinks.map((link) => {
                  const isActive = isHomePage && activeSection === link.id;

                  return (
                    <li key={link.id} className="border-b border-border">
                      <a
                        href={`/#${link.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSheetNavigate(link.id);
                        }}
                        aria-current={isActive ? "true" : undefined}
                        className={`font-display flex min-h-14 w-full items-center text-[25px] font-semibold tracking-tight transition-colors ${
                          isActive ? "text-accent" : "text-foreground hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </a>

                      {link.id === "about" && (
                        <div className="flex flex-wrap gap-x-5 pb-3 pl-1">
                          {sheetAboutSubLinks.map((sub) => (
                            <a
                              key={sub.id}
                              href={`/#${sub.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSheetNavigate(sub.id);
                              }}
                              className="flex min-h-11 items-center text-sm text-muted transition-colors hover:text-foreground"
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto shrink-0 space-y-3 px-6 py-6">
                <a
                  href="/#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSheetNavigate("contact");
                  }}
                  className={buttonStyles({ size: "lg" }) + " w-full"}
                >
                  Hire me
                </a>
                <a
                  href="/games"
                  onClick={closeMenu}
                  className={buttonStyles({ variant: "outline", size: "lg" }) + " w-full"}
                >
                  <Gamepad2 className="h-4 w-4" strokeWidth={1.75} />
                  Learn Games
                </a>
                <SheetThemeToggle />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function SheetThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme"}
      className="flex min-h-11 w-full items-center justify-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <Sun className="h-4 w-4" strokeWidth={1.75} />
      )}
      {mounted ? (theme === "dark" ? "Dark mode" : "Light mode") : "Theme"}
    </button>
  );
}

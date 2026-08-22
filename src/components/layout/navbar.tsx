"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/data/nav";
import { profile } from "@/data/profile";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useActiveSection } from "@/lib/use-active-section";

const sectionIds = navLinks.map((link) => link.href.replace("#", ""));

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { activeId, setActiveImmediately } = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () =>
      setScrolled((prev) => {
        const next = window.scrollY > 12;
        return prev === next ? prev : next;
      });
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        scrolled
          ? "border-border bg-background/95"
          : "border-border/60 bg-background/70"
      }`}
    >
      <Container>
        <div className="relative flex h-16 items-center">
          <a
            href="#top"
            onClick={() => setActiveImmediately("top")}
            className="text-mono shrink-0 text-sm font-medium tracking-tight text-foreground"
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
              const isActive = activeId === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveImmediately(id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative py-1 text-sm transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {isActive ? (
                    <motion.span
                      layoutId="navbar-active-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  ) : null}
                </a>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.nav
            key="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full border-t border-border bg-background shadow-card lg:hidden"
          >
            <Container className="flex flex-col items-center gap-1 py-3">
              {navLinks.map((link) => {
                const id = link.href.replace("#", "");
                const isActive = activeId === id;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setActiveImmediately(id);
                      setOpen(false);
                    }}
                    className={`rounded-lg px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-background-secondary text-foreground"
                        : "text-muted hover:bg-background-secondary hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </Container>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

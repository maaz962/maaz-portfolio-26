"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Code2,
  EllipsisVertical,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  House,
  Mail,
  Moon,
  Sun,
  User,
  Wrench,
  Briefcase,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Bottom tab bar — the mobile navigation for the home section viewer.
 *
 * The top navbar is hidden below lg on this page (its links were buried
 * behind a hamburger that non-technical visitors never opened), so this dock
 * is the primary mobile nav: main destinations are one tap away, and a
 * "More" sheet holds the remaining sections (Education, Experience,
 * Services), the Games page and the theme toggle.
 *
 * Mount it from SectionViewer only: display-hidden on lg+ where the full
 * top navbar is visible, and never rendered on /games or /admin.
 */
const dockItems = [
  { id: "top", label: "Home", icon: House },
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "contact", label: "Contact", icon: Mail },
] as const;

const moreItems = [
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "services", label: "Services", icon: Wrench },
] as const;

interface MobileSectionDockProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function MobileSectionDock({
  activeSection,
  onNavigate,
}: MobileSectionDockProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();

  const navigate = (id: string) => {
    setMoreOpen(false);
    onNavigate(id);
  };

  return (
    <nav
      aria-label="Section dock"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="relative mx-auto w-full max-w-md">
        <AnimatePresence>
          {moreOpen && (
            <motion.div
              key="more-sheet"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="glass-nav absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-2xl border border-white/10 bg-background/95 py-1.5 shadow-lg shadow-black/15 backdrop-blur-xl dark:border-white/10 dark:bg-background/95"
            >
              {moreItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 px-4 text-sm transition-colors",
                      isActive
                        ? "bg-primary/15 font-semibold text-primary"
                        : "font-medium text-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {item.label}
                  </button>
                );
              })}

              <a
                href="/games"
                className="flex min-h-11 w-full items-center gap-3 px-4 text-sm font-semibold text-muted transition-colors hover:text-foreground"
              >
                <Gamepad2
                  className="h-4 w-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                />
                Learn Games
              </a>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  mounted
                    ? `Switch to ${theme === "dark" ? "light" : "dark"} mode`
                    : "Toggle theme"
                }
                className="mt-1.5 flex min-h-11 w-full items-center gap-3 border-t border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mounted ? theme : "theme"}
                    initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    {theme === "dark" ? (
                      <Moon className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Sun className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </motion.span>
                </AnimatePresence>
                {mounted
                  ? theme === "dark"
                    ? "Dark mode"
                    : "Light mode"
                  : "Theme"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-nav flex items-stretch justify-between gap-0.5 rounded-2xl border border-white/10 bg-background/90 p-1.5 shadow-lg shadow-black/15 backdrop-blur-xl dark:border-white/10 dark:bg-background/90">
          {dockItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Icon
                  className="h-[1.15rem] w-[1.15rem]"
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-label={moreOpen ? "Close more menu" : "Open more menu"}
            aria-expanded={moreOpen}
            className="flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-muted transition-colors hover:text-foreground"
          >
            <EllipsisVertical
              className="h-[1.15rem] w-[1.15rem]"
              strokeWidth={1.75}
            />
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

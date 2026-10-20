"use client";

import {
  Code2,
  FolderKanban,
  Gamepad2,
  House,
  Mail,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mobile-only bottom tab bar for the home section viewer.
 *
 * The floating top navbar hides its links behind a hamburger on small
 * screens, which non-technical visitors rarely open — they just scroll the
 * single visible section and leave. This dock keeps the main destinations
 * permanently visible (native app pattern) so exploration is one tap away.
 *
 * Mount it from SectionViewer only: it is display-hidden on lg+ where the
 * full top navbar is visible, and it never renders on /games or /admin.
 */
const dockItems = [
  { id: "top", label: "Home", icon: House },
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "contact", label: "Contact", icon: Mail },
] as const;

interface MobileSectionDockProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function MobileSectionDock({
  activeSection,
  onNavigate,
}: MobileSectionDockProps) {
  return (
    <nav
      aria-label="Section dock"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="glass-nav mx-auto flex w-full max-w-md items-stretch justify-between gap-0.5 rounded-2xl border border-white/10 bg-background/90 p-1.5 shadow-lg shadow-black/15 backdrop-blur-xl dark:border-white/10 dark:bg-background/90">
        {dockItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
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

        <a
          href="/games"
          className="flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-muted transition-colors hover:text-foreground"
        >
          <Gamepad2 className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
          <span className="text-[10px] font-medium leading-none">Games</span>
        </a>
      </div>
    </nav>
  );
}

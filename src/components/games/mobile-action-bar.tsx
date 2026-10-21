"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";

const ACTIONS: { id: string; label: string; short: string; icon: typeof Play; cls: string }[] = [
  { id: "run-btn", label: "Run code", short: "Run", icon: Play, cls: "run" },
  { id: "check-btn", label: "Check solution", short: "Check", icon: Check, cls: "check" },
  { id: "prev-btn", label: "Previous level", short: "Prev", icon: ChevronLeft, cls: "nav" },
  { id: "next-btn", label: "Next level", short: "Next", icon: ChevronRight, cls: "nav" },
];

export function MobileActionBar() {
  /*
   * The bar only makes sense once the in-card buttons exist (the game grid
   * mounts after the auth gate clears and the engine scripts load). Without
   * this guard it floated over the sign-in screen with dead buttons.
   */
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (document.getElementById("run-btn")) {
      setAvailable(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.getElementById("run-btn")) {
        setAvailable(true);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!available) return null;

  return (
    <nav className="game-shell-mobile-bar" aria-label="Level actions">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.id}
            type="button"
            className={"game-shell-mobile-bar-btn " + a.cls}
            aria-label={a.label}
            title={a.label}
            onClick={() => {
              const target = document.getElementById(a.id) as HTMLButtonElement | null;
              if (target && !target.disabled) target.click();
            }}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{a.short}</span>
          </button>
        );
      })}
    </nav>
  );
}

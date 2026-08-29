"use client";

import { useEffect } from "react";

interface Options {
  /** Game slug used for the progress API calls. */
  slug: string;
  /** Only run when the user is logged in. */
  enabled: boolean;
  /** window key of the engine's init function, e.g. "__initHtmlHero". */
  initKey: string;
  /** window key of the engine's resume function, e.g. "__resumeHtmlHero". */
  resumeKey: string;
  /** window key the engine calls with progress events, e.g. "__onHtmlHeroProgress". */
  emitterKey: string;
}

/**
 * Boots a game engine once the logged-in user can play: initialises it,
 * loads any saved progress (GET /api/games/progress?slug=...) and resumes
 * where they left off, then pipes the engine's progress events into a
 * debounced POST so each visit continues from the last saved state.
 */
export function useGameProgress({
  slug,
  enabled,
  initKey,
  resumeKey,
  emitterKey,
}: Options) {
  useEffect(() => {
    if (!enabled) return;

    const w = window as any;
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let lastEvent: any = null;

    const flushSave = () => {
      if (!lastEvent) return;
      const evt = lastEvent;
      lastEvent = null;
      fetch("/api/games/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          currentLevel: evt.currentLevel,
          score: evt.score,
          completed: evt.completed,
          totalLevels: evt.totalLevels,
        }),
      }).catch(() => {});
    };

    const tryBoot = () => {
      if (typeof w[initKey] !== "function") {
        retry = setTimeout(tryBoot, 100);
        return;
      }

      // Binds engine listeners and renders level 0.
      w[initKey]();

      // Load saved progress and resume where the user left off.
      fetch(`/api/games/progress?slug=${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          const p = d?.progress;
          if (p && typeof p === "object" && typeof w[resumeKey] === "function") {
            w[resumeKey](p);
          }
        })
        .catch(() => {});

      // Engine -> React progress events, debounced into one POST per burst.
      w[emitterKey] = (evt: any) => {
        if (!evt || cancelled) return;
        lastEvent = evt;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(flushSave, 600);
      };
    };

    tryBoot();

    return () => {
      cancelled = true;
      clearTimeout(retry);
      clearTimeout(saveTimer);
      flushSave();
      if (w[emitterKey]) w[emitterKey] = undefined;
    };
  }, [enabled, slug, initKey, resumeKey, emitterKey]);
}
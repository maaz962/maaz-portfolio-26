import { useCallback, useEffect, useRef, useState } from "react";

// Height of the sticky navbar (h-16 = 64px). Content behind this is
// visually covered, so it's excluded from "how much of this section is
// actually visible" calculations below.
const NAVBAR_HEIGHT = 64;

/**
 * Tracks which of the given section ids is currently active, for subtle
 * active-link highlighting in the navbar.
 *
 * Two things make this trickier than a typical scrollspy:
 *
 * 1. Short/adjacent sections: picking "whichever section fills the most
 *    visible space" (excluding the area hidden behind the sticky navbar)
 *    handles short trailing sections and the bottom of the page correctly,
 *    but a section that was just scrolled to via a nav click can still
 *    lose that comparison to whatever spills into view right below it —
 *    especially right after the scroll lands, before the user has looked
 *    around. A fixed "trust the click for N ms" timeout is fragile here:
 *    too short and it expires mid-scroll, too long and it can also expire
 *    while the user is still looking at what they clicked.
 *
 * 2. Clicking a link for a short trailing section can clamp to the exact
 *    same scroll position as the next section (nothing left to scroll),
 *    making them geometrically indistinguishable once settled.
 *
 * The fix used here: a nav click sets the active id and marks it as
 * "authoritative" — automatic geometry-based recalculation is skipped
 * entirely until the user actually scrolls again themselves (wheel,
 * touch, or a scroll-relevant key press). Programmatic/anchor-triggered
 * scroll events from the click itself don't count, so the section the
 * user chose stays highlighted for as long as they're looking at it.
 */
export function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const manualOverrideRef = useRef(false);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    let ticking = false;

    const compute = () => {
      ticking = false;
      if (manualOverrideRef.current) return;

      const viewportBottom = window.innerHeight;
      let bestId = elements[0]?.id ?? null;
      let bestVisible = -1;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const visible =
          Math.min(rect.bottom, viewportBottom) -
          Math.max(rect.top, NAVBAR_HEIGHT);

        // ">=" so that, among ties (e.g. two short sections both fully
        // visible when scroll is clamped at the bottom), the later,
        // further-scrolled-to section wins.
        if (visible >= bestVisible) {
          bestVisible = visible;
          bestId = el.id;
        }
      }

      setActiveId(bestId);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(compute);
      }
    };

    // A genuine user-initiated scroll gesture releases the manual
    // override so automatic detection resumes.
    const releaseOverride = () => {
      manualOverrideRef.current = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(
          e.key
        )
      ) {
        releaseOverride();
      }
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", releaseOverride, { passive: true });
    window.addEventListener("touchmove", releaseOverride, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", releaseOverride);
      window.removeEventListener("touchmove", releaseOverride);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [ids]);

  const setActiveImmediately = useCallback((id: string) => {
    setActiveId(id);
    manualOverrideRef.current = true;
  }, []);

  return { activeId, setActiveImmediately };
}

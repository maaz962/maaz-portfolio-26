"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassNavbar } from "@/components/layout/glass-navbar";
import { MobileSectionDock } from "@/components/layout/mobile-section-dock";
import { SectionPager } from "@/components/layout/section-pager";
import { SectionNavigationContext } from "@/components/layout/section-navigation-context";
import { sectionIds, type SectionId } from "@/data/sections";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export function SectionViewer({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<SectionId>("top");
  const mainRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback((id: string) => {
    const sectionId = sectionIds.includes(id as SectionId)
      ? (id as SectionId)
      : "top";
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (sectionIds.includes(hash as SectionId)) {
        setActiveSection(hash as SectionId);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  /*
   * The mobile section dock occupies the bottom of the viewport on this
   * page only, so lift the AI assistant FAB clear of it via a CSS custom
   * property (read by ai-assistant.tsx). Removed again on lg+ and on
   * unmount so /games and /admin keep the original FAB position.
   */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const root = document.documentElement;

    const apply = () => {
      if (mq.matches) {
        root.style.setProperty("--ai-fab-bottom", "5.75rem");
      } else {
        root.style.removeProperty("--ai-fab-bottom");
      }
    };

    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      root.style.removeProperty("--ai-fab-bottom");
    };
  }, []);

  const sections = Array.isArray(children) ? children : [children];

  const sectionMap: Record<string, React.ReactNode> = {};
  sectionIds.forEach((id, index) => {
    sectionMap[id] = sections[index] ?? null;
  });

  return (
    <>
      <GlassNavbar activeSection={activeSection} onNavigate={handleNavigate} />
      <SectionNavigationContext.Provider value={handleNavigate}>
        <main
          id="main-content"
          ref={mainRef}
          className="main-content pb-24 lg:pb-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {sectionMap[activeSection] ?? null}
              <SectionPager
                activeSection={activeSection}
                onNavigate={handleNavigate}
              />
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileSectionDock
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
      </SectionNavigationContext.Provider>
    </>
  );
}

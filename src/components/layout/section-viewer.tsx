"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassNavbar } from "@/components/layout/glass-navbar";

const sectionIds = [
  "top",
  "about",
  "skills",
  "education",
  "experience",
  "projects",
  "services",
  "testimonials",
  "contact",
] as const;

type SectionId = (typeof sectionIds)[number];

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

  const sections = Array.isArray(children) ? children : [children];

  const sectionMap: Record<string, React.ReactNode> = {};
  sectionIds.forEach((id, index) => {
    sectionMap[id] = sections[index] ?? null;
  });

  return (
    <>
      <GlassNavbar activeSection={activeSection} onNavigate={handleNavigate} />
      <main ref={mainRef} className="pt-20 sm:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {sectionMap[activeSection] ?? null}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProjectFilterCategory } from "@/types";
import {
  featuredProject,
  filterProjects,
  getActiveProjectFilters,
  projectFilterLabels,
  standardProjects,
} from "@/data/projects";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/ui/project-card";
import { FadeIn } from "@/components/animations/fade-in";
import { cn } from "@/lib/utils";

type ActiveFilter = "all" | ProjectFilterCategory;

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export function Projects() {
  const filterOptions = useMemo(() => getActiveProjectFilters(), []);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const filteredProjects = useMemo(() => {
    const filtered = filterProjects(standardProjects, activeFilter);
    return filtered;
  }, [activeFilter]);

  const showFeatured = Boolean(
    featuredProject &&
      (activeFilter === "all" ||
        featuredProject.categories.includes(activeFilter))
  );

  return (
    <section
      id="projects"
      className="scroll-mt-20 border-b border-border bg-noise relative overflow-hidden py-24"
    >
      <div
        aria-hidden
        className="glow-orb -right-20 top-10 h-56 w-56 bg-primary/15"
      />

      <Container className="relative">
        <FadeIn>
          <SectionHeading
            eyebrow="Selected work"
            title="Projects"
            description="Real applications and builds across mobile, web, and security — filter by stack to see what matches."
          />
        </FadeIn>

        <FadeIn delay={0.05}>
          <div
            className="mt-10 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter projects by technology"
          >
            <FilterTab
              label="All"
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            />
            {filterOptions.map((filter) => (
              <FilterTab
                key={filter}
                label={projectFilterLabels[filter]}
                active={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              />
            ))}
          </div>
        </FadeIn>

        <div className="mt-12 space-y-10">
          <AnimatePresence mode="wait">
            {showFeatured && featuredProject ? (
              <motion.div
                key={`featured-${activeFilter}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard project={featuredProject} featured />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              role="tabpanel"
              aria-live="polite"
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <motion.div
                    key={project.slug}
                    variants={cardVariants}
                    layout
                    className="h-full"
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))
              ) : (
                <motion.p
                  variants={cardVariants}
                  className="col-span-full rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted"
                >
                  No projects match this filter yet.
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "text-mono rounded-full border px-4 py-2 text-xs transition-all duration-200 focus-visible:outline-none",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-card text-muted hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

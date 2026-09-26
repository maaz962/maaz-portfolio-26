"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
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
import { Section } from "@/components/ui/section";
import { SectionGlow } from "@/components/ui/section-glow";
import { ProjectCard } from "@/components/ui/project-card";
import { Chip } from "@/components/ui/chip";
import { buttonStyles } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { games } from "@/data/games";
import { GAME_LOGO_SRC } from "@/components/games/game-preview";
import Image from "next/image";
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
    <Section
      id="projects"
      aria-label="Projects"
      className="bg-noise relative overflow-hidden"
    >
      <SectionGlow
        primaryClassName="-right-20 top-10 h-56 w-56 bg-primary/15"
        accentClassName="-left-24 bottom-8 h-48 w-48 bg-accent/10"
      />

      <Container className="relative">
        <FadeIn>
          <SectionHeading
            eyebrow="Selected work"
            title="Projects"
            description="Real applications and builds across mobile, web, and security, filter by stack to see what matches."
          />
        </FadeIn>

        <FadeIn delay={0.05}>
          <div
            className="mt-14 flex flex-wrap gap-2"
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
              aria-live="polite"
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
                  className="col-span-full rounded-2xl border border-dashed border-border px-6 py-10 text-center text-[15px] text-muted"
                >
                  No projects match this filter yet.
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <FadeIn delay={0.05}>
          <GamesTeaserCard />
        </FadeIn>
      </Container>
    </Section>
  );
}

const gameTileStyles: Record<string, string> = {
  "html-hero":
    "border-orange-500/30 bg-orange-500/10 hover:border-orange-400/60 hover:bg-orange-500/15",
  "flexbox-zoo":
    "border-sky-500/30 bg-sky-500/10 hover:border-sky-400/60 hover:bg-sky-500/15",
  "grid-garden":
    "border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400/60 hover:bg-cyan-500/15",
  "js-detective":
    "border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-400/60 hover:bg-yellow-500/15",
  "animation-arena":
    "border-purple-500/30 bg-purple-500/10 hover:border-purple-400/60 hover:bg-purple-500/15",
  "php-playground":
    "border-violet-500/30 bg-violet-500/10 hover:border-violet-400/60 hover:bg-violet-500/15",
  "query-quest":
    "border-blue-500/30 bg-blue-500/10 hover:border-blue-400/60 hover:bg-blue-500/15",
};

function GamesTeaserCard() {
  const tiles = [
    ...games.map((game) => ({
      key: game.slug,
      title: game.title,
      logo: GAME_LOGO_SRC[game.slug],
      styles: gameTileStyles[game.slug] ?? "",
    })),
    {
      key: "coming-soon",
      title: "More games coming soon",
      logo: null,
      styles:
        "border-dashed border-border bg-background-secondary/60 hover:border-primary/50",
    },
  ];

  return (
    <Link
      href="/games"
      className="group mt-14 flex flex-col gap-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-glow sm:p-6 lg:p-8"
    >
      <div
        aria-hidden="true"
        className="mx-auto grid w-full max-w-xs grid-cols-4 gap-3 px-6 pt-6 sm:p-0"
      >
        {tiles.map((tile) => (
          <span
            key={tile.key}
            title={tile.title}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5",
              tile.styles
            )}
          >
            {tile.logo ? (
              <Image
                src={tile.logo}
                alt=""
                width={40}
                height={40}
                className="h-[52%] w-[52%] object-contain drop-shadow-sm"
              />
            ) : (
              <Sparkles
                aria-hidden="true"
                className="h-5 w-5 text-muted"
                strokeWidth={1.75}
              />
            )}
          </span>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pb-6 text-center sm:p-0">
        <Chip variant="primary">Games</Chip>
        <h3 className="mt-4 text-xl text-foreground">
          Learn Web Dev by Playing
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Interactive games teaching HTML, CSS, JavaScript, PHP &amp; SQL —
          built from scratch. Solve coding puzzles, earn XP, and level up while
          exploring web development hands-on.
        </p>
        <ul
          className="mt-5 flex flex-wrap justify-center gap-2"
          aria-label="Technologies used"
        >
          {["HTML", "CSS", "JavaScript", "PHP", "SQL"].map((tech) => (
            <li key={tech}>
              <Chip>{tech}</Chip>
            </li>
          ))}
        </ul>
        <span
          className={buttonStyles({
            variant: "primary",
            size: "sm",
            className: "mt-6",
          })}
        >
          Explore Games
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
    </Link>
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
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-xs transition-all duration-200 focus-visible:outline-none",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-card text-muted hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

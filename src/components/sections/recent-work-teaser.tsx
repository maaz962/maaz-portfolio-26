"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { projects } from "@/data/projects";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { useSectionNavigation } from "@/components/layout/section-navigation-context";

const teaserProjects = projects.slice(0, 2);

/**
 * Mobile-only "Recent work" teaser shown under the hero (below lg). Reuses the
 * first two entries from src/data/projects.ts. Images use explicit width/height
 * with a sizes attribute; the first card is the mobile LCP element so it loads
 * eager with priority, the second stays lazy. Missing screenshots fall back to
 * a neutral placeholder.
 */
export function RecentWorkTeaser() {
  const navigate = useSectionNavigation();
  const prefersReducedMotion = useReducedMotion();

  const goToProjects = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate("projects");
  };

  return (
    <div className="border-t border-border lg:hidden">
      <Container className="py-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-[22px] text-foreground">Recent work</h2>
          <a
            href="#projects"
            onClick={goToProjects}
            className="flex min-h-11 items-center text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            See all
            <ArrowRight className="ml-1 h-4 w-4" strokeWidth={1.75} />
          </a>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {teaserProjects.map((project, index) => (
            <motion.a
              key={project.slug}
              href="#projects"
              onClick={goToProjects}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.25,
                delay: prefersReducedMotion ? 0 : index * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block"
            >
              {project.image ? (
                <div className="relative h-[120px] w-full overflow-hidden rounded-xl bg-background-secondary">
                  <Image
                    src={project.image}
                    alt={project.imageAlt ?? `${project.title} project preview`}
                    width={800}
                    height={600}
                    priority={index === 0}
                    sizes="(max-width: 480px) calc(100vw - 2rem), (max-width: 1024px) 50vw, 0px"
                    className={cn(
                      "transition-transform duration-500",
                      project.imageFit === "contain"
                        ? "object-contain"
                        : "object-cover object-top"
                    )}
                  />
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-[120px] w-full items-center justify-center rounded-xl bg-background-secondary"
                >
                  <span className="text-mono text-sm text-muted">No preview</span>
                </div>
              )}

              <h3 className="mt-3 text-base font-bold text-foreground">
                {project.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-sm text-muted">
                {project.description}
              </p>
            </motion.a>
          ))}
        </div>
      </Container>
    </div>
  );
}

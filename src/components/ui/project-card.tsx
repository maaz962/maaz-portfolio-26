import { ExternalLink, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { buttonStyles } from "@/components/ui/button";
import { ProjectVisual } from "@/components/ui/project-visual";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  className?: string;
}

export function ProjectCard({
  project,
  featured = false,
  className,
}: ProjectCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-glow",
        featured && "lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch",
        className
      )}
    >
      <ProjectVisual
        project={project}
        priority={featured}
        className={cn(
          "aspect-[16/10] w-full",
          featured && "lg:aspect-auto lg:min-h-[22rem]"
        )}
        sizes={
          featured
            ? "(max-width: 1024px) 100vw, 55vw"
            : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
      />

      <div className={cn("flex flex-1 flex-col p-6", featured && "lg:p-8")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-mono rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-primary">
            {project.category}
          </span>
          {featured ? (
            <span className="text-mono rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-accent">
              Featured
            </span>
          ) : null}
        </div>

        <h3
          className={cn(
            "mt-4 text-foreground",
            featured ? "text-2xl md:text-3xl" : "text-xl"
          )}
        >
          {project.title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {project.description}
        </p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies used">
          {project.technologies.map((tech) => (
            <li
              key={tech}
              className="text-mono rounded-full border border-border bg-background-secondary px-2.5 py-1 text-[0.65rem] text-foreground/85"
            >
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonStyles({ variant: "outline", size: "sm" })}
              aria-label={`View ${project.title} on GitHub`}
            >
              <Github className="h-4 w-4" strokeWidth={1.75} />
              GitHub
            </a>
          ) : (
            <span
              className={buttonStyles({
                variant: "outline",
                size: "sm",
                className: "cursor-not-allowed opacity-50",
              })}
              aria-disabled="true"
            >
              <Github className="h-4 w-4" strokeWidth={1.75} />
              GitHub soon
            </span>
          )}

          {project.liveDemo ? (
            <a
              href={project.liveDemo}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonStyles({ size: "sm" })}
              aria-label={`Open live demo for ${project.title}`}
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
              Live Demo
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

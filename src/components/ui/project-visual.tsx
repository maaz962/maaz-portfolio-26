import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectVisualProps {
  project: Project;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

/**
 * Renders a real screenshot when available; otherwise a neutral placeholder
 * that clearly marks where a project image should be added later.
 *
 * TODO: Drop final screenshots at public/images/projects/{slug}.jpg and set
 * the `image` field in src/data/projects.ts for each project.
 */
export function ProjectVisual({
  project,
  priority = false,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: ProjectVisualProps) {
  if (project.image) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-background-secondary",
          className
        )}
      >
        <Image
          src={project.image}
          alt={project.imageAlt ?? `${project.title} project preview`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden border border-dashed border-border bg-background-secondary p-6 text-center",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-grid opacity-30"
      />
      <p className="text-mono text-xs uppercase tracking-widest text-primary">
        {project.category}
      </p>
      <p className="mt-3 max-w-[16rem] text-sm text-foreground">
        {project.title}
      </p>
      <p className="text-mono mt-4 text-[0.65rem] text-muted">
        {"// screenshot pending — add at public/images/projects/"}
        {project.slug}
        {".jpg"}
      </p>
    </div>
  );
}

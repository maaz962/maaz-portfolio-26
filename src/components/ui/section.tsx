import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "id"> {
  id: string;
}

/**
 * Shared section shell: one border/bottom-divider, one consistent
 * vertical rhythm (tokenized via --section-pad-block), and an
 * anchorable id. Decorative content and the Container go inside.
 */
export function Section({ id, className, children, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "border-b border-border py-[var(--section-pad-block)]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
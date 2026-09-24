import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * Consistent section header used to open each portfolio section:
 * a mono "eyebrow" label, a display-font title, and optional supporting copy.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p className="text-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(2.25rem,3.5vw,2.5rem)] text-foreground">{title}</h2>
      {description ? (
        <p className="mt-4 text-balance leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ChipVariant = "neutral" | "primary" | "accent";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

const variantStyles: Record<ChipVariant, string> = {
  neutral: "border-border bg-background-secondary text-foreground/85",
  primary: "border-primary/25 bg-primary/10 text-primary",
  accent: "border-accent/30 bg-accent/10 text-accent",
};

/**
 * Shared rounded tag/badge chip. Body font by design — mono is reserved
 * for code, inline code, kbd, and eyebrow labels only.
 */
export function Chip({ variant = "neutral", className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs leading-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
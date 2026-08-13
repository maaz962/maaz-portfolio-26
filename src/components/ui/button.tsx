import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-glow hover:brightness-110",
  outline:
    "border border-border text-foreground hover:border-primary/60 hover:text-primary",
  ghost: "text-foreground/80 hover:text-primary",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

/**
 * Shared visual styles for anything that should look like a button —
 * including <a> tags used as call-to-actions, which must never be nested
 * inside a real <button>. Use this for links; use <Button> for actions.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );
}

/**
 * Shared style for small circular icon-only links (GitHub, LinkedIn, etc).
 * Matches the visual language already used by ThemeToggle.
 */
export function iconLinkStyles(className?: string) {
  return cn(
    "flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:border-primary/60 hover:text-primary",
    className
  );
}

/**
 * Base button used across the site for in-page actions. For navigation
 * links styled as buttons, use `buttonStyles()` on an <a> instead.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

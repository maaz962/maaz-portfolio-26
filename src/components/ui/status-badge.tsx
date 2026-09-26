import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  className?: string;
}

/**
 * Small availability/status pill with a subtle "live" ping dot. Quiet on
 * purpose — reserved for top-of-page and contact contexts only.
 */
export function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary px-3 py-1 text-xs text-muted",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          aria-hidden="true"
          className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60"
        />
        <span
          aria-hidden="true"
          className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"
        />
      </span>
      {label}
    </div>
  );
}
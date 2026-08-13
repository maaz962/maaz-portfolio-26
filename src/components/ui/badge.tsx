import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-mono inline-flex items-center rounded-full border border-border bg-background-secondary px-3 py-1 text-xs text-muted",
        className
      )}
      {...props}
    />
  );
}

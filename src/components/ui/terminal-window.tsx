import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TerminalWindowProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

/**
 * Restrained "terminal chrome" wrapper — the recurring visual motif that
 * ties the cybersecurity/full-stack code language together across the
 * site (e.g. framing a code snippet, a stats readout, or a command list).
 * Not meant to be used everywhere; reach for it deliberately.
 */
export function TerminalWindow({
  title = "maaz@portfolio",
  className,
  children,
  ...props
}: TerminalWindowProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background-secondary shadow-card",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        <span className="text-mono ml-2 text-xs text-muted">{title}</span>
      </div>
      <div className="text-mono px-5 py-4 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </div>
  );
}

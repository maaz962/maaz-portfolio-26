import { cn } from "@/lib/utils";

interface SectionGlowProps {
  primaryClassName?: string;
  accentClassName?: string;
}

export function SectionGlow({ primaryClassName, accentClassName }: SectionGlowProps) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "glow-orb -left-24 top-10 h-64 w-64 bg-primary/15",
          primaryClassName
        )}
      />
      <div
        aria-hidden
        className={cn(
          "glow-orb -right-16 bottom-0 h-48 w-48 bg-accent/10",
          accentClassName
        )}
      />
    </>
  );
}
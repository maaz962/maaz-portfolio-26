"use client";

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted/60">{label}</p>
      <p className="text-xs text-foreground/80 font-mono break-all">{value}</p>
    </div>
  );
}

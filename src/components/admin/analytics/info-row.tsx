"use client";

export interface InfoRowProps {
  label: string;
  value: string;
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="text-mono text-sm break-all text-foreground/80">{value}</p>
    </div>
  );
}

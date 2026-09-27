"use client";

export function BarChart({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate text-xs text-muted">{d.label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-background-secondary h-2">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="text-mono text-xs text-muted/60 w-6 text-right">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

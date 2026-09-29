"use client";

export interface BarChartProps {
  title: string;
  data: { label: string; value: number }[];
}

export function BarChart({ title, data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-base font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3" title={`${d.label}: ${d.value}`}>
            <span className="w-28 shrink-0 truncate text-sm text-muted">{d.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-background-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="text-mono w-8 shrink-0 text-right text-sm text-muted">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

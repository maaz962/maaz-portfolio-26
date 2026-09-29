"use client";

export function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">{label}</span>
      </div>
      <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

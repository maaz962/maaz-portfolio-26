"use client";

import { useId, useState } from "react";
import { TrendingUp } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import type { GrowthPoint } from "@/types/tracking";

/**
 * Dependency-free line/area chart for the growth panels.
 *
 * A charting library would be a large dependency for two series and one axis.
 * The SVG scales with its container via `viewBox`, keeps the data readable as
 * a screen-reader table, and exposes exact values on hover/focus rather than
 * relying on the eye to read a line.
 */

const WIDTH = 720;
const HEIGHT = 250;
const PAD = { top: 18, right: 18, bottom: 32, left: 38 } as const;

export function GrowthChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: GrowthPoint[];
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => Math.max(d.visits, d.signups)));
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const x = (index: number) => PAD.left + index * step;
  const y = (value: number) => PAD.top + (1 - value / max) * plotHeight;

  const line = (metric: "visits" | "signups") =>
    data.map((point, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(point[metric]).toFixed(1)}`).join(" ");

  const area = `${line("visits")} L ${x(Math.max(0, data.length - 1)).toFixed(1)} ${PAD.top + plotHeight} L ${PAD.left} ${PAD.top + plotHeight} Z`;

  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  const activePoint = active !== null ? data[active] : null;

  return (
    <AdminCard as="section" className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} />
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Visits
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> Signups
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No growth data yet.</p>
      ) : (
        <>
          <div className="relative mt-4 w-full">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full overflow-visible"
              role="img"
              aria-label={`${title}: visits and signups over the last ${data.length} periods`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0, 0.5, 1].map((ratio) => {
                const gy = PAD.top + ratio * plotHeight;
                return (
                  <g key={ratio}>
                    <line
                      x1={PAD.left}
                      x2={WIDTH - PAD.right}
                      y1={gy}
                      y2={gy}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      strokeDasharray={ratio === 1 ? undefined : "4 5"}
                    />
                    <text
                      x={PAD.left - 8}
                      y={gy + 4}
                      textAnchor="end"
                      className="fill-[hsl(var(--muted))] text-[10px]"
                    >
                      {Math.round(max * (1 - ratio))}
                    </text>
                  </g>
                );
              })}

              <path d={area} fill={`url(#area-${id})`} />
              <path
                d={line("visits")}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={line("signups")}
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />

              {data.map((point, i) => (
                <g key={point.key}>
                  {(i % labelEvery === 0 || i === data.length - 1) && (
                    <text
                      x={x(i)}
                      y={HEIGHT - 8}
                      textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                      className="fill-[hsl(var(--muted))] text-[10px]"
                    >
                      {point.label}
                    </text>
                  )}
                  <circle
                    cx={x(i)}
                    cy={y(point.visits)}
                    r={active === i ? 5 : 3}
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Wider invisible target so touch and keyboard can inspect a point. */}
                  <rect
                    x={x(i) - step / 2}
                    y={PAD.top}
                    width={Math.max(step, 8)}
                    height={plotHeight}
                    fill="transparent"
                    tabIndex={0}
                    role="button"
                    aria-label={`${point.label}: ${point.visits} visits, ${point.signups} signups`}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                  />
                </g>
              ))}
            </svg>

            {activePoint && (
              <div
                className="pointer-events-none absolute -top-1 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-card"
                style={{
                  left: `${Math.min(88, Math.max(4, ((active ?? 0) / Math.max(1, data.length - 1)) * 100))}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <p className="font-semibold text-foreground">{activePoint.label}</p>
                <p className="text-muted">
                  {activePoint.visits} visits · {activePoint.signups} signups
                </p>
              </div>
            )}
          </div>

          <table className="sr-only">
            <caption>{title}</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Visits</th>
                <th scope="col">Signups</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.key}>
                  <th scope="row">{point.label}</th>
                  <td>{point.visits}</td>
                  <td>{point.signups}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </AdminCard>
  );
}

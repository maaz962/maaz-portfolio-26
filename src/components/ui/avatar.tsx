"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const PALETTES: [string, string][] = [
  ["#6366f1", "#a855f7"], // indigo -> violet
  ["#22d3ee", "#3b82f6"], // cyan -> blue
  ["#34d399", "#06b6d4"], // emerald -> teal
  ["#f97316", "#ef4444"], // orange -> red
  ["#8b5cf6", "#ec4899"], // violet -> pink
  ["#f59e0b", "#f43f5e"], // amber -> rose
  ["#2dd4bf", "#6366f1"], // teal -> indigo
  ["#14b8a6", "#22c55e"], // teal -> green
  ["#0ea5e9", "#8b5cf6"], // sky -> violet
  ["#f43f5e", "#f59e0b"], // rose -> amber
];

function hashStr(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]);
  const joined = parts.slice(0, 2).join("");
  return (joined || "?").toUpperCase();
}

export interface AvatarProps {
  seed: string;
  name: string;
  className?: string;
}

export function Avatar({ seed, name, className }: AvatarProps) {
  const uid = useId().replace(/[:]/g, "");
  const h = hashStr(seed || name || "?");
  const [c1, c2] = PALETTES[h % PALETTES.length] ?? ["#6366f1", "#a855f7"];
  const initials = initialsOf(name);

  // deterministic decorative element positions
  const ringCx = 34 + (h % 28);
  const ringCy = 24 + ((h >> 3) % 22);
  const ringR = 14 + ((h >> 6) % 12);
  const dotCx = 70 + ((h >> 9) % 20);
  const dotCy = 68 + ((h >> 12) % 22);
  const dotR = 6 + ((h >> 15) % 8);

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("block overflow-hidden rounded-full", className)}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`hl-${uid}`} cx="0.32" cy="0.25" r="1.1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill={`url(#g-${uid})`} />
      <circle cx="50" cy="50" r="50" fill={`url(#hl-${uid})`} />

      <circle
        cx={ringCx}
        cy={ringCy}
        r={ringR}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.22"
        strokeWidth="3"
      />
      <circle cx={dotCx} cy={dotCy} r={dotR} fill="#ffffff" fillOpacity="0.25" />

      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontSize="38"
        fontWeight="800"
        fill="#ffffff"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        letterSpacing="1.5"
      >
        {initials}
      </text>
    </svg>
  );
}

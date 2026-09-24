"use client";

import { useEffect, useRef } from "react";

interface LineNumbersProps {
  forId: string;
  className?: string;
  minLines?: number;
  maxLines?: number;
}

/**
 * Live line-number gutter for the engine-driven textarea editors.
 * Stays in sync with the textarea value (including programmatic changes
 * made by the game engines on level load) and vertical scroll.
 * When the textarea also has the `.game-shell-currentline` class, it sets
 * `--current-line-top` / `--line-height-px` so CSS can tint the active line.
 */
export function LineNumbers({
  forId,
  className,
  minLines = 4,
  maxLines = 60,
}: LineNumbersProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const ta = document.getElementById(forId) as HTMLTextAreaElement | null;
    if (!el || !ta) return;

    let lastLen = -1;
    let lhPx = 22;

    const measure = () => {
      const cs = getComputedStyle(ta);
      const fontSize = parseFloat(cs.fontSize) || 14;
      const lh = cs.lineHeight;
      lhPx = lh === "normal" ? Math.round(fontSize * 1.6) : parseFloat(lh) || fontSize * 1.6;
    };

    const paintActiveLine = () => {
      if (!ta.classList.contains("game-shell-currentline")) return;
      const before = ta.value.slice(0, ta.selectionStart ?? 0);
      const line = Math.max(before.split("\n").length, 1);
      const padTop = parseFloat(getComputedStyle(ta).paddingTop) || 0;
      ta.style.setProperty("--line-height-px", `${lhPx}px`);
      ta.style.setProperty("--current-line-top", `${Math.round(padTop + (line - 1) * lhPx)}px`);
    };

    const update = () => {
      if (!el || !ta) return;
      if (ta.value.length !== lastLen) {
        lastLen = ta.value.length;
        const count = Math.max(ta.value.split("\n").length || 1, minLines);
        const n = Math.min(count, maxLines);
        let html = "";
        for (let i = 1; i <= n; i++) html += i + (i < n ? "<br />" : "");
        el.innerHTML = html;
      }
      el.scrollTop = ta.scrollTop;
      paintActiveLine();
    };

    const syncScroll = () => {
      if (el && ta) el.scrollTop = ta.scrollTop;
    };
    const onNav = () => {
      measure();
      update();
    };

    measure();
    update();
    ta.addEventListener("input", update);
    ta.addEventListener("keyup", paintActiveLine);
    ta.addEventListener("click", paintActiveLine);
    ta.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", onNav);
    const poll = window.setInterval(update, 300);

    return () => {
      window.clearInterval(poll);
      window.removeEventListener("resize", onNav);
      ta.removeEventListener("input", update);
      ta.removeEventListener("keyup", paintActiveLine);
      ta.removeEventListener("click", paintActiveLine);
      ta.removeEventListener("scroll", syncScroll);
    };
  }, [forId, minLines, maxLines]);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
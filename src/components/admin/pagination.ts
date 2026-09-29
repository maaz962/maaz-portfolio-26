/**
 * Pure pagination maths, kept out of the table component so the window
 * logic can be reasoned about (and tested) without rendering anything.
 */

export const DEFAULT_PAGE_SIZES = [25, 50, 100] as const;

/**
 * Page numbers for the numbered controls: always shows the first and last page
 * and collapses the run in between to a single ellipsis.
 */
export function pageWindow(current: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const pages = new Set<number>([1, pageCount, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }
  return out;
}

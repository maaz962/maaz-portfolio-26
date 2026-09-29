"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { DEFAULT_PAGE_SIZES, pageWindow } from "./pagination";

export type SortDirection = "asc" | "desc";

export interface AdminSort {
  key: string;
  direction: SortDirection;
}

export interface AdminColumn<T> {
  key: string;
  header: ReactNode;
  /** Cell classes. Applies to the header too; use `text-right` for numeric columns. */
  className?: string;
  /** Makes the header a sort toggle. Omit for static columns. */
  sortable?: boolean;
  /** Direction used the first time this column becomes the sort key. */
  defaultDirection?: SortDirection;
  /** Drop the column below this breakpoint so narrow screens stay readable. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
  render: (row: T) => ReactNode;
}

const HIDE_BELOW: Record<NonNullable<AdminColumn<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

function cellClasses<T>(column: AdminColumn<T>, base: string) {
  return cn(base, column.hideBelow && HIDE_BELOW[column.hideBelow], column.className);
}

/**
 * Generic sortable table for admin lists.
 *
 * Built as one primitive rather than per-page markup because Users, Leaderboard
 * and Logs all need the same thing: a header row, sortable columns, a loading
 * shape and an empty slot, and each of them reinventing it is how the styling
 * drifts apart.
 */
export function AdminTable<T>({
  columns,
  rows,
  getRowKey,
  sort,
  onSortChange,
  empty,
  emptyColSpan,
  loading = false,
  caption,
  rowHref,
}: {
  columns: AdminColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  sort: AdminSort | null;
  onSortChange: (next: AdminSort) => void;
  /** Rendered in place of the body when `rows` is empty. */
  empty: ReactNode;
  emptyColSpan: number;
  loading?: boolean;
  caption: string;
  /**
   * Makes the whole row a link target by stretching the first cell's link over
   * it. The row stays a real `<tr>` and the link a real `<a>`, so keyboard
   * order and the browser's "open in new tab" both behave normally.
   */
  rowHref?: (row: T) => string;
}) {
  const toggle = (column: AdminColumn<T>) => {
    if (!column.sortable) return;
    onSortChange(
      sort?.key === column.key
        ? { key: column.key, direction: sort.direction === "asc" ? "desc" : "asc" }
        : { key: column.key, direction: column.defaultDirection ?? "asc" }
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => {
                const active = sort?.key === column.key;
                const sorted = active ? sort.direction : null;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : column.sortable
                            ? "none"
                            : undefined
                    }
                    className={cellClasses(
                      column,
                      "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted"
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggle(column)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded transition-colors hover:text-foreground",
                          active && "text-primary hover:text-primary"
                        )}
                      >
                        {column.header}
                        {sorted === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : sorted === "desc" ? (
                          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" strokeWidth={2} />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading && rows.length === 0 ? (
              <AdminTableSkeleton columns={columns} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={emptyColSpan} className="p-5">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row)}
                  className={cn(
                    "border-b border-border last:border-b-0 transition-colors hover:bg-background-secondary/30",
                    rowHref && "relative"
                  )}
                >
                  {columns.map((column, columnIndex) => (
                    <td key={column.key} className={cellClasses(column, "px-4 py-3 align-middle")}>
                      {rowHref && columnIndex === 0 ? (
                        <Link
                          href={rowHref(row)}
                          className="after:absolute after:inset-0 after:content-['']"
                        >
                          {column.render(row)}
                        </Link>
                      ) : (
                        column.render(row)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Placeholder rows that keep the table's height stable while loading. */
function AdminTableSkeleton<T>({ columns, rows = 8 }: { columns: AdminColumn<T>[]; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-b border-border last:border-b-0">
          {columns.map((column, j) => (
            <td key={column.key} className={cellClasses(column, "px-4 py-3")}>
              <Skeleton
                className={cn(
                  "h-4",
                  // Vary the widths so the block reads as content, not a ruler.
                  j === 0 ? "w-32" : j % 2 === 0 ? "w-20" : "w-24"
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export { DEFAULT_PAGE_SIZES };

export function AdminPagination({
  page,
  pageCount,
  pageSize,
  total,
  itemNoun = "rows",
  onPageChange,
  onPageSizeChange,
  pageSizes = DEFAULT_PAGE_SIZES,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  itemNoun?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizes?: readonly number[];
}) {
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Showing <span className="text-foreground">{first}</span>–
        <span className="text-foreground">{last}</span> of{" "}
        <span className="text-foreground">{total}</span> {itemNoun}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-muted">
          Per page
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-primary/60"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        {pageCount > 1 && (
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <PageButton
              label="Previous page"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </PageButton>

            {pageWindow(page, pageCount).map((entry, i) =>
              entry === "gap" ? (
                <span key={`gap-${i}`} className="px-1.5 text-sm text-muted">
                  …
                </span>
              ) : (
                <PageButton
                  key={entry}
                  label={`Page ${entry}`}
                  current={entry === page}
                  onClick={() => onPageChange(entry)}
                >
                  {entry}
                </PageButton>
              )
            )}

            <PageButton
              label="Next page"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </PageButton>
          </nav>
        )}
      </div>
    </div>
  );
}

function PageButton({
  children,
  label,
  current = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  label: string;
  current?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
        current
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted hover:border-primary/60 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

import { cn } from "@/lib/utils";

/**
 * The admin panel's one card recipe.
 *
 * Before this existed the same `rounded-2xl border border-border bg-card p-5`
 * string was copy-pasted into a dozen panels, and the copies had already begun
 * to drift (some padded, some not; some with `overflow-hidden`, some without).
 * Routing every panel through a single component is what makes "consistent"
 * enforceable rather than aspirational.
 *
 * Variants stay explicit via `className` rather than a growing set of props:
 * the danger zone reddens the border, `EmptyState` dashes it, and dialogs and
 * the login screen deliberately sit outside the panel chrome.
 */
export interface AdminCardProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * `section` for top-level panels, so they land in the accessibility tree as
   * labelled regions. `div` is the default because most cards are grid cells
   * whose heading is not a section label.
   */
  as?: "div" | "section";
  /** Set false for cards whose content should reach the card edge (tables). */
  padded?: boolean;
}

export function AdminCard({
  as: Tag = "div",
  padded = true,
  className,
  children,
  ...rest
}: AdminCardProps) {
  return (
    <Tag className={cn("rounded-2xl border border-border bg-card", padded && "p-5", className)} {...rest}>
      {children}
    </Tag>
  );
}

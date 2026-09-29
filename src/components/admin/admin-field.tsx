import { cn } from "@/lib/utils";

/**
 * Shared form-field recipes for the admin panel.
 *
 * Every control used to spell its own `h-11 rounded-xl border border-border …`
 * string inline, and they had drifted: the search boxes on Leaderboard/Logs/
 * Users each had a copy that happened to match, the Danger Zone and XP panel
 * used `px-3.5` where the search boxes used `pl-10 pr-10`, and the login page
 * had left `bg-background-secondary` and `py-2.5` behind from before the
 * dashboard was restyled. Same-looking controls, three different recipes.
 *
 * These are class strings rather than a component on purpose. They compose
 * with `cn()` at the call site, so a field can still add its own width or
 * invalid state without a wrapper component having to forward half a dozen
 * props to get there.
 */

const FIELD_BASE =
  "w-full rounded-xl border bg-card text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary/60";

/**
 * A single-line text field, input or textarea.
 *
 * `size` follows the shared `Button` scale so a field lines up with a control
 * beside it: `sm` for inline table chrome, `md` for page-level forms.
 */
export function adminFieldStyles({
  size = "md",
  className,
}: { size?: "sm" | "md"; className?: string } = {}) {
  return cn(
    FIELD_BASE,
    size === "sm" ? "h-9 px-2.5" : "h-11 px-3.5",
    className
  );
}

/**
 * A field with a leading icon and/or a trailing clear affordance, so the
 * placeholder text is not sitting underneath the icon.
 */
export function adminSearchStyles({ className }: { className?: string } = {}) {
  return cn(adminFieldStyles({ className: cn("pl-10 pr-10", className) }));
}

/** A `<select>`, sized to sit next to a field of the same `size`. */
export function adminSelectStyles({
  size = "md",
  className,
}: { size?: "sm" | "md"; className?: string } = {}) {
  return cn(
    "rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:border-primary/60",
    size === "sm" ? "h-9 px-2" : "h-11 px-3",
    className
  );
}

/**
 * Form labels. `text-sm font-medium` is the size the rest of the admin panel
 * settled on; the login page was the last holdout, still using
 * `text-[0.65rem] uppercase tracking-wider`, which made its two labels the
 * smallest text in the panel. These replaced that.
 */
export function adminLabelStyles({ className }: { className?: string } = {}) {
  return cn("mb-1.5 block text-sm font-medium text-foreground", className);
}

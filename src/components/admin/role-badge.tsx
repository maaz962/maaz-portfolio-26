import { cn } from "@/lib/utils";
import {
  ROLE_BADGE_STYLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/lib/roles";
import type { UserRole } from "@/types";

/** Consistent role pill for the sidebar, tables and the user detail header. */
export function RoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  return (
    <span
      title={ROLE_DESCRIPTIONS[role]}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        ROLE_BADGE_STYLES[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

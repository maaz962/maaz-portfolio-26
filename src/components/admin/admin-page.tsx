"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Shared page shell for every `/admin` route.
 *
 * Owning the container here (rather than repeating it per page) is what keeps
 * the width and vertical rhythm identical across Overview, Users, Leaderboard
 * and Logs as those routes land — `max-w-content` is the same token the public
 * site uses, so no admin page ends up wider or narrower for no reason.
 */
export function AdminPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-content space-y-5">{children}</div>
    </div>
  );
}

export interface AdminPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Buttons, filters or counts rendered on the trailing edge. */
  actions?: ReactNode;
}

export function AdminPageHeader({ icon: Icon, title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

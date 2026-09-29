"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { adminNavItems } from "./admin-nav";
import { ConfirmDialog, useConfirmDialog } from "./confirm-dialog";

const STORAGE_KEY = "mp_admin_sidebar_collapsed";

/** Widths for the desktop rail. Expanded shows labels, collapsed is icon-only. */
const WIDTH_EXPANDED = "w-64";
const WIDTH_COLLAPSED = "w-[4.5rem]";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Desktop collapse is a persisted preference; the mobile drawer is not,
  // since it is transient UI state that should always start closed.
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Restore the persisted rail state after hydration, then follow the OS
  // preference on a first visit.
  useEffect(() => {
    let next = false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      next =
        stored === "1" ||
        (stored === null && window.innerWidth < 1280 && window.innerWidth >= 1024);
    } catch {}
    setCollapsed(next);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  // Close the drawer on navigation so a tap on a nav item does not leave the
  // overlay covering the page it just navigated to.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer overlay is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  /**
   * Logging out is reversible and the session is not data anyone would miss,
   * but it is still the one control in this panel that can interrupt whatever
   * the admin was mid-way through. It asks rather than firing.
   */
  const { confirm, dialogProps: logoutDialog } = useConfirmDialog();

  const askLogout = () => {
    confirm({
      title: "Log out of the admin panel?",
      description:
        "You will be sent back to the sign-in page. Anything you have typed but not saved will be lost.",
      confirmLabel: "Log out",
      onConfirm: handleLogout,
    });
  };

  const railWidth = collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;

  return (
    <div className="min-h-screen bg-background">
      {/* ---------- Mobile top bar (< lg) ---------- */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:border-primary/60 hover:text-primary"
        >
          <Menu className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <span className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4 w-4" strokeWidth={1.75} />
          </span>
          Admin
        </span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* ---------- Desktop sidebar (>= lg) ---------- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card lg:flex",
          "transition-[width] duration-200 ease-out",
          railWidth
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {!collapsed && (
            <span className="flex min-w-0 items-center gap-2.5 font-display text-sm font-semibold text-foreground">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="truncate">Admin</span>
            </span>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/60 hover:text-primary",
              collapsed && "absolute left-1/2 top-4 -translate-x-1/2"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>

        <AdminNav pathname={pathname} collapsed={collapsed} onNavigate={() => {}} />

        <AdminSidebarFooter collapsed={collapsed} onLogout={askLogout} user={user} />
      </aside>

      {/* ---------- Mobile drawer (< lg) ---------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-foreground/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-border bg-card shadow-card">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
              <span className="flex min-w-0 items-center gap-2.5 font-display text-sm font-semibold text-foreground">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Shield className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="truncate">Admin</span>
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/60 hover:text-primary"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <AdminNav pathname={pathname} collapsed={false} onNavigate={() => setDrawerOpen(false)} />

            <AdminSidebarFooter collapsed={false} onLogout={askLogout} user={user} />
          </div>
        </div>
      )}

      {/* ---------- Page content ---------- */}
      <div className={cn("transition-[padding] duration-200 ease-out", "lg:pl-64", collapsed && "lg:pl-[4.5rem]")}>
        {children}
      </div>

      {logoutDialog && <ConfirmDialog {...logoutDialog} />}
    </div>
  );
}

/**
 * Exact-prefix matching, not equality: `/admin/users/abc` must keep "Users"
 * highlighted once the per-user detail route lands.
 */
function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNav({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin sections">
      <ul className="space-y-1">
        {adminNavItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
                  collapsed ? "h-10 justify-center px-0" : "px-3 py-2.5",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-background-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AdminSidebarFooter({
  collapsed,
  onLogout,
  user,
}: {
  collapsed: boolean;
  onLogout: () => void;
  user: { name: string; username: string } | null;
}) {
  return (
    <div className="shrink-0 space-y-1 border-t border-border p-3">
      {!collapsed && user && (
        <p className="truncate px-3 pb-1 pt-1 text-xs text-muted">
          Signed in as <span className="text-foreground">@{user.username}</span>
        </p>
      )}

      {collapsed ? (
        <div className="flex items-center justify-center gap-1">
          <IconAction label="View public site" href="/">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </IconAction>
          <ThemeToggle />
          <IconAction label="Log out" onClick={onLogout} danger>
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </IconAction>
        </div>
      ) : (
        <div className="space-y-1">
          <FooterLink href="/" icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.75} />}>
            View public site
          </FooterLink>
          <FooterLink href="#" icon={<ThemeToggle />}>
            Toggle theme
          </FooterLink>
          <FooterLink
            href="#"
            icon={<LogOut className="h-4 w-4" strokeWidth={1.75} />}
            onClick={onLogout}
            danger
          >
            Log out
          </FooterLink>
        </div>
      )}
    </div>
  );
}

function IconAction({
  label,
  href,
  onClick,
  danger,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const className = cn(
    "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
    danger
      ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
      : "border-border text-foreground/80 hover:border-primary/60 hover:text-primary"
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={className}>
      {children}
    </button>
  );
}

function FooterLink({
  href,
  icon,
  children,
  onClick,
  danger,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  const className = cn(
    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    danger
      ? "text-red-500 hover:bg-red-500/10"
      : "text-muted hover:bg-background-secondary hover:text-foreground"
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{children}</span>
      </button>
    );
  }
  return (
    <Link href={href} className={className}>
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{children}</span>
    </Link>
  );
}

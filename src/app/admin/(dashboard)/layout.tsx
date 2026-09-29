import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Admin shell for the signed-in area (the `(dashboard)` route group).
 *
 * This layout only arranges chrome; it deliberately does NOT gate access.
 * `/admin/login` sits outside this group, and the middleware + each page's
 * `getAdminUser()` check are what actually protect the area -- adding a second
 * gate here would make `/admin/login` unreachable if it were ever nested.
 *
 * No public site chrome (Footer / AIAssistant / AnalyticsGate) is mounted:
 * those live in `app/(site)/layout.tsx`, which this route tree is not part of.
 */
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}

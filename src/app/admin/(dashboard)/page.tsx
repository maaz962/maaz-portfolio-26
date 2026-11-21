import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { can } from "@/lib/roles";
import { DashboardView } from "@/components/admin/analytics/dashboard-view";

export const metadata = {
  title: "Overview | Admin",
};

export default async function AdminDashboardPage() {
  // Server-side authorization: a valid admin role is required.
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login?from=/admin");
  if (!can(actor.role, "dashboard:view")) redirect("/admin/login?from=/admin");

  return <DashboardView />;
}

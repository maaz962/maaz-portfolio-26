import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { DashboardView } from "@/components/admin/analytics/dashboard-view";

export const metadata = {
  title: "Overview | Admin",
};

export default async function AdminDashboardPage() {
  // Server-side authorization: only admins can reach this page.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?from=/admin");

  return <DashboardView />;
}

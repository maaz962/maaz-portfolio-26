import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { AnalyticsClient } from "./analytics-client";

export const metadata = {
  title: "Analytics Dashboard | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  // Server-side authorization: only admins can reach this page.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?from=/admin");

  return <AnalyticsClient />;
}

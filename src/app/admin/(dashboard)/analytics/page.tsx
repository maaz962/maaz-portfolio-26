import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { can } from "@/lib/roles";
import { AnalyticsView } from "@/components/admin/analytics/analytics-view";

export const metadata = {
  title: "Analytics | Admin",
};

export default async function AdminAnalyticsPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login?from=/admin/analytics");
  if (!can(actor.role, "analytics:view")) redirect("/admin");

  return <AnalyticsView />;
}

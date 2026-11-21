import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { can } from "@/lib/roles";
import { LogsView } from "@/components/admin/logs/logs-view";

export const metadata = {
  title: "Visitor Logs | Admin",
};

export default async function AdminLogsPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login?from=/admin/logs");
  if (!can(actor.role, "logs:view")) redirect("/admin");

  return <LogsView actorRole={actor.role} />;
}

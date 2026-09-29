import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { LogsView } from "@/components/admin/logs/logs-view";

export const metadata = {
  title: "Visitor Logs | Admin",
};

export default async function AdminLogsPage() {
  // Server-side authorization: only admins can reach this page.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?from=/admin/logs");

  return <LogsView />;
}

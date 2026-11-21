import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { can } from "@/lib/roles";
import { LeaderboardView } from "@/components/admin/leaderboard/leaderboard-view";

export const metadata = {
  title: "Leaderboard | Admin",
};

export default async function AdminLeaderboardPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login?from=/admin/leaderboard");
  if (!can(actor.role, "leaderboard:view")) redirect("/admin");

  return <LeaderboardView />;
}

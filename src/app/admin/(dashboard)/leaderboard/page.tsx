import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { LeaderboardView } from "@/components/admin/leaderboard/leaderboard-view";

export const metadata = {
  title: "Leaderboard | Admin",
};

export default async function AdminLeaderboardPage() {
  // Server-side authorization: only admins can reach this page.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?from=/admin/leaderboard");

  return <LeaderboardView />;
}

import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { UsersView } from "@/components/admin/users/users-view";

export const metadata = {
  title: "Users | Admin",
};

export default async function AdminUsersPage() {
  // Server-side authorization: only admins can reach this page.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?from=/admin/users");

  return <UsersView />;
}

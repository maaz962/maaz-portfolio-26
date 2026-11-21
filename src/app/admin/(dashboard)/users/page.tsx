import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { can } from "@/lib/roles";
import { UsersView } from "@/components/admin/users/users-view";

export const metadata = {
  title: "Users | Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { undo?: string };
}) {
  // Server-side authorization: a valid admin role is required.
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login?from=/admin/users");
  if (!can(actor.role, "users:view")) redirect("/admin");

  return <UsersView actorRole={actor.role} undoId={searchParams?.undo} />;
}

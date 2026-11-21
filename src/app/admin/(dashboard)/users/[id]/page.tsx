import { redirect } from "next/navigation";
import { getAdminActor } from "@/lib/auth";
import { can } from "@/lib/roles";
import { UserDetailView } from "@/components/admin/users/user-detail-view";

export const metadata = {
  title: "User | Admin",
};

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  // Server-side authorization: the dynamic segment goes in `from` so a
  // signed-out admin returns here after signing back in.
  const actor = await getAdminActor();
  const from = `/admin/users/${params.id}`;
  if (!actor) redirect(`/admin/login?from=${encodeURIComponent(from)}`);
  if (!can(actor.role, "users:view")) redirect("/admin");

  return (
    <UserDetailView
      userId={params.id}
      actorId={actor.user.id}
      actorRole={actor.role}
    />
  );
}

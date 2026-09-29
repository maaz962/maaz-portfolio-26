import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { UserDetailView } from "@/components/admin/users/user-detail-view";

export const metadata = {
  title: "User | Admin",
};

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  // Server-side authorization: only admins can reach this page. The dynamic
  // segment goes in the `from` value so a signed-out admin returns here.
  const admin = await getAdminUser();
  if (!admin) redirect(`/admin/login?from=${encodeURIComponent(`/admin/users/${params.id}`)}`);

  return <UserDetailView userId={params.id} />;
}

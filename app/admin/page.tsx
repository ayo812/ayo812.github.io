import { AdminDashboard } from "@/components/admin-page";
import { repository } from "@/lib/repository";

export default async function AdminPage() {
  const data = await repository.getAdminDashboard();
  return <AdminDashboard data={data} />;
}


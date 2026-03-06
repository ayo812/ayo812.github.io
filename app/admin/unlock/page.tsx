import { AdminUnlock } from "@/components/admin-unlock";
import { getIdentity } from "@/lib/identity";

export default async function AdminUnlockPage() {
  const identity = await getIdentity();
  const adminEmailsConfigured = Boolean(process.env.SCAVENG_ADMIN_EMAILS?.trim());
  return <AdminUnlock identity={identity} adminEmailsConfigured={adminEmailsConfigured} />;
}
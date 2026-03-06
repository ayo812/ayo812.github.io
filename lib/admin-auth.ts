import { type User } from "@supabase/supabase-js";

function configuredAdminEmails() {
  return (process.env.SCAVENG_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }
  return configuredAdminEmails().includes(email.trim().toLowerCase());
}

export function userHasAdminAccess(user: User | null | undefined) {
  if (!user) {
    return false;
  }

  const appMetadata = user.app_metadata as Record<string, unknown> | undefined;
  const role = typeof appMetadata?.role === "string" ? appMetadata.role : undefined;
  const isAdminFlag = appMetadata?.is_admin === true;
  return isAdminFlag || role === "admin" || isAdminEmail(user.email);
}
import { AuthCard } from "@/components/auth-card";
import { type PlayerIdentity } from "@/lib/types";

export function AdminUnlock({ identity, adminEmailsConfigured }: { identity: PlayerIdentity; adminEmailsConfigured: boolean }) {
  return (
    <div className="page shell">
      <div className="empty-slab empty-slab--centered">
        <h1 className="lb-title">Admin access</h1>
        <p className="lb-sub">Admin routes now require a Supabase sign-in whose email is allowlisted via `SCAVENG_ADMIN_EMAILS`, or a Supabase user with `app_metadata.role=admin`.</p>
        <AuthCard identity={identity} next="/admin" />
        <p className="admin-message">
          {adminEmailsConfigured
            ? "If you are signed in and still blocked, confirm your email is included in SCAVENG_ADMIN_EMAILS."
            : "Set SCAVENG_ADMIN_EMAILS to a comma-separated admin allowlist before expecting admin access to work."}
        </p>
      </div>
    </div>
  );
}
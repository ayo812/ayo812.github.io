import { AuthCard } from "@/components/auth-card";
import { formatFriendlyDate } from "@/lib/time";
import { type HistoryEntry, type PlayerIdentity } from "@/lib/types";

export function HistoryPage({ identity, history }: { identity: PlayerIdentity; history: HistoryEntry[] }) {
  return (
    <div className="page shell">
      <a className="back-btn" href="/">Back</a>
      <div className="lb-title">Your hunt history</div>
      <div className="lb-sub">Account holders get a lightweight record of submissions and top-five finishes.</div>
      {identity.isGuest ? (
        <>
          <div className="empty-slab">
            <h2>Sign in to save your history</h2>
            <p>Use a magic link to tie future wins and reminders to an account instead of a guest alias.</p>
          </div>
          <AuthCard identity={identity} next="/history" />
        </>
      ) : (
        <>
          <div className="history-stack">
            {history.map((entry) => (
              <div className="history-row" key={`${entry.huntLabel}-${entry.challenge}`}>
                <div>
                  <div className="history-title">{entry.challenge}</div>
                  <div className="history-meta">{entry.huntLabel} - {formatFriendlyDate(entry.submittedAt)}</div>
                </div>
                <div className={`history-pill history-pill--${entry.outcome}`}>{entry.outcome.replace("-", " ")}</div>
              </div>
            ))}
          </div>
          <AuthCard identity={identity} next="/history" />
        </>
      )}
    </div>
  );
}
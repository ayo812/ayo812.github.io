"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { type PlayerIdentity } from "@/lib/types";

export function AuthCard({ identity, next = "/history" }: { identity: PlayerIdentity; next?: string }) {
  const [email, setEmail] = useState(identity.email ?? "");
  const [message, setMessage] = useState(
    identity.isGuest
      ? identity.canSignIn
        ? "Use a magic link to save your leaderboard identity and hunt history."
        : "Add Supabase env vars to enable sign-in."
      : `Signed in as ${identity.displayName ?? identity.email}`
  );

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Sending magic link...");

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, next })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error ?? "Unable to send magic link.");
      return;
    }

    setMessage("Magic link sent. Open it on this device to attach your account.");
  }

  async function handleSignOut() {
    setMessage("Signing out...");
    const response = await fetch("/api/auth/signout", { method: "POST" });
    if (response.ok) {
      window.location.href = "/";
      return;
    }
    setMessage("Unable to sign out.");
  }

  if (identity.isGuest) {
    return (
      <div className="email-signup-card auth-card">
        <div className="email-signup-title">Save your wins</div>
        <div className="email-signup-sub">Create a passwordless account for leaderboard credit, reminders, and hunt history.</div>
        {identity.canSignIn ? (
          <form className="email-row" onSubmit={handleMagicLink}>
            <input className="email-input" type="email" placeholder="your@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            <button className="pill-btn" type="submit">Send link</button>
          </form>
        ) : null}
        <div className="email-note">{message}</div>
      </div>
    );
  }

  return (
    <div className="email-signup-card auth-card">
      <div className="email-signup-title">Account connected</div>
      <div className="email-signup-sub">You can now appear on the leaderboard and keep your hunt history.</div>
      <div className="auth-actions">
        <Link className="pill-btn pill-btn--secondary" href="/history">View history</Link>
        <button className="pill-btn" type="button" onClick={handleSignOut}>Sign out</button>
      </div>
      <div className="email-note">{message}</div>
    </div>
  );
}
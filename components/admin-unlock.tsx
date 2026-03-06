"use client";

import { useState, type FormEvent } from "react";

export function AdminUnlock() {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret })
    });

    if (response.ok) {
      window.location.href = "/admin";
      return;
    }

    setMessage("Invalid admin secret or SCAVENG_ADMIN_SECRET is not configured.");
  }

  return (
    <div className="page shell">
      <div className="empty-slab empty-slab--centered">
        <h1 className="lb-title">Admin unlock</h1>
        <p className="lb-sub">Protected admin routes use a lightweight secret-gated cookie in this scaffold.</p>
        <form className="unlock-form" onSubmit={handleSubmit}>
          <input className="text-field" type="password" placeholder="Admin secret" value={secret} onChange={(event) => setSecret(event.target.value)} />
          <button className="pill-btn" type="submit">Unlock</button>
        </form>
        <p className="admin-message">{message || "Set SCAVENG_ADMIN_SECRET in your environment to activate this route protection."}</p>
      </div>
    </div>
  );
}


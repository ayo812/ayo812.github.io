"use client";

import { useState, type FormEvent } from "react";

import { formatPlacementTime } from "@/lib/time";
import { type AdminDashboardData, type ChallengeSuggestion, type HomeState, type Submission } from "@/lib/types";

const previewStates: HomeState[] = ["waiting", "live", "submitted", "results-out"];

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const [challenge, setChallenge] = useState(data.activeHunt.challenge);
  const [challengeHint, setChallengeHint] = useState(data.activeHunt.challengeHint);
  const [previewState, setPreviewState] = useState<HomeState>("waiting");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<ChallengeSuggestion[]>(data.suggestions);
  const [flaggedSubmissions, setFlaggedSubmissions] = useState<Submission[]>(data.flaggedSubmissions);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving hunt settings...");

    const response = await fetch("/api/admin/hunts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge, challengeHint, previewState, approvedSource: "manual" })
    });

    setMessage(response.ok ? "Hunt settings updated." : "Unable to update the hunt.");
  }

  async function handlePublish() {
    setMessage("Publishing results...");
    const response = await fetch("/api/admin/results/publish", { method: "POST" });
    setMessage(response.ok ? "Results published." : "Unable to publish results.");
  }

  async function handleGenerateSuggestions() {
    setMessage("Generating AI suggestions...");
    const response = await fetch("/api/admin/suggestions/generate", { method: "POST" });
    if (!response.ok) {
      setMessage("Unable to generate suggestions.");
      return;
    }

    const nextSuggestions = await response.json();
    setSuggestions(nextSuggestions);
    setMessage("AI suggestions refreshed.");
  }

  async function handleSubmissionReview(submissionId: string, moderationStatus: Submission["moderationStatus"], verificationStatus: Submission["verificationStatus"]) {
    setMessage("Saving submission review...");
    const response = await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moderationStatus, verificationStatus, reviewNotes: "Reviewed from admin panel." })
    });

    if (!response.ok) {
      setMessage("Unable to save submission review.");
      return;
    }

    setFlaggedSubmissions((current) => current.filter((submission) => submission.id !== submissionId));
    setMessage("Submission review saved.");
  }

  function applySuggestion(suggestion: ChallengeSuggestion) {
    setChallenge(suggestion.title);
    setChallengeHint(suggestion.rationale);
    setMessage("Suggestion copied into the active hunt form.");
  }

  return (
    <div className="page shell">
      <a className="back-btn" href="/">Back</a>
      <div className="lb-title">Admin</div>
      <div className="lb-sub">Semi-manual operations for hunt scheduling, flagged submissions, AI suggestions, and instant result publication at close.</div>

      <div className="admin-grid">
        <form className="admin-card" onSubmit={handleSave}>
          <div className="section-label">Active hunt</div>
          <label className="field-label">Challenge</label>
          <input className="text-field" value={challenge} onChange={(event) => setChallenge(event.target.value)} />
          <label className="field-label">Mobile-friendly hint</label>
          <textarea className="text-area" value={challengeHint} onChange={(event) => setChallengeHint(event.target.value)} rows={4} />
          <label className="field-label">Preview state</label>
          <select className="text-field" value={previewState} onChange={(event) => setPreviewState(event.target.value as HomeState)}>
            {previewStates.map((stateValue) => <option key={stateValue} value={stateValue}>{stateValue}</option>)}
          </select>
          <button className="pill-btn" type="submit">Save hunt</button>
          <p className="admin-message">{message || "Set the challenge copy and force one of the public state variants for review."}</p>
        </form>

        <div className="admin-card">
          <div className="section-label">AI suggestions</div>
          <button className="pill-btn" type="button" onClick={handleGenerateSuggestions}>Generate suggestions</button>
          <div className="suggestion-stack">
            {suggestions.map((suggestion) => (
              <div className="suggestion-row" key={suggestion.id}>
                <div>
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-meta">{suggestion.rationale}</div>
                </div>
                <div className="admin-inline-actions">
                  <div className={`history-pill ${suggestion.approved ? "history-pill--top-5" : "history-pill--submitted"}`}>{suggestion.approved ? "approved" : suggestion.sourceModel}</div>
                  <button className="pill-btn pill-btn--secondary" type="button" onClick={() => applySuggestion(suggestion)}>Use</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="section-label">Flagged submissions</div>
          {flaggedSubmissions.length === 0 ? (
            <p className="admin-message">No flagged submissions right now.</p>
          ) : (
            <div className="suggestion-stack">
              {flaggedSubmissions.map((submission) => (
                <div className="suggestion-row" key={submission.id}>
                  <div>
                    <div className="suggestion-title">{submission.guestAlias}</div>
                    <div className="suggestion-meta">{submission.verificationStatus} - {submission.moderationStatus}</div>
                    {submission.reviewNotes ? <div className="suggestion-meta">{submission.reviewNotes}</div> : null}
                  </div>
                  <div className="admin-inline-actions admin-inline-actions--stacked">
                    <button className="pill-btn pill-btn--secondary" type="button" onClick={() => handleSubmissionReview(submission.id, "approved", "verified")}>Approve</button>
                    <button className="pill-btn pill-btn--secondary" type="button" onClick={() => handleSubmissionReview(submission.id, submission.moderationStatus === "blocked" ? "blocked" : "flagged", "needs_manual_review")}>Keep flagged</button>
                    <button className="pill-btn" type="button" onClick={() => handleSubmissionReview(submission.id, "blocked", "rejected")}>Block</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="section-label">Published results</div>
          <div className="suggestion-stack">
            {data.publishedResults.map((entry) => (
              <div className="suggestion-row" key={entry.submissionId}>
                <div>
                  <div className="suggestion-title">#{entry.rank} {entry.displayName}</div>
                  <div className="suggestion-meta">{formatPlacementTime(entry.timeToSubmitSeconds)}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="pill-btn" type="button" onClick={handlePublish}>Publish results</button>
        </div>
      </div>
    </div>
  );
}
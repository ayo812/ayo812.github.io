"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { AuthCard } from "@/components/auth-card";
import { formatFriendlyDate, formatPlacementTime } from "@/lib/time";
import {
  type HomePageData,
  type HomeState,
  type ResultEntry,
  type Submission,
  type SubmissionProgressState
} from "@/lib/types";

const HOME_STATES: HomeState[] = ["waiting", "live", "submitted", "results-soon", "results-out"];

function formatCountdown(targetIso: string, nowMs: number) {
  const diff = Math.max(0, new Date(targetIso).getTime() - nowMs);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

function loadImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(imageUrl);
    };
    image.onerror = () => {
      reject(new Error("Unable to read image dimensions."));
      URL.revokeObjectURL(imageUrl);
    };
    image.src = imageUrl;
  });
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const image = document.createElement("img");
  const imageUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to load the selected image."));
      image.src = imageUrl;
    });

    const maxEdge = 1600;
    const ratio = Math.min(1, maxEdge / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));

    if (ratio === 1 && file.size <= 1_400_000) {
      return { file, width: image.width, height: image.height };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to prepare image compression.");
    }

    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.82);
    });

    if (!blob) {
      throw new Error("Unable to compress image.");
    }

    return {
      file: new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }),
      width,
      height
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function ResultCard({ entry }: { entry: ResultEntry }) {
  return (
    <div className="winner-card">
      <div className="winner-img">{entry.emoji}</div>
      <div className="winner-medal">#{entry.rank}</div>
      <div className="winner-name">{entry.displayName}</div>
      <div className="winner-time">{formatPlacementTime(entry.timeToSubmitSeconds)}</div>
    </div>
  );
}

export function HomePageClient({ initialData }: { initialData: HomePageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [homeState, setHomeState] = useState<HomeState>(initialData.homeState);
  const [submission, setSubmission] = useState<Submission | undefined>(initialData.submission);
  const [uploadState, setUploadState] = useState<SubmissionProgressState>(submission ? "locked" : "idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(initialData.reminderEnabled);
  const [reminderEmail, setReminderEmail] = useState(initialData.identity.email ?? "");
  const [reminderMessage, setReminderMessage] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdownToDrop = formatCountdown(initialData.currentHunt.dropAt, nowMs);
  const countdownToClose = formatCountdown(initialData.currentHunt.closesAt, nowMs);
  const countdownToResults = formatCountdown(initialData.currentHunt.resultsAt, nowMs);
  const nextDropCountdown = homeState === "results-out"
    ? formatCountdown(new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), nowMs)
    : countdownToDrop;

  async function handleReminderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReminderMessage("Saving reminder preference...");

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, email: reminderEmail })
      });

      if (!response.ok) {
        throw new Error("Unable to save reminder preference.");
      }

      setReminderEnabled(true);
      setReminderMessage("Morning reminder enabled.");
    } catch (error) {
      setReminderMessage(error instanceof Error ? error.message : "Unable to save reminder preference.");
    }
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) {
      return;
    }

    setUploadState("compressing");
    setUploadMessage("Optimizing image for mobile upload...");

    try {
      const compressed = await compressImage(selected);
      const imageDataUrl = await fileToDataUrl(compressed.file);
      setUploadState("creating-intent");
      setUploadMessage("Locking your upload slot...");

      const intentResponse = await fetch("/api/submissions/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          huntId: initialData.currentHunt.id,
          fileName: compressed.file.name,
          fileSize: compressed.file.size
        })
      });

      if (!intentResponse.ok) {
        throw new Error("Unable to create a submission intent.");
      }

      const intent = await intentResponse.json();
      if (intent.alreadySubmitted) {
        setUploadState("error");
        setUploadMessage("You already have a locked submission for this hunt.");
        return;
      }

      setUploadState("uploading");
      setUploadMessage("Uploading your photo...");
      const dimensions = await loadImageDimensions(compressed.file);

      setUploadState("finalizing");
      setUploadMessage("Finalizing and stamping your submission...");
      const finalizeResponse = await fetch("/api/submissions/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: intent.submissionId,
          huntId: initialData.currentHunt.id,
          fileName: compressed.file.name,
          mimeType: compressed.file.type,
          fileSize: compressed.file.size,
          width: dimensions.width,
          height: dimensions.height,
          capturedAt: new Date(selected.lastModified).toISOString(),
          imageDataUrl
        })
      });

      if (!finalizeResponse.ok) {
        const payload = await finalizeResponse.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to finalize the submission.");
      }

      const finalized: Submission = await finalizeResponse.json();
      setSubmission(finalized);
      setHomeState("submitted");
      setUploadState("locked");
      setUploadMessage("Submission locked. Results drop about an hour after the hunt closes.");
      router.refresh();
    } catch (error) {
      setUploadState("error");
      setUploadMessage(error instanceof Error ? error.message : "Unable to upload your photo.");
    } finally {
      event.target.value = "";
    }
  }

  const canUpload = homeState === "live" && !["compressing", "creating-intent", "uploading", "finalizing"].includes(uploadState);
  const topThree = (homeState === "results-out" ? initialData.publishedResults : initialData.previousResults).slice(0, 3);
  const runnersUp = initialData.publishedResults.slice(3);

  function navigateToPreviewState(nextState: HomeState) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("state", nextState);
    const href = `${pathname}?${params.toString()}` as Route;
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="shell">
      <nav className="nav">
        <Link href="/" className="nav-logo">scaveng<span>.io</span></Link>
      </nav>

      <main className="page">
        {(homeState === "waiting" || homeState === "results-soon" || homeState === "results-out") && (
          <section className="pre-hero">
            <div className={`eyebrow ${homeState === "waiting" ? "waiting" : "closed"}`}>
              {homeState === "waiting" ? "Today's hunt" : homeState === "results-soon" ? "Hunt closed" : "Results are in"}
            </div>
            <h1 className="hero-title">
              {homeState === "waiting" ? "Today's hunt drops" : homeState === "results-soon" ? "Window closed." : "Today's winners"}
              <br />
              <em>
                {homeState === "waiting"
                  ? `in ${countdownToDrop}.`
                  : homeState === "results-soon"
                    ? "Results soon."
                    : initialData.currentHunt.challenge}
              </em>
            </h1>
            <p className="hero-sub">
              {homeState === "waiting"
                ? "A new challenge drops at one global moment each day. You get exactly one hour to find it and upload your shot from your phone."
                : homeState === "results-soon"
                  ? "The submission window is over. Results and today's fastest five publish one hour after the hunt closes."
                  : `${initialData.currentHunt.submissionsCount} people hunted today. Here are the fastest five valid submissions.`}
            </p>
            <div className="countdown-box">
              <div className="countdown-label">
                {homeState === "waiting" ? "Hunt drops in" : homeState === "results-soon" ? "Results drop in" : "Next hunt drops in"}
              </div>
              <div className="countdown-time">
                {homeState === "waiting" ? countdownToDrop : homeState === "results-soon" ? countdownToResults : nextDropCountdown}
              </div>
              <div className="countdown-sub">Same moment for everyone</div>
            </div>
          </section>
        )}

        {homeState === "live" && (
          <section>
            <div className="hunt-banner">
              <div className="live-badge"><span className="live-dot" /> Hunt is live</div>
              <div className="hunt-goal">{initialData.currentHunt.challenge}</div>
              <div className="hunt-timer">Window closes in <strong>{countdownToClose}</strong></div>
              <p className="hunt-hint">{initialData.currentHunt.challengeHint}</p>
            </div>
            <div className={`upload-zone ${canUpload ? "" : "upload-zone--busy"}`} onClick={() => canUpload && fileInputRef.current?.click()}>
              <div className="upload-icon">CAM</div>
              <div className="upload-title">Upload your photo</div>
              <div className="upload-sub">Camera first on mobile, gallery still allowed. Your time is locked only after the server accepts the upload.</div>
              <input ref={fileInputRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={handleFileSelected} />
            </div>
            <div className="upload-rules">
              <div className="rule-chip">Photo should be captured after the drop</div>
              <div className="rule-chip">AI moderation blocks inappropriate content</div>
              <div className="rule-chip">One final submission per hunt</div>
            </div>
            <div className="submit-count">
              <div>
                <div className="submit-count-label">Submissions so far</div>
                <div className="submit-count-num">{initialData.currentHunt.submissionsCount}</div>
              </div>
              <div className={`upload-status upload-status--${uploadState}`}>{uploadMessage || "Ready for upload"}</div>
            </div>
          </section>
        )}

        {homeState === "submitted" && submission && (
          <section>
            <div className="submitted-banner">
              <div className="submitted-icon">OK</div>
              <div className="submitted-title">You're in!</div>
              <div className="submitted-time">Submitted at {new Date(submission.acceptedAt ?? Date.now()).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })} - Results drop about one hour after the window closes</div>
            </div>
            <div className="submitted-status-card">
              <div>
                <div className="section-label">Window closes in</div>
                <div className="submitted-countdown">{countdownToClose}</div>
              </div>
              <div className="submitted-note">Results publish roughly one hour after close, once flagged submissions are reviewed.</div>
            </div>
            <Link href="/leaderboard" className="cta-card">
              <div className="cta-card-icon">WIN</div>
              <div>
                <div className="cta-card-title">All-time leaderboard</div>
                <div className="cta-card-sub">See who has dominated across every hunt.</div>
              </div>
              <div className="cta-card-arrow">Go</div>
            </Link>
            <form className="email-signup-card" onSubmit={handleReminderSubmit}>
              <div className="email-signup-title">Get tomorrow's heads-up</div>
              <div className="email-signup-sub">One morning reminder, no drop time spoiler. Best for mobile players who want a nudge.</div>
              <div className="email-row">
                <input className="email-input" placeholder="your@email.com" type="email" value={reminderEmail} onChange={(event) => setReminderEmail(event.target.value)} />
                <button className="pill-btn" type="submit">{reminderEnabled ? "Saved" : "Remind me"}</button>
              </div>
              <div className="email-note">{reminderMessage || "Reminder signup works with Supabase when configured, and still falls back cleanly during local demo mode."}</div>
            </form>
            <AuthCard identity={initialData.identity} next="/history" />
          </section>
        )}

        {(homeState === "waiting" || homeState === "results-soon" || homeState === "results-out") && (
          <section className="prev-hunt-card">
            <div className="prev-hunt-header">
              <div className="prev-hunt-title">{homeState === "results-out" ? "Today's top 5" : "Yesterday's winners"}</div>
              <div className="prev-hunt-date">
                {homeState === "results-out"
                  ? `${formatFriendlyDate(initialData.currentHunt.resultsAt)} - ${initialData.currentHunt.submissionsCount} submissions`
                  : formatFriendlyDate(new Date(Date.now() - 86400000).toISOString())}
              </div>
            </div>
            <div className="winners-row">
              {topThree.map((entry) => <ResultCard key={entry.submissionId} entry={entry} />)}
            </div>
            {homeState === "results-out" && (
              <>
                <div className="runner-list">
                  {runnersUp.map((entry) => (
                    <div className="runner-row" key={entry.submissionId}>
                      <div className="runner-rank">#{entry.rank}</div>
                      <div className="runner-photo">{entry.emoji}</div>
                      <div className="runner-name">{entry.displayName}</div>
                      <div className="runner-time">{formatPlacementTime(entry.timeToSubmitSeconds)}</div>
                    </div>
                  ))}
                </div>
                <Link href="/leaderboard" className="cta-card cta-card--tight">
                  <div className="cta-card-icon">WIN</div>
                  <div>
                    <div className="cta-card-title">All-time leaderboard</div>
                    <div className="cta-card-sub">See who turns top-five finishes into repeat wins.</div>
                  </div>
                  <div className="cta-card-arrow">Go</div>
                </Link>
              </>
            )}
          </section>
        )}

        {initialData.previewStateEnabled && (
          <section className="preview-panel">
            <div>
              <div className="section-label">Preview states</div>
              <p className="preview-copy">Development-only state switcher for the five daily-cycle variants.</p>
            </div>
            <div className="preview-buttons">
              {HOME_STATES.map((stateValue) => (
                <button
                  key={stateValue}
                  type="button"
                  className={`preview-btn ${stateValue === homeState ? "active" : ""}`}
                  onClick={() => navigateToPreviewState(stateValue)}
                >
                  {stateValue}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
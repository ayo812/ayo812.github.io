import { type HomeState } from "@/lib/types";

export function formatCountdown(targetIso: string, now = new Date()): string {
  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatPlacementTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function formatFriendlyDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(iso));
}

export function deriveHomeState(input: {
  now: Date;
  dropAt: string;
  closesAt: string;
  resultsAt: string;
  hasSubmission: boolean;
}): HomeState {
  const nowMs = input.now.getTime();
  const dropMs = new Date(input.dropAt).getTime();
  const closeMs = new Date(input.closesAt).getTime();
  const resultsMs = new Date(input.resultsAt).getTime();

  if (nowMs < dropMs) {
    return "waiting";
  }

  if (nowMs < closeMs) {
    return input.hasSubmission ? "submitted" : "live";
  }

  if (nowMs < resultsMs) {
    return "results-soon";
  }

  return "results-out";
}

export function isPreviewState(value: string | undefined): value is HomeState {
  return value === "waiting" || value === "live" || value === "submitted" || value === "results-soon" || value === "results-out";
}


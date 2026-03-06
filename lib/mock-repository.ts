import { deriveGuestAlias } from "@/lib/identity";
import { deriveHomeState } from "@/lib/time";
import {
  type AdminDashboardData,
  type ChallengeSuggestion,
  type HistoryEntry,
  type HomePageData,
  type HomeState,
  type Hunt,
  type LeaderboardEntry,
  type LeaderboardRange,
  type PlayerIdentity,
  type ResultEntry,
  type Submission,
  type SubmissionIntent
} from "@/lib/types";

const leaderboardBase: LeaderboardEntry[] = [
  { name: "swift_snapper", wins: 47, topFiveFinishes: 82, emoji: "?" },
  { name: "photo_finn", wins: 38, topFiveFinishes: 69, emoji: "??" },
  { name: "dailyhunter", wins: 31, topFiveFinishes: 58, emoji: "??" },
  { name: "lensmaster99", wins: 28, topFiveFinishes: 47, emoji: "??" },
  { name: "morningscout", wins: 24, topFiveFinishes: 39, emoji: "??" },
  { name: "quickclick", wins: 19, topFiveFinishes: 31, emoji: "??" },
  { name: "wandereye", wins: 15, topFiveFinishes: 29, emoji: "??" },
  { name: "naturenerd42", wins: 12, topFiveFinishes: 22, emoji: "??" }
];

const publishedResultsSeed: ResultEntry[] = [
  { submissionId: "r1", rank: 1, displayName: "swift_snapper", accountEligible: true, timeToSubmitSeconds: 252, acceptedAt: new Date().toISOString(), emoji: "??" },
  { submissionId: "r2", rank: 2, displayName: "photo_finn", accountEligible: true, timeToSubmitSeconds: 423, acceptedAt: new Date().toISOString(), emoji: "??" },
  { submissionId: "r3", rank: 3, displayName: "dailyhunter", accountEligible: true, timeToSubmitSeconds: 584, acceptedAt: new Date().toISOString(), emoji: "??" },
  { submissionId: "r4", rank: 4, displayName: "guest_fox_12", accountEligible: false, timeToSubmitSeconds: 751, acceptedAt: new Date().toISOString(), emoji: "??", guestAlias: "guest_fox_12" },
  { submissionId: "r5", rank: 5, displayName: "quickclick", accountEligible: true, timeToSubmitSeconds: 1135, acceptedAt: new Date().toISOString(), emoji: "??" }
];

const previousResultsSeed: ResultEntry[] = [
  { submissionId: "y1", rank: 1, displayName: "swift_snapper", accountEligible: true, timeToSubmitSeconds: 312, acceptedAt: new Date().toISOString(), emoji: "??" },
  { submissionId: "y2", rank: 2, displayName: "photo_finn", accountEligible: true, timeToSubmitSeconds: 463, acceptedAt: new Date().toISOString(), emoji: "??" },
  { submissionId: "y3", rank: 3, displayName: "dailyhunter", accountEligible: true, timeToSubmitSeconds: 621, acceptedAt: new Date().toISOString(), emoji: "??" }
];

const challengeSuggestions: ChallengeSuggestion[] = [
  { id: "s1", title: "Find a blonde dog", rationale: "High recognition, fast judging, broad availability.", sourceModel: "gpt-4.1-mini", approved: true },
  { id: "s2", title: "Find a handwritten grocery list", rationale: "Common household object with low safety risk.", sourceModel: "gpt-4.1-mini", approved: false },
  { id: "s3", title: "Find a striped umbrella", rationale: "Visually distinct and weather-dependent for variety.", sourceModel: "gpt-4.1-mini", approved: false }
];

const historySeed: HistoryEntry[] = [
  { huntLabel: "Mar 5", challenge: "Find a red door", submittedAt: "2026-03-05T14:12:00.000Z", outcome: "top-5" },
  { huntLabel: "Mar 4", challenge: "Find a green mug", submittedAt: "2026-03-04T17:04:00.000Z", outcome: "submitted" },
  { huntLabel: "Mar 3", challenge: "Find a blue bicycle", submittedAt: "2026-03-03T12:31:00.000Z", outcome: "submitted" }
];

const state = {
  previewState: "waiting" as HomeState,
  activeChallenge: "Find a blonde dog",
  activeHint: "Any real dog counts. Fastest valid submission wins.",
  suggestions: structuredClone(challengeSuggestions),
  publishedResults: structuredClone(publishedResultsSeed),
  previousResults: structuredClone(previousResultsSeed),
  submissions: new Map<string, Submission>(),
  reminders: new Map<string, boolean>()
};

function subtractScale(entries: LeaderboardEntry[], winsDelta: number, topFiveDelta: number) {
  return entries.map((entry, index) => ({
    ...entry,
    wins: Math.max(1, entry.wins - winsDelta * index),
    topFiveFinishes: Math.max(entry.wins, entry.topFiveFinishes - topFiveDelta * index)
  }));
}

function getLeaderboard(range: LeaderboardRange): LeaderboardEntry[] {
  if (range === "this-month") {
    return subtractScale(leaderboardBase, 4, 6);
  }

  if (range === "this-week") {
    return subtractScale(leaderboardBase, 8, 10);
  }

  return leaderboardBase;
}

function buildHunt(previewState: HomeState): Hunt {
  const now = Date.now();

  if (previewState === "waiting") {
    return {
      id: "hunt-today",
      challenge: state.activeChallenge,
      challengeHint: state.activeHint,
      dropAt: new Date(now + 1000 * 60 * 60 * 3.4).toISOString(),
      closesAt: new Date(now + 1000 * 60 * 60 * 4.4).toISOString(),
      resultsAt: new Date(now + 1000 * 60 * 60 * 5.4).toISOString(),
      status: "scheduled",
      approvedSource: "manual",
      submissionsCount: 0
    };
  }

  if (previewState === "live" || previewState === "submitted") {
    return {
      id: "hunt-today",
      challenge: state.activeChallenge,
      challengeHint: state.activeHint,
      dropAt: new Date(now - 1000 * 60 * 22).toISOString(),
      closesAt: new Date(now + 1000 * 60 * 38).toISOString(),
      resultsAt: new Date(now + 1000 * 60 * 98).toISOString(),
      status: "live",
      approvedSource: "manual",
      submissionsCount: 143 + state.submissions.size
    };
  }

  if (previewState === "results-soon") {
    return {
      id: "hunt-today",
      challenge: state.activeChallenge,
      challengeHint: state.activeHint,
      dropAt: new Date(now - 1000 * 60 * 90).toISOString(),
      closesAt: new Date(now - 1000 * 60 * 30).toISOString(),
      resultsAt: new Date(now + 1000 * 60 * 30).toISOString(),
      status: "results_pending",
      approvedSource: "manual",
      submissionsCount: 268 + state.submissions.size
    };
  }

  return {
    id: "hunt-today",
    challenge: state.activeChallenge,
    challengeHint: state.activeHint,
    dropAt: new Date(now - 1000 * 60 * 180).toISOString(),
    closesAt: new Date(now - 1000 * 60 * 120).toISOString(),
    resultsAt: new Date(now - 1000 * 60 * 60).toISOString(),
    status: "results_published",
    approvedSource: "manual",
    submissionsCount: 312 + state.submissions.size
  };
}

function getSubmissionFor(identityId: string, huntId: string) {
  return Array.from(state.submissions.values()).find((submission) => submission.identityId === identityId && submission.huntId === huntId);
}

export type CreateIntentInput = {
  identity: PlayerIdentity;
  huntId: string;
  fileName: string;
  fileSize: number;
};

export type FinalizeSubmissionInput = {
  identityId: string;
  submissionId: string;
  huntId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
  capturedAt?: string;
  imageDataUrl: string;
};

export type ReviewSubmissionInput = {
  submissionId: string;
  moderationStatus: Submission["moderationStatus"];
  verificationStatus: Submission["verificationStatus"];
  reviewNotes?: string;
};

export async function getHomePageData(identity: PlayerIdentity, previewState?: HomeState): Promise<HomePageData> {
  const effectivePreviewState = previewState ?? state.previewState;
  const hunt = buildHunt(effectivePreviewState);
  const existingSubmission = getSubmissionFor(identity.id, hunt.id);
  const homeState = effectivePreviewState === "submitted" && !existingSubmission
    ? "submitted"
    : deriveHomeState({
        now: new Date(),
        dropAt: hunt.dropAt,
        closesAt: hunt.closesAt,
        resultsAt: hunt.resultsAt,
        hasSubmission: Boolean(existingSubmission)
      });

  const syntheticSubmission = homeState === "submitted" && !existingSubmission
    ? {
        id: "synthetic-submission",
        huntId: hunt.id,
        identityId: identity.id,
        guestAlias: identity.guestAlias,
        fileName: "camera-roll.jpg",
        mimeType: "image/jpeg",
        fileSize: 720000,
        width: 1440,
        height: 1920,
        capturedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        acceptedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        moderationStatus: "approved" as const,
        verificationStatus: "verified" as const,
        uploadState: "accepted" as const
      }
    : undefined;

  return {
    identity,
    homeState,
    currentHunt: hunt,
    previousResults: state.previousResults,
    publishedResults: state.publishedResults,
    leaderboardPreview: getLeaderboard("all-time").slice(0, 5),
    submission: existingSubmission ?? syntheticSubmission,
    history: identity.isGuest ? [] : historySeed,
    reminderEnabled: state.reminders.get(identity.id) ?? false,
    previewStateEnabled: process.env.NODE_ENV !== "production"
  };
}

export async function getLeaderboardData(range: LeaderboardRange) {
  return getLeaderboard(range);
}

export async function getHistory(identity: PlayerIdentity) {
  return identity.isGuest ? [] : historySeed;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  return {
    activeHunt: buildHunt(state.previewState),
    suggestions: state.suggestions,
    flaggedSubmissions: Array.from(state.submissions.values()).filter(
      (submission) => submission.moderationStatus !== "approved" || submission.verificationStatus !== "verified"
    ),
    publishedResults: state.publishedResults
  };
}

export async function createSubmissionIntent(input: CreateIntentInput): Promise<SubmissionIntent> {
  const existing = getSubmissionFor(input.identity.id, input.huntId);

  if (existing) {
    return {
      submissionId: existing.id,
      huntId: input.huntId,
      uploadUrl: "/api/submissions/finalize",
      alreadySubmitted: true
    };
  }

  const submissionId = crypto.randomUUID();
  state.submissions.set(submissionId, {
    id: submissionId,
    huntId: input.huntId,
    identityId: input.identity.id,
    guestAlias: input.identity.guestAlias,
    fileName: input.fileName,
    mimeType: "image/jpeg",
    fileSize: input.fileSize,
    width: 0,
    height: 0,
    moderationStatus: "pending",
    verificationStatus: "pending",
    uploadState: "pending"
  });

  return {
    submissionId,
    huntId: input.huntId,
    uploadUrl: "/api/submissions/finalize",
    alreadySubmitted: false
  };
}

export async function finalizeSubmission(input: FinalizeSubmissionInput) {
  const submission = state.submissions.get(input.submissionId);

  if (!submission || submission.identityId !== input.identityId || submission.huntId !== input.huntId) {
    throw new Error("Submission not found.");
  }

  if (submission.uploadState === "accepted") {
    return submission;
  }

  const hunt = buildHunt(state.previewState === "waiting" ? "live" : state.previewState);
  const capturedAtMs = input.capturedAt ? new Date(input.capturedAt).getTime() : NaN;
  const dropAtMs = new Date(hunt.dropAt).getTime();
  const closeAtMs = new Date(hunt.closesAt).getTime();
  const withinWindow = Number.isFinite(capturedAtMs) && capturedAtMs >= dropAtMs && capturedAtMs <= closeAtMs;

  const verificationStatus = withinWindow ? "verified" : "needs_manual_review";
  const moderationStatus = input.mimeType.startsWith("image/") ? "approved" : "blocked";

  const accepted: Submission = {
    ...submission,
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    width: input.width,
    height: input.height,
    capturedAt: input.capturedAt,
    acceptedAt: new Date().toISOString(),
    moderationStatus,
    verificationStatus,
    uploadState: moderationStatus === "blocked" ? "rejected" : "accepted"
  };

  state.submissions.set(input.submissionId, accepted);
  return accepted;
}

export async function setReminder(identityId: string, enabled: boolean) {
  state.reminders.set(identityId, enabled);
  return enabled;
}

export async function updateHunt(input: { challenge: string; challengeHint: string; previewState?: HomeState; approvedSource: Hunt["approvedSource"]; }) {
  state.activeChallenge = input.challenge;
  state.activeHint = input.challengeHint;
  if (input.previewState) {
    state.previewState = input.previewState;
  }
  return buildHunt(state.previewState);
}

export async function publishResults() {
  state.previewState = "results-out";
  return state.publishedResults;
}

export async function reviewSubmission(input: ReviewSubmissionInput) {
  const submission = state.submissions.get(input.submissionId);
  if (!submission) {
    throw new Error("Submission not found.");
  }

  const reviewed = {
    ...submission,
    moderationStatus: input.moderationStatus,
    verificationStatus: input.verificationStatus,
    reviewNotes: input.reviewNotes,
    uploadState: input.verificationStatus === "rejected" || input.moderationStatus === "blocked" ? "rejected" : submission.uploadState
  } satisfies Submission;

  state.submissions.set(input.submissionId, reviewed);
  return reviewed;
}

export async function getCurrentHunt(previewState?: HomeState) {
  const currentPreviewState = previewState ?? state.previewState;
  state.previewState = currentPreviewState;
  return buildHunt(currentPreviewState);
}

export async function getSubmissionSummary() {
  return Array.from(state.submissions.values()).map((submission) => ({
    ...submission,
    guestAlias: submission.guestAlias || deriveGuestAlias(submission.identityId)
  }));
}


export async function createChallengeSuggestions(count = 3) {
  const suggestions = [
    { id: `mock-${Date.now()}-1`, title: "Find a handwritten grocery list", rationale: "Common household object with low safety risk.", sourceModel: "fallback", approved: false },
    { id: `mock-${Date.now()}-2`, title: "Find a striped umbrella", rationale: "Visually distinct and easy to verify.", sourceModel: "fallback", approved: false },
    { id: `mock-${Date.now()}-3`, title: "Find a yellow mug", rationale: "Simple object challenge with broad availability.", sourceModel: "fallback", approved: false }
  ].slice(0, count);

  state.suggestions = [...suggestions, ...state.suggestions].slice(0, 10);
  return state.suggestions;
}

export async function listReminderRecipients() {
  return [] as Array<{ email: string }>;
}
export type HomeState =
  | "waiting"
  | "live"
  | "submitted"
  | "results-soon"
  | "results-out";

export type HuntStatus =
  | "scheduled"
  | "live"
  | "results_pending"
  | "results_published";

export type SubmissionVerificationStatus =
  | "pending"
  | "verified"
  | "needs_manual_review"
  | "rejected";

export type ModerationStatus =
  | "pending"
  | "approved"
  | "flagged"
  | "blocked";

export type LeaderboardRange = "all-time" | "this-month" | "this-week";

export type SubmissionProgressState =
  | "idle"
  | "compressing"
  | "creating-intent"
  | "uploading"
  | "finalizing"
  | "locked"
  | "error";

export type PlayerIdentity = {
  id: string;
  guestAlias: string;
  isGuest: boolean;
  canSignIn: boolean;
  email?: string;
  username?: string;
  displayName?: string;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  reminderEnabled: boolean;
  topFiveFinishes: number;
  wins: number;
};

export type Hunt = {
  id: string;
  challenge: string;
  challengeHint: string;
  dropAt: string;
  closesAt: string;
  resultsAt: string;
  status: HuntStatus;
  approvedSource: "manual" | "ai-suggested";
  submissionsCount: number;
};

export type ResultEntry = {
  submissionId: string;
  rank: number;
  displayName: string;
  accountEligible: boolean;
  timeToSubmitSeconds: number;
  acceptedAt: string;
  emoji: string;
  guestAlias?: string;
};

export type Submission = {
  id: string;
  huntId: string;
  identityId: string;
  guestAlias: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
  storagePath?: string;
  capturedAt?: string;
  acceptedAt?: string;
  moderationStatus: ModerationStatus;
  verificationStatus: SubmissionVerificationStatus;
  reviewNotes?: string;
  uploadState: "pending" | "accepted" | "rejected";
};

export type LeaderboardEntry = {
  name: string;
  wins: number;
  topFiveFinishes: number;
  emoji: string;
};

export type HistoryEntry = {
  huntLabel: string;
  challenge: string;
  submittedAt: string;
  outcome: "top-5" | "submitted" | "rejected";
};

export type ChallengeSuggestion = {
  id: string;
  title: string;
  rationale: string;
  sourceModel: string;
  approved: boolean;
};

export type HomePageData = {
  identity: PlayerIdentity;
  homeState: HomeState;
  currentHunt: Hunt;
  previousResults: ResultEntry[];
  publishedResults: ResultEntry[];
  leaderboardPreview: LeaderboardEntry[];
  submission?: Submission;
  history: HistoryEntry[];
  reminderEnabled: boolean;
  previewStateEnabled: boolean;
};

export type AdminDashboardData = {
  activeHunt: Hunt;
  suggestions: ChallengeSuggestion[];
  flaggedSubmissions: Submission[];
  publishedResults: ResultEntry[];
};

export type SubmissionIntent = {
  submissionId: string;
  huntId: string;
  uploadUrl: string;
  alreadySubmitted: boolean;
};
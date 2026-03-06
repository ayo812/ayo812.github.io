import { moderateSubmissionImage, generateChallengeSuggestions as generateSuggestionsWithOpenAI } from "@/lib/openai";
import { deriveHomeState, formatFriendlyDate } from "@/lib/time";
import { verifySubmissionTiming } from "@/lib/submission-verification";
import { getSupabaseAdminClient } from "@/lib/supabase/client";
import {
  type AdminDashboardData,
  type ChallengeSuggestion,
  type HistoryEntry,
  type HomePageData,
  type Hunt,
  type LeaderboardEntry,
  type LeaderboardRange,
  type ResultEntry,
  type Submission
} from "@/lib/types";
import { type CreateIntentInput, type FinalizeSubmissionInput, type ReviewSubmissionInput } from "@/lib/mock-repository";

const SYMBOLS = ["DOG", "TREE", "LEAF", "PATH", "LENS"];
const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "submissions";

type Row = Record<string, unknown>;

function requireAdmin() {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase service role is not configured.");
  }
  return client;
}

function arrayValue<T>(value: T | T[] | null | undefined): T | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? undefined;
}

function asHunt(row: Row, submissionsCount: number): Hunt {
  return {
    id: String(row.id),
    challenge: String(row.challenge ?? "Find something bright"),
    challengeHint: String(row.challenge_hint ?? "One valid photo wins on speed."),
    dropAt: String(row.drop_at),
    closesAt: String(row.closes_at),
    resultsAt: String(row.results_at),
    status: (row.status as Hunt["status"]) ?? "scheduled",
    approvedSource: (row.approved_source as Hunt["approvedSource"]) ?? "manual",
    submissionsCount
  };
}

function fallbackHunt(): Hunt {
  const now = Date.now();
  return {
    id: "fallback-hunt",
    challenge: "Find a blonde dog",
    challengeHint: "Any real dog counts. Fastest valid submission wins.",
    dropAt: new Date(now + 1000 * 60 * 60 * 3).toISOString(),
    closesAt: new Date(now + 1000 * 60 * 60 * 4).toISOString(),
    resultsAt: new Date(now + 1000 * 60 * 60 * 5).toISOString(),
    status: "scheduled",
    approvedSource: "manual",
    submissionsCount: 0
  };
}

async function listHunts() {
  const admin = requireAdmin();
  const { data, error } = await admin.from("hunts").select("*").order("drop_at", { ascending: true }).limit(20);
  if (error) {
    throw error;
  }
  return (data ?? []) as Row[];
}

function selectCurrentHunt(rows: Row[]) {
  const now = Date.now();
  return rows.find((row) => new Date(String(row.results_at)).getTime() > now) ?? rows.at(-1);
}

async function countSubmissions(huntId: string) {
  const admin = requireAdmin();
  const { count, error } = await admin.from("submissions").select("id", { count: "exact", head: true }).eq("hunt_id", huntId);
  if (error) {
    throw error;
  }
  return count ?? 0;
}

async function getCurrentHuntRow() {
  const rows = await listHunts();
  const current = selectCurrentHunt(rows);
  if (!current) {
    return null;
  }
  return current;
}

async function getHuntById(huntId: string) {
  const admin = requireAdmin();
  const { data, error } = await admin.from("hunts").select("*").eq("id", huntId).maybeSingle();
  if (error) {
    throw error;
  }
  return (data ?? null) as Row | null;
}

function resultEntryFromRow(row: Row, dropAt: string, index: number): ResultEntry {
  const submission = arrayValue(row.submissions as Row | Row[] | null);
  const profile = arrayValue((submission?.profiles ?? null) as Row | Row[] | null);
  const acceptedAt = String(submission?.accepted_at ?? row.published_at ?? new Date().toISOString());
  const acceptedMs = new Date(acceptedAt).getTime();
  const dropMs = new Date(dropAt).getTime();
  const timeToSubmitSeconds = Math.max(0, Math.round((acceptedMs - dropMs) / 1000));
  const displayName = profile?.username ? String(profile.username) : String(submission?.guest_alias ?? `guest_${index + 1}`);

  return {
    submissionId: String(submission?.id ?? row.submission_id ?? `submission-${index + 1}`),
    rank: Number(row.rank ?? index + 1),
    displayName,
    accountEligible: Boolean(profile?.username),
    timeToSubmitSeconds,
    acceptedAt,
    emoji: SYMBOLS[index % SYMBOLS.length],
    guestAlias: profile?.username ? undefined : String(submission?.guest_alias ?? displayName)
  };
}

async function getPublishedResultsForHunt(huntId: string, dropAt: string) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("daily_results")
    .select("rank,published_at,submission_id,submissions!inner(id,accepted_at,guest_alias,profiles(username))")
    .eq("hunt_id", huntId)
    .order("rank", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row, index) => resultEntryFromRow(row as Row, dropAt, index));
}

async function getPreviousPublishedResults(currentHuntId: string) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("hunts")
    .select("id,drop_at")
    .eq("status", "results_published")
    .neq("id", currentHuntId)
    .order("results_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return (await getPublishedResultsForHunt(String(data.id), String(data.drop_at))).slice(0, 3);
}

function submissionFromRow(row: Row): Submission {
  return {
    id: String(row.id),
    huntId: String(row.hunt_id),
    identityId: String(row.identity_key),
    guestAlias: String(row.guest_alias ?? "guest"),
    fileName: String(row.file_name ?? "upload.jpg"),
    mimeType: String(row.mime_type ?? "image/jpeg"),
    fileSize: Number(row.file_size ?? 0),
    width: Number(row.width ?? 0),
    height: Number(row.height ?? 0),
    storagePath: row.storage_path ? String(row.storage_path) : undefined,
    capturedAt: row.captured_at ? String(row.captured_at) : undefined,
    acceptedAt: row.accepted_at ? String(row.accepted_at) : undefined,
    moderationStatus: (row.moderation_status as Submission["moderationStatus"]) ?? "pending",
    verificationStatus: (row.verification_status as Submission["verificationStatus"]) ?? "pending",
    reviewNotes: row.review_notes ? String(row.review_notes) : undefined,
    uploadState: row.verification_status === "rejected" || row.moderation_status === "blocked" ? "rejected" : row.accepted_at ? "accepted" : "pending"
  };
}

async function getExistingSubmission(identityKey: string, huntId: string) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("submissions")
    .select("*")
    .eq("identity_key", identityKey)
    .eq("hunt_id", huntId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as Row | null;
}

async function createProfileIfMissing(identityId: string, email?: string, username?: string) {
  if (!email) {
    return;
  }

  const admin = requireAdmin();
  const fallbackUsername = username ?? (email.split("@")[0].replace(/[^a-z0-9_]+/gi, "_").replace(/^_+|_+$/g, "") || `player_${identityId.slice(0, 8)}`);
  await admin.from("profiles").upsert({
    id: identityId,
    email,
    username: fallbackUsername,
    reminder_enabled: false
  }, { onConflict: "id" });
}

export async function getCurrentHunt() {
  const row = await getCurrentHuntRow();
  if (!row) {
    return fallbackHunt();
  }
  const submissionsCount = await countSubmissions(String(row.id));
  return asHunt(row, submissionsCount);
}

export async function getHomePageData(identity: { id: string; guestAlias: string; isGuest: boolean; email?: string; username?: string; displayName?: string; }) : Promise<HomePageData> {
  await createProfileIfMissing(identity.id, identity.email, identity.username);
  const row = await getCurrentHuntRow();
  if (!row) {
    return {
      identity: { ...identity, canSignIn: true },
      homeState: "waiting",
      currentHunt: fallbackHunt(),
      previousResults: [],
      publishedResults: [],
      leaderboardPreview: [],
      history: identity.isGuest ? [] : await getHistory(identity),
      reminderEnabled: false,
      previewStateEnabled: process.env.NODE_ENV !== "production"
    };
  }

  const submissionsCount = await countSubmissions(String(row.id));
  const hunt = asHunt(row, submissionsCount);
  const existingRow = await getExistingSubmission(identity.id, hunt.id);
  const submission = existingRow ? submissionFromRow(existingRow) : undefined;
  const publishedResults = hunt.status === "results_published" ? await getPublishedResultsForHunt(hunt.id, hunt.dropAt) : [];
  const previousResults = await getPreviousPublishedResults(hunt.id);
  const leaderboardPreview = (await getLeaderboardData("all-time")).slice(0, 5);
  const history = identity.isGuest ? [] : await getHistory(identity);
  const homeState = deriveHomeState({
    now: new Date(),
    dropAt: hunt.dropAt,
    closesAt: hunt.closesAt,
    resultsAt: hunt.resultsAt,
    hasSubmission: Boolean(submission)
  });

  let reminderEnabled = false;
  if (!identity.isGuest) {
    const admin = requireAdmin();
    const { data: profile } = await admin.from("profiles").select("reminder_enabled").eq("id", identity.id).maybeSingle();
    reminderEnabled = Boolean(profile?.reminder_enabled);
  }

  return {
    identity: { ...identity, canSignIn: true },
    homeState,
    currentHunt: hunt,
    previousResults,
    publishedResults,
    leaderboardPreview,
    submission,
    history,
    reminderEnabled,
    previewStateEnabled: process.env.NODE_ENV !== "production"
  };
}

export async function getLeaderboardData(range: LeaderboardRange) {
  const admin = requireAdmin();
  let query = admin
    .from("daily_results")
    .select("published_at,rank,submissions!inner(profile_id,profiles(username))")
    .order("published_at", { ascending: false });

  const now = new Date();
  if (range === "this-month") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    query = query.gte("published_at", start);
  }

  if (range === "this-week") {
    const start = new Date(now);
    const day = start.getUTCDay() || 7;
    start.setUTCDate(start.getUTCDate() - day + 1);
    start.setUTCHours(0, 0, 0, 0);
    query = query.gte("published_at", start.toISOString());
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const aggregate = new Map<string, LeaderboardEntry>();
  for (const row of data ?? []) {
    const submission = arrayValue((row as Row).submissions as Row | Row[] | null);
    const profile = arrayValue((submission?.profiles ?? null) as Row | Row[] | null);
    const username = profile?.username ? String(profile.username) : undefined;
    if (!username) {
      continue;
    }

    const current = aggregate.get(username) ?? {
      name: username,
      wins: 0,
      topFiveFinishes: 0,
      emoji: "RANK"
    };
    current.topFiveFinishes += 1;
    if (Number((row as Row).rank) === 1) {
      current.wins += 1;
    }
    aggregate.set(username, current);
  }

  return Array.from(aggregate.values()).sort((left, right) => {
    if (right.wins !== left.wins) {
      return right.wins - left.wins;
    }
    return right.topFiveFinishes - left.topFiveFinishes;
  });
}

export async function getHistory(identity: { id: string; isGuest: boolean }) {
  if (identity.isGuest) {
    return [];
  }

  const admin = requireAdmin();
  const { data, error } = await admin
    .from("submissions")
    .select("id,accepted_at,verification_status,moderation_status,hunts!inner(challenge,drop_at)")
    .eq("profile_id", identity.id)
    .order("accepted_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  const submissionIds = (data ?? []).map((row) => String((row as Row).id));
  const { data: results } = submissionIds.length
    ? await admin.from("daily_results").select("submission_id").in("submission_id", submissionIds)
    : { data: [] as Row[] };
  const resultIds = new Set((results ?? []).map((row) => String((row as Row).submission_id)));

  return (data ?? []).map((row) => {
    const hunt = arrayValue(((row as Row).hunts ?? null) as Row | Row[] | null);
    const outcome = resultIds.has(String((row as Row).id))
      ? "top-5"
      : (row as Row).verification_status === "rejected" || (row as Row).moderation_status === "blocked"
        ? "rejected"
        : "submitted";

    return {
      huntLabel: hunt?.drop_at ? formatFriendlyDate(String(hunt.drop_at)) : "Recent hunt",
      challenge: String(hunt?.challenge ?? "Unknown challenge"),
      submittedAt: String((row as Row).accepted_at ?? new Date().toISOString()),
      outcome
    } satisfies HistoryEntry;
  });
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const hunt = await getCurrentHunt();
  const admin = requireAdmin();
  const { data: suggestionRows } = await admin.from("challenge_suggestions").select("*").order("created_at", { ascending: false }).limit(8);
  const { data: submissionRows } = await admin.from("submissions").select("*").order("created_at", { ascending: false }).limit(50);
  const flaggedSubmissions = (submissionRows ?? [])
    .map((row) => submissionFromRow(row as Row))
    .filter((submission) => submission.moderationStatus !== "approved" || submission.verificationStatus !== "verified");
  const publishedResults = hunt.status === "results_published" ? await getPublishedResultsForHunt(hunt.id, hunt.dropAt) : [];

  return {
    activeHunt: hunt,
    suggestions: (suggestionRows ?? []).map((row) => ({
      id: String((row as Row).id),
      title: String((row as Row).title),
      rationale: String((row as Row).rationale),
      sourceModel: String((row as Row).source_model),
      approved: Boolean((row as Row).approved)
    } satisfies ChallengeSuggestion)),
    flaggedSubmissions,
    publishedResults
  };
}

export async function createSubmissionIntent(input: CreateIntentInput) {
  const existing = await getExistingSubmission(input.identity.id, input.huntId);
  if (existing) {
    return {
      submissionId: String(existing.id),
      huntId: input.huntId,
      uploadUrl: "/api/submissions/finalize",
      alreadySubmitted: true
    };
  }

  const admin = requireAdmin();
  const { data, error } = await admin.from("submissions").insert({
    hunt_id: input.huntId,
    profile_id: input.identity.isGuest ? null : input.identity.id,
    guest_alias: input.identity.guestAlias,
    identity_key: input.identity.id,
    file_name: input.fileName,
    mime_type: "image/jpeg",
    file_size: input.fileSize,
    width: 0,
    height: 0
  }).select("id").single();

  if (error) {
    throw error;
  }

  return {
    submissionId: String(data.id),
    huntId: input.huntId,
    uploadUrl: "/api/submissions/finalize",
    alreadySubmitted: false
  };
}

function parseDataUrl(dataUrl: string) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Invalid image payload.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

export async function finalizeSubmission(input: FinalizeSubmissionInput & { imageDataUrl: string }) {
  const admin = requireAdmin();
  const submissionRow = await getExistingSubmission(input.identityId, input.huntId);
  if (!submissionRow || String(submissionRow.id) !== input.submissionId) {
    throw new Error("Submission not found.");
  }

  const huntRow = await getHuntById(input.huntId);
  if (!huntRow) {
    throw new Error("Hunt not found.");
  }

  const parsed = parseDataUrl(input.imageDataUrl);
  const storagePath = `${input.huntId}/${input.submissionId}/${input.fileName}`;
  const upload = await admin.storage.from(DEFAULT_BUCKET).upload(storagePath, parsed.buffer, {
    contentType: parsed.mimeType,
    upsert: true
  });

  if (upload.error) {
    throw upload.error;
  }

  const verification = await verifySubmissionTiming({
    imageBuffer: parsed.buffer,
    clientCapturedAt: input.capturedAt,
    dropAt: String(huntRow.drop_at),
    closesAt: String(huntRow.closes_at)
  });

  let moderationStatus: Submission["moderationStatus"] = parsed.mimeType.startsWith("image/") ? "approved" : "blocked";
  let reviewNotes = verification.reviewNotes;
  try {
    const moderation = await moderateSubmissionImage({
      challenge: String(huntRow.challenge ?? "Daily scavenger hunt"),
      imageDataUrl: input.imageDataUrl
    });
    moderationStatus = moderation.moderationStatus;
    reviewNotes = `${verification.reviewNotes} ${moderation.reviewNotes}`.trim();
  } catch (error) {
    reviewNotes = `${verification.reviewNotes} ${error instanceof Error ? `OpenAI moderation unavailable: ${error.message}` : "OpenAI moderation unavailable."}`.trim();
  }

  const { data, error } = await admin.from("submissions").update({
    file_name: input.fileName,
    mime_type: parsed.mimeType,
    file_size: input.fileSize,
    width: input.width,
    height: input.height,
    storage_path: storagePath,
    captured_at: verification.chosenCapturedAt ?? input.capturedAt ?? null,
    accepted_at: new Date().toISOString(),
    moderation_status: moderationStatus,
    verification_status: verification.verificationStatus,
    review_notes: reviewNotes
  }).eq("id", input.submissionId).select("*").single();

  if (error) {
    throw error;
  }

  return submissionFromRow(data as Row);
}

export async function setReminder(identityId: string, enabled: boolean, email?: string) {
  const admin = requireAdmin();
  const { data: profile } = await admin.from("profiles").select("id,email").eq("id", identityId).maybeSingle();

  if (profile?.id) {
    const { error } = await admin.from("profiles").update({ reminder_enabled: enabled }).eq("id", identityId);
    if (error) {
      throw error;
    }
    return enabled;
  }

  if (!email) {
    return false;
  }

  const { error } = await admin.from("reminder_subscriptions").upsert({
    email,
    identity_key: identityId,
    enabled
  }, { onConflict: "email" });

  if (error) {
    throw error;
  }

  return enabled;
}

export async function updateHunt(input: { challenge: string; challengeHint: string; approvedSource: Hunt["approvedSource"]; }) {
  const admin = requireAdmin();
  const current = await getCurrentHuntRow();
  if (!current) {
    const now = Date.now();
    const { data, error } = await admin.from("hunts").insert({
      challenge: input.challenge,
      challenge_hint: input.challengeHint,
      approved_source: input.approvedSource,
      drop_at: new Date(now + 1000 * 60 * 60 * 3).toISOString(),
      closes_at: new Date(now + 1000 * 60 * 60 * 4).toISOString(),
      results_at: new Date(now + 1000 * 60 * 60 * 5).toISOString(),
      status: "scheduled"
    }).select("*").single();

    if (error) {
      throw error;
    }

    return asHunt(data as Row, 0);
  }

  const { data, error } = await admin.from("hunts").update({
    challenge: input.challenge,
    challenge_hint: input.challengeHint,
    approved_source: input.approvedSource
  }).eq("id", current.id).select("*").single();

  if (error) {
    throw error;
  }

  return asHunt(data as Row, await countSubmissions(String(current.id)));
}

export async function createChallengeSuggestions(count = 3) {
  const admin = requireAdmin();
  const { data: existingRows } = await admin.from("challenge_suggestions").select("title").order("created_at", { ascending: false }).limit(25);
  const suggestions = await generateSuggestionsWithOpenAI({
    count,
    existingTitles: (existingRows ?? []).map((row) => String((row as Row).title ?? ""))
  });

  if (suggestions.length > 0) {
    const { error } = await admin.from("challenge_suggestions").insert(
      suggestions.map((suggestion) => ({
        title: suggestion.title,
        rationale: suggestion.rationale,
        source_model: suggestion.sourceModel,
        approved: suggestion.approved
      }))
    );
    if (error) {
      throw error;
    }
  }

  const { data } = await admin.from("challenge_suggestions").select("*").order("created_at", { ascending: false }).limit(8);
  return (data ?? []).map((row) => ({
    id: String((row as Row).id),
    title: String((row as Row).title),
    rationale: String((row as Row).rationale),
    sourceModel: String((row as Row).source_model),
    approved: Boolean((row as Row).approved)
  } satisfies ChallengeSuggestion));
}

export async function listReminderRecipients() {
  const admin = requireAdmin();
  const { data: profiles } = await admin.from("profiles").select("email").eq("reminder_enabled", true);
  const { data: guests } = await admin.from("reminder_subscriptions").select("email").eq("enabled", true);
  const emails = new Set<string>();
  for (const row of profiles ?? []) {
    if (row.email) {
      emails.add(String(row.email));
    }
  }
  for (const row of guests ?? []) {
    if (row.email) {
      emails.add(String(row.email));
    }
  }
  return Array.from(emails).map((email) => ({ email }));
}

export async function publishResults() {
  const admin = requireAdmin();
  const hunt = await getCurrentHunt();
  if (!hunt.id || hunt.id === "fallback-hunt") {
    return [];
  }

  const existing = await getPublishedResultsForHunt(hunt.id, hunt.dropAt);
  if (existing.length === 0) {
    const { data: candidates, error } = await admin
      .from("submissions")
      .select("id")
      .eq("hunt_id", hunt.id)
      .eq("moderation_status", "approved")
      .eq("verification_status", "verified")
      .order("accepted_at", { ascending: true })
      .limit(5);

    if (error) {
      throw error;
    }

    if ((candidates ?? []).length > 0) {
      const rows = (candidates ?? []).map((candidate, index) => ({
        hunt_id: hunt.id,
        submission_id: candidate.id,
        rank: index + 1,
        published_at: new Date().toISOString()
      }));
      const insert = await admin.from("daily_results").upsert(rows, { onConflict: "submission_id" });
      if (insert.error) {
        throw insert.error;
      }
    }
  }

  const update = await admin.from("hunts").update({ status: "results_published" }).eq("id", hunt.id);
  if (update.error) {
    throw update.error;
  }

  return getPublishedResultsForHunt(hunt.id, hunt.dropAt);
}

export async function reviewSubmission(input: ReviewSubmissionInput) {
  const admin = requireAdmin();
  const { data, error } = await admin.from("submissions").update({
    moderation_status: input.moderationStatus,
    verification_status: input.verificationStatus,
    review_notes: input.reviewNotes ?? ""
  }).eq("id", input.submissionId).select("*").single();

  if (error) {
    throw error;
  }

  return submissionFromRow(data as Row);
}

export async function getSubmissionSummary() {
  const admin = requireAdmin();
  const { data, error } = await admin.from("submissions").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) {
    throw error;
  }
  return (data ?? []).map((row) => submissionFromRow(row as Row));
}
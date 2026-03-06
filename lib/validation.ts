import { z } from "zod";

export const createIntentSchema = z.object({
  huntId: z.string(),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive()
});

export const finalizeSubmissionSchema = z.object({
  submissionId: z.string(),
  huntId: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number().nonnegative(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  capturedAt: z.string().datetime().optional(),
  imageDataUrl: z.string().min(10)
});

export const createShareSchema = z.object({
  submissionId: z.string()
});

export const reminderSchema = z.object({
  enabled: z.boolean(),
  email: z.string().email().optional()
});

export const magicLinkSchema = z.object({
  email: z.string().email(),
  next: z.string().optional()
});

export const updateHuntSchema = z.object({
  challenge: z.string().min(3),
  challengeHint: z.string().min(3),
  previewState: z.enum(["waiting", "live", "submitted", "results-soon", "results-out"]).optional(),
  approvedSource: z.enum(["manual", "ai-suggested"]).default("manual")
});

export const reviewSubmissionSchema = z.object({
  moderationStatus: z.enum(["approved", "flagged", "blocked"]),
  verificationStatus: z.enum(["verified", "needs_manual_review", "rejected"]),
  reviewNotes: z.string().optional().default("")
});
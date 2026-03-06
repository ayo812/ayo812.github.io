import * as exifr from "exifr";

import { type SubmissionVerificationStatus } from "@/lib/types";

const MAX_CAPTURE_MISMATCH_MS = 10 * 60 * 1000;

type VerificationResult = {
  verificationStatus: SubmissionVerificationStatus;
  chosenCapturedAt?: string;
  reviewNotes: string;
};

function asDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  return undefined;
}

async function extractExifDate(buffer: Buffer) {
  try {
    const metadata = await exifr.parse(buffer, ["DateTimeOriginal", "CreateDate", "ModifyDate"]);
    const capturedAt = asDate(metadata?.DateTimeOriginal) ?? asDate(metadata?.CreateDate) ?? asDate(metadata?.ModifyDate);
    return capturedAt;
  } catch {
    return undefined;
  }
}

export async function verifySubmissionTiming(input: {
  imageBuffer: Buffer;
  clientCapturedAt?: string;
  dropAt: string;
  closesAt: string;
}) : Promise<VerificationResult> {
  const exifDate = await extractExifDate(input.imageBuffer);
  const clientDate = input.clientCapturedAt ? new Date(input.clientCapturedAt) : undefined;
  const dropAtMs = new Date(input.dropAt).getTime();
  const closesAtMs = new Date(input.closesAt).getTime();

  if (exifDate) {
    const exifMs = exifDate.getTime();
    const inWindow = exifMs >= dropAtMs && exifMs <= closesAtMs;
    const mismatchMs = clientDate ? Math.abs(clientDate.getTime() - exifMs) : 0;

    if (!inWindow) {
      return {
        verificationStatus: "rejected",
        chosenCapturedAt: exifDate.toISOString(),
        reviewNotes: "EXIF capture time is outside the active hunt window."
      };
    }

    if (clientDate && mismatchMs > MAX_CAPTURE_MISMATCH_MS) {
      return {
        verificationStatus: "needs_manual_review",
        chosenCapturedAt: exifDate.toISOString(),
        reviewNotes: "EXIF capture time is valid, but it does not closely match the client-provided timestamp."
      };
    }

    return {
      verificationStatus: "verified",
      chosenCapturedAt: exifDate.toISOString(),
      reviewNotes: "EXIF capture time confirms the photo was taken during the hunt window."
    };
  }

  if (clientDate && !Number.isNaN(clientDate.getTime())) {
    return {
      verificationStatus: "needs_manual_review",
      chosenCapturedAt: clientDate.toISOString(),
      reviewNotes: "No reliable EXIF capture timestamp was found; submission requires manual review."
    };
  }

  return {
    verificationStatus: "needs_manual_review",
    reviewNotes: "No capture timestamp metadata was available; submission requires manual review."
  };
}
import { NextResponse } from "next/server";

import { getIdentity } from "@/lib/identity";
import { repository } from "@/lib/repository";
import { finalizeSubmissionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = finalizeSubmissionSchema.parse(await request.json());
  const identity = await getIdentity();
  const submission = await repository.finalizeSubmission({
    identityId: identity.id,
    submissionId: payload.submissionId,
    huntId: payload.huntId,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    fileSize: payload.fileSize,
    width: payload.width,
    height: payload.height,
    capturedAt: payload.capturedAt,
    imageDataUrl: payload.imageDataUrl
  });

  return NextResponse.json(submission);
}
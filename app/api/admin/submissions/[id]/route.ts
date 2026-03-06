import { NextResponse } from "next/server";

import { repository } from "@/lib/repository";
import { reviewSubmissionSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params;
  const payload = reviewSubmissionSchema.parse(await request.json());
  const reviewed = await repository.reviewSubmission({
    submissionId: routeParams.id,
    moderationStatus: payload.moderationStatus,
    verificationStatus: payload.verificationStatus,
    reviewNotes: payload.reviewNotes
  });

  return NextResponse.json(reviewed);
}


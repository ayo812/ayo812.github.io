import { NextResponse } from "next/server";

import { getIdentity } from "@/lib/identity";
import { repository } from "@/lib/repository";
import { createIntentSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = createIntentSchema.parse(await request.json());
  const identity = await getIdentity();
  const intent = await repository.createSubmissionIntent({
    identity,
    huntId: payload.huntId,
    fileName: payload.fileName,
    fileSize: payload.fileSize
  });

  return NextResponse.json(intent);
}


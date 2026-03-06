import { NextResponse } from "next/server";

import { getIdentity } from "@/lib/identity";
import { repository } from "@/lib/repository";
import { createShareSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = createShareSchema.parse(await request.json());
    const identity = await getIdentity();
    const result = await repository.createResultShare({
      identityId: identity.id,
      submissionId: payload.submissionId
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create the shared result link." },
      { status: 400 }
    );
  }
}
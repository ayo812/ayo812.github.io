import { NextResponse } from "next/server";

import { getIdentity } from "@/lib/identity";
import { repository } from "@/lib/repository";
import { reminderSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = reminderSchema.parse(await request.json());
  const identity = await getIdentity();
  const enabled = await repository.setReminder(identity.id, body.enabled, body.email ?? identity.email);

  return NextResponse.json({ enabled });
}
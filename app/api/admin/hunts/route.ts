import { NextResponse } from "next/server";

import { repository } from "@/lib/repository";
import { updateHuntSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = updateHuntSchema.parse(await request.json());
  const hunt = await repository.updateHunt(payload);
  return NextResponse.json(hunt);
}


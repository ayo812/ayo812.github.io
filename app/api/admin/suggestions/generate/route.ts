import { NextResponse } from "next/server";

import { repository } from "@/lib/repository";

export async function POST() {
  const suggestions = await repository.createChallengeSuggestions(3);
  return NextResponse.json(suggestions);
}
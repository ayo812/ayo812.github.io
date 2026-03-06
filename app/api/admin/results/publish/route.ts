import { NextResponse } from "next/server";

import { repository } from "@/lib/repository";

export async function POST() {
  const results = await repository.publishResults();
  return NextResponse.json(results);
}


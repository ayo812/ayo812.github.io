import { NextResponse } from "next/server";

import { repository } from "@/lib/repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const range = (url.searchParams.get("range") ?? "all-time") as Parameters<typeof repository.getLeaderboardData>[0];
  const rows = await repository.getLeaderboardData(range);
  return NextResponse.json(rows);
}


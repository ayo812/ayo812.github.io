import { NextResponse } from "next/server";

import { getIdentity } from "@/lib/identity";
import { repository } from "@/lib/repository";
import { isPreviewState } from "@/lib/time";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const previewState = isPreviewState(url.searchParams.get("state") ?? undefined)
    ? (url.searchParams.get("state") as Parameters<typeof repository.getCurrentHunt>[0])
    : undefined;
  const identity = await getIdentity();
  const hunt = await repository.getCurrentHunt(previewState);
  const data = await repository.getHomePageData(identity, previewState);

  return NextResponse.json({ hunt, homeState: data.homeState, submission: data.submission });
}


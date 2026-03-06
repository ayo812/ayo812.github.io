import { type Hunt, type PlayerResultSummary } from "@/lib/types";
import { getAppBaseUrl } from "@/lib/site";

export function formatOrdinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export function buildShareUrl(shareId: string, shareBaseUrl = getAppBaseUrl()) {
  return `${shareBaseUrl.replace(/\/$/, "")}/result/${shareId}`;
}

export function buildShareText(input: { overallRank: number; totalRanked: number; challenge: string; shareUrl: string }) {
  return [
    `scaveng.io ${formatOrdinal(input.overallRank)}/${input.totalRanked}`,
    `Today's hunt: ${input.challenge}`,
    input.shareUrl
  ].join("\n");
}

export function buildPlayerResultSummary(input: {
  submissionId: string;
  overallRank: number;
  totalRanked: number;
  isTopFive: boolean;
  hunt: Hunt;
  shareId?: string;
  shareBaseUrl?: string;
}): PlayerResultSummary {
  const shareUrl = input.shareId ? buildShareUrl(input.shareId, input.shareBaseUrl) : undefined;
  const shareText = shareUrl
    ? buildShareText({
        overallRank: input.overallRank,
        totalRanked: input.totalRanked,
        challenge: input.hunt.challenge,
        shareUrl
      })
    : undefined;

  return {
    submissionId: input.submissionId,
    overallRank: input.overallRank,
    totalRanked: input.totalRanked,
    isTopFive: input.isTopFive,
    shareId: input.shareId,
    shareText,
    shareUrl
  };
}
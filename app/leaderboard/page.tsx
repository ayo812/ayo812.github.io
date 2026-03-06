import { LeaderboardClient } from "@/components/leaderboard-page";
import { repository } from "@/lib/repository";
import { type LeaderboardRange } from "@/lib/types";

export default async function LeaderboardPage() {
  const datasets = {
    "all-time": await repository.getLeaderboardData("all-time"),
    "this-month": await repository.getLeaderboardData("this-month"),
    "this-week": await repository.getLeaderboardData("this-week")
  } satisfies Record<LeaderboardRange, Awaited<ReturnType<typeof repository.getLeaderboardData>>>;

  return <LeaderboardClient initialRange="all-time" datasets={datasets} />;
}


"use client";

import { useState } from "react";

import { type LeaderboardEntry, type LeaderboardRange } from "@/lib/types";

const ranges: { value: LeaderboardRange; label: string }[] = [
  { value: "all-time", label: "All time" },
  { value: "this-month", label: "This month" },
  { value: "this-week", label: "This week" }
];

export function LeaderboardClient({ initialRange, datasets }: { initialRange: LeaderboardRange; datasets: Record<LeaderboardRange, LeaderboardEntry[]>; }) {
  const [activeRange, setActiveRange] = useState<LeaderboardRange>(initialRange);
  const rows = datasets[activeRange];

  return (
    <div className="page shell">
      <a className="back-btn" href="/">? Back</a>
      <div className="lb-title">Leaderboard</div>
      <div className="lb-sub">Ranked by all published top-five finishes, with wins as the headline stat.</div>
      <div className="lb-tabs">
        {ranges.map((range) => (
          <button key={range.value} className={`lb-tab ${activeRange === range.value ? "active" : ""}`} type="button" onClick={() => setActiveRange(range.value)}>
            {range.label}
          </button>
        ))}
      </div>
      <div className="leaderboard-stack">
        {rows.map((entry, index) => (
          <div className={`lb-row ${index === 0 ? "top" : ""}`} key={`${activeRange}-${entry.name}`}>
            <div className="lb-position">{index === 0 ? "??" : index + 1}</div>
            <div className="lb-avatar">{entry.emoji}</div>
            <div className="lb-name-wrap">
              <div className="lb-name">{entry.name}</div>
              <div className="lb-helper">{entry.topFiveFinishes} top-five finishes</div>
            </div>
            <div>
              <div className="lb-wins">{entry.wins}</div>
              <div className="lb-wins-label">wins</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


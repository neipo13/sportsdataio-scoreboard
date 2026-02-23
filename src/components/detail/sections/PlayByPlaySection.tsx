"use client";

import type { FetchContext } from "../../../lib/detail-registry";

interface Play {
  PlayID?: number;
  QuarterName?: string | null;
  Sequence?: number;
  TimeRemainingMinutes?: number | null;
  TimeRemainingSeconds?: number | null;
  AwayTeamScore?: number | null;
  HomeTeamScore?: number | null;
  Category?: string | null;
  Type?: string | null;
  Team?: string | null;
  Description?: string | null;
  Points?: number | null;
  ShotMade?: boolean | null;
}

interface PlayByPlayData {
  Game?: {
    HomeTeam?: string | null;
    AwayTeam?: string | null;
  };
  Plays?: Play[];
}

function formatTime(min: number | null | undefined, sec: number | null | undefined): string {
  if (min == null || sec == null) return "";
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function playCategoryColor(category: string | null | undefined): string {
  switch (category?.toLowerCase()) {
    case "shot":
      return "text-blue-600 dark:text-blue-400";
    case "foul":
      return "text-red-600 dark:text-red-400";
    case "turnover":
      return "text-amber-600 dark:text-amber-400";
    case "rebound":
      return "text-green-600 dark:text-green-400";
    default:
      return "text-zinc-500 dark:text-zinc-400";
  }
}

export function PlayByPlaySection({ data }: { data: unknown; ctx: FetchContext }) {
  const pbp = data as PlayByPlayData;
  const plays = pbp?.Plays ?? [];

  if (plays.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">
        No play-by-play data available
      </p>
    );
  }

  // Sort by sequence descending (most recent first)
  const sorted = [...plays].sort((a, b) => (b.Sequence ?? 0) - (a.Sequence ?? 0));

  // Group by quarter
  const byQuarter = new Map<string, Play[]>();
  for (const play of sorted) {
    const q = play.QuarterName ?? "?";
    const list = byQuarter.get(q) ?? [];
    list.push(play);
    byQuarter.set(q, list);
  }

  return (
    <div className="space-y-4">
      {Array.from(byQuarter.entries()).map(([quarter, quarterPlays]) => (
        <div key={quarter}>
          <h4 className="sticky top-0 z-10 mb-2 bg-white py-1 text-xs font-semibold uppercase text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            {/^\d+$/.test(quarter) ? `Q${quarter}` : quarter}
          </h4>
          <div className="space-y-0.5">
            {quarterPlays.map((play) => (
              <div
                key={play.PlayID ?? play.Sequence}
                className="flex items-start gap-2 rounded px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <span className="w-10 shrink-0 tabular-nums text-zinc-400">
                  {formatTime(play.TimeRemainingMinutes, play.TimeRemainingSeconds)}
                </span>
                <span className={`w-10 shrink-0 font-medium ${playCategoryColor(play.Category)}`}>
                  {play.Team ?? ""}
                </span>
                <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                  {play.Description ?? play.Type ?? ""}
                </span>
                {play.AwayTeamScore != null && play.HomeTeamScore != null && (
                  <span className="shrink-0 tabular-nums text-zinc-500">
                    {play.AwayTeamScore}-{play.HomeTeamScore}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

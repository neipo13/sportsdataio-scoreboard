"use client";

import type { FetchContext } from "../../../lib/detail-registry";
import { formatClock, ordinal, EmptyPlayByPlay, PeriodHeader } from "./pbp-utils";

interface ScoringPlay {
  AwayScore?: number | null;
  HomeScore?: number | null;
}

interface Play {
  PlayID?: number;
  QuarterName?: string | null;
  Sequence?: number;
  TimeRemainingMinutes?: number | null;
  TimeRemainingSeconds?: number | null;
  Down?: number | null;
  Distance?: number | string | null;
  YardLine?: number | null;
  YardLineTerritory?: string | null;
  YardsToEndZone?: number | null;
  YardsGained?: number | null;
  Team?: string | null;
  Type?: string | null;
  Description?: string | null;
  IsScoringPlay?: boolean | null;
  ScoringPlay?: ScoringPlay | null;
}

interface PlayByPlayData {
  Score?: {
    HomeTeam?: string | null;
    AwayTeam?: string | null;
  };
  Plays?: Play[];
}

function playTypeColor(type: string | null | undefined): string {
  switch (type) {
    case "Rush":
      return "text-green-600 dark:text-green-400";
    case "PassCompleted":
      return "text-blue-600 dark:text-blue-400";
    case "PassIncomplete":
    case "PassIntercepted":
      return "text-red-600 dark:text-red-400";
    case "Sack":
      return "text-red-700 dark:text-red-500";
    case "Penalty":
      return "text-amber-600 dark:text-amber-400";
    case "Kickoff":
    case "Punt":
      return "text-purple-600 dark:text-purple-400";
    case "FieldGoal":
    case "ExtraPoint":
      return "text-emerald-600 dark:text-emerald-400";
    default:
      return "text-zinc-500 dark:text-zinc-400";
  }
}

function formatDownDistance(down: number | null | undefined, distance: number | string | null | undefined): string {
  if (down == null) return "";
  const distStr = distance === 0 || distance === "Goal" ? "Goal" : String(distance ?? "");
  return `${ordinal(down)} & ${distStr}`;
}

function formatYardLine(territory: string | null | undefined, yardLine: number | null | undefined): string {
  if (territory == null || yardLine == null) return "";
  return `${territory} ${yardLine}`;
}

export function FootballPlayByPlaySection({ data }: { data: unknown; ctx: FetchContext }) {
  const pbp = data as PlayByPlayData;
  const plays = pbp?.Plays ?? [];

  if (plays.length === 0) {
    return <EmptyPlayByPlay />;
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
          <PeriodHeader>
            {/^\d+$/.test(quarter) ? `Q${quarter}` : quarter}
          </PeriodHeader>
          <div className="space-y-0.5">
            {quarterPlays.map((play) => {
              const isScoring = play.IsScoringPlay === true;
              return (
                <div
                  key={play.PlayID ?? play.Sequence}
                  className={`flex items-start gap-2 rounded px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                    isScoring ? "bg-amber-50 dark:bg-amber-900/20" : ""
                  }`}
                >
                  {/* Clock */}
                  <span className="w-10 shrink-0 tabular-nums text-zinc-400">
                    {formatClock(play.TimeRemainingMinutes, play.TimeRemainingSeconds)}
                  </span>

                  {/* Down & Distance */}
                  <span className="w-16 shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatDownDistance(play.Down, play.Distance)}
                  </span>

                  {/* Yard Line */}
                  <span className="w-12 shrink-0 tabular-nums text-zinc-400">
                    {formatYardLine(play.YardLineTerritory, play.YardLine)}
                  </span>

                  {/* Team */}
                  <span className={`w-10 shrink-0 font-medium ${playTypeColor(play.Type)}`}>
                    {play.Team ?? ""}
                  </span>

                  {/* Description */}
                  <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                    {play.Description ?? play.Type ?? ""}
                  </span>

                  {/* Yards Gained */}
                  {play.YardsGained != null && (
                    <span
                      className={`w-8 shrink-0 text-right tabular-nums font-medium ${
                        play.YardsGained > 0
                          ? "text-green-600 dark:text-green-400"
                          : play.YardsGained < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-zinc-400"
                      }`}
                    >
                      {play.YardsGained > 0 ? "+" : ""}
                      {play.YardsGained}
                    </span>
                  )}

                  {/* Score (only on scoring plays) */}
                  {play.ScoringPlay?.AwayScore != null && play.ScoringPlay?.HomeScore != null && (
                    <span className="shrink-0 tabular-nums font-semibold text-zinc-600 dark:text-zinc-300">
                      {play.ScoringPlay.AwayScore}-{play.ScoringPlay.HomeScore}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import type { FetchContext } from "../../../lib/detail-registry";
import { ordinal, EmptyPlayByPlay, PeriodHeader } from "./pbp-utils";

interface Play {
  PlayID?: number;
  InningNumber?: number | null;
  InningHalf?: string | null; // "T" or "B"
  PlayNumber?: number | null;
  HitterName?: string | null;
  HitterPosition?: string | null;
  HitterBatHand?: string | null;
  PitcherName?: string | null;
  PitcherThrowHand?: string | null;
  Outs?: number | null;
  Balls?: number | null;
  Strikes?: number | null;
  Result?: string | null;
  Description?: string | null;
  RunsBattedIn?: number | null;
  AtBat?: boolean | null;
  AwayTeamRuns?: number | null;
  HomeTeamRuns?: number | null;
  NumberOfOutsOnPlay?: number | null;
}

interface PlayByPlayData {
  Game?: {
    HomeTeam?: string | null;
    AwayTeam?: string | null;
  };
  Plays?: Play[];
}

function resultColor(result: string | null | undefined): string {
  switch (result) {
    case "Home Run":
      return "text-green-600 dark:text-green-400 font-bold";
    case "Single":
    case "Double":
    case "Triple":
      return "text-blue-600 dark:text-blue-400";
    case "Walk":
    case "Hit By Pitch":
      return "text-blue-500 dark:text-blue-300";
    case "Strikeout":
    case "Strikeout Looking":
    case "Strikeout Swinging":
      return "text-red-600 dark:text-red-400";
    case "Error":
      return "text-amber-600 dark:text-amber-400";
    case "Fly Out":
    case "Ground Out":
    case "Line Out":
    case "Pop Out":
    case "Double Play":
    case "Triple Play":
    case "Fielders Choice":
    case "Sacrifice Fly":
    case "Sacrifice Bunt":
      return "text-zinc-500 dark:text-zinc-400";
    default:
      return "text-zinc-600 dark:text-zinc-300";
  }
}

function formatInningHalf(half: string | null | undefined, inning: number): string {
  const prefix = half === "T" ? "Top" : "Bottom";
  return `${prefix} ${ordinal(inning)}`;
}

export function BaseballPlayByPlaySection({ data }: { data: unknown; ctx: FetchContext }) {
  const pbp = data as PlayByPlayData;
  const plays = pbp?.Plays ?? [];

  if (plays.length === 0) {
    return <EmptyPlayByPlay />;
  }

  // Sort by play number descending (most recent first)
  const sorted = [...plays].sort((a, b) => (b.PlayNumber ?? 0) - (a.PlayNumber ?? 0));

  // Group by inning half: "T1", "B1", "T2", etc.
  const byInning = new Map<string, Play[]>();
  for (const play of sorted) {
    const key = `${play.InningHalf ?? "?"}${play.InningNumber ?? 0}`;
    const list = byInning.get(key) ?? [];
    list.push(play);
    byInning.set(key, list);
  }

  return (
    <div className="space-y-4">
      {Array.from(byInning.entries()).map(([key, inningPlays]) => {
        const first = inningPlays[0];
        const label = first?.InningNumber
          ? formatInningHalf(first.InningHalf, first.InningNumber)
          : key;

        return (
          <div key={key}>
            <PeriodHeader>{label}</PeriodHeader>
            <div className="space-y-0.5">
              {inningPlays.map((play) => {
                const isHR = play.Result === "Home Run";
                return (
                  <div
                    key={play.PlayID ?? play.PlayNumber}
                    className={`flex items-start gap-2 rounded px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                      isHR ? "bg-green-50 dark:bg-green-900/20" : ""
                    }`}
                  >
                    {/* Outs */}
                    <span className="w-10 shrink-0 tabular-nums text-zinc-400">
                      {play.Outs != null ? `${play.Outs} out` : ""}
                    </span>

                    {/* Count (B-S) */}
                    <span className="w-8 shrink-0 tabular-nums text-zinc-400">
                      {play.Balls != null && play.Strikes != null
                        ? `${play.Balls}-${play.Strikes}`
                        : ""}
                    </span>

                    {/* Batter */}
                    <span className="w-24 shrink-0 truncate font-medium text-zinc-700 dark:text-zinc-300">
                      {play.HitterName ?? ""}
                    </span>

                    {/* Result */}
                    <span className={`w-24 shrink-0 ${resultColor(play.Result)}`}>
                      {play.Result ?? ""}
                    </span>

                    {/* Description */}
                    <span className="flex-1 text-zinc-600 dark:text-zinc-400">
                      {play.Description ?? ""}
                    </span>

                    {/* RBI badge */}
                    {play.RunsBattedIn != null && play.RunsBattedIn > 0 && (
                      <span className="shrink-0 rounded bg-green-200 px-1 text-[10px] font-semibold text-green-800 dark:bg-green-800 dark:text-green-200">
                        {play.RunsBattedIn} RBI
                      </span>
                    )}

                    {/* Score */}
                    {play.AwayTeamRuns != null && play.HomeTeamRuns != null && (
                      <span className="shrink-0 tabular-nums text-zinc-500">
                        {play.AwayTeamRuns}-{play.HomeTeamRuns}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

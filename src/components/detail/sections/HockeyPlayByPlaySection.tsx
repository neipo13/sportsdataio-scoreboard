"use client";

import type { FetchContext } from "../../../lib/detail-registry";
import { formatClock, ordinal, EmptyPlayByPlay, PeriodHeader } from "./pbp-utils";

interface Play {
  PlayID?: number;
  PeriodName?: string | null;
  Sequence?: number;
  ClockMinutes?: number | null;
  ClockSeconds?: number | null;
  AwayTeamScore?: number | null;
  HomeTeamScore?: number | null;
  Category?: string | null;
  Type?: string | null;
  Team?: string | null;
  Opponent?: string | null;
  Description?: string | null;
  PowerPlayTeam?: string | null;
  FirstAssistedByPlayerID?: number | null;
  SecondAssistedByPlayerID?: number | null;
}

interface PlayByPlayData {
  Game?: {
    HomeTeam?: string | null;
    AwayTeam?: string | null;
  };
  Plays?: Play[];
}

function categoryColor(category: string | null | undefined): string {
  switch (category?.toLowerCase()) {
    case "goal":
      return "text-green-600 dark:text-green-400 font-bold";
    case "shot":
      return "text-blue-600 dark:text-blue-400";
    case "penalty":
      return "text-red-600 dark:text-red-400";
    case "hit":
      return "text-amber-600 dark:text-amber-400";
    case "faceoff":
      return "text-purple-600 dark:text-purple-400";
    case "block":
      return "text-cyan-600 dark:text-cyan-400";
    case "stoppage":
    case "period":
      return "text-zinc-500 dark:text-zinc-400";
    default:
      return "text-zinc-500 dark:text-zinc-400";
  }
}

function formatPeriodName(name: string): string {
  const n = parseInt(name, 10);
  if (!isNaN(n) && n >= 1 && n <= 3) {
    return `${ordinal(n)} Period`;
  }
  if (name.toLowerCase() === "ot" || name.toLowerCase() === "overtime") return "Overtime";
  if (name.toLowerCase().startsWith("ot")) return `Overtime ${name.slice(2)}`;
  if (name.toLowerCase() === "so" || name.toLowerCase() === "shootout") return "Shootout";
  return name;
}

export function HockeyPlayByPlaySection({ data }: { data: unknown; ctx: FetchContext }) {
  const pbp = data as PlayByPlayData;
  const plays = pbp?.Plays ?? [];

  if (plays.length === 0) {
    return <EmptyPlayByPlay />;
  }

  // Sort by sequence descending (most recent first)
  const sorted = [...plays].sort((a, b) => (b.Sequence ?? 0) - (a.Sequence ?? 0));

  // Group by period
  const byPeriod = new Map<string, Play[]>();
  for (const play of sorted) {
    const p = play.PeriodName ?? "?";
    const list = byPeriod.get(p) ?? [];
    list.push(play);
    byPeriod.set(p, list);
  }

  return (
    <div className="space-y-4">
      {Array.from(byPeriod.entries()).map(([period, periodPlays]) => (
        <div key={period}>
          <PeriodHeader>{formatPeriodName(period)}</PeriodHeader>
          <div className="space-y-0.5">
            {periodPlays.map((play) => {
              const isGoal = play.Category?.toLowerCase() === "goal";
              return (
                <div
                  key={play.PlayID ?? play.Sequence}
                  className={`flex items-start gap-2 rounded px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                    isGoal ? "bg-green-50 dark:bg-green-900/20" : ""
                  }`}
                >
                  {/* Elapsed clock */}
                  <span className="w-10 shrink-0 tabular-nums text-zinc-400">
                    {formatClock(play.ClockMinutes, play.ClockSeconds)}
                  </span>

                  {/* Team + power play badge */}
                  <span className={`w-14 shrink-0 font-medium ${categoryColor(play.Category)}`}>
                    {play.Team ?? ""}
                    {play.PowerPlayTeam && (
                      <span className="ml-1 inline-block rounded bg-amber-200 px-1 text-[10px] font-semibold text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                        PP
                      </span>
                    )}
                  </span>

                  {/* Category */}
                  <span className={`w-16 shrink-0 ${categoryColor(play.Category)}`}>
                    {play.Category ?? ""}
                  </span>

                  {/* Description */}
                  <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                    {play.Description ?? play.Type ?? ""}
                  </span>

                  {/* Score */}
                  {play.AwayTeamScore != null && play.HomeTeamScore != null && (
                    <span className={`shrink-0 tabular-nums ${isGoal ? "font-semibold text-zinc-600 dark:text-zinc-300" : "text-zinc-500"}`}>
                      {play.AwayTeamScore}-{play.HomeTeamScore}
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

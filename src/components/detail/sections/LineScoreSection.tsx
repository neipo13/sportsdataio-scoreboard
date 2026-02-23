"use client";

import type { FetchContext } from "../../../lib/detail-registry";

interface NormalizedPeriod {
  key: string;      // display label: "Q1", "1st", "1", etc.
  awayScore: number | null;
  homeScore: number | null;
  sortOrder: number;
}

interface GameInfo {
  HomeTeam?: string | null;
  AwayTeam?: string | null;
  HomeTeamScore?: number | null;
  AwayTeamScore?: number | null;
  // MLB-specific
  HomeTeamRuns?: number | null;
  AwayTeamRuns?: number | null;
  // NFL Score-level
  HomeScore?: number | null;
  AwayScore?: number | null;
}

interface BoxScoreData {
  Game?: GameInfo;
  Score?: GameInfo; // NFL uses Score
  Quarters?: Array<{
    Number?: number;
    Name?: string | null;
    AwayScore?: number | null;
    HomeScore?: number | null;
    AwayTeamScore?: number | null;
    HomeTeamScore?: number | null;
  }>;
  Periods?: Array<{
    Number?: number;
    Name?: string | null;
    AwayScore?: number | null;
    HomeScore?: number | null;
  }>;
  Innings?: Array<{
    InningNumber?: number;
    AwayTeamRuns?: number | null;
    HomeTeamRuns?: number | null;
  }>;
}

function normalizePeriods(data: BoxScoreData, sportKey: string): NormalizedPeriod[] {
  switch (sportKey) {
    case "nba":
    case "wnba": {
      return (data.Quarters ?? []).map((q) => ({
        key: q.Name ?? `Q${q.Number}`,
        awayScore: q.AwayScore ?? null,
        homeScore: q.HomeScore ?? null,
        sortOrder: q.Number ?? 0,
      }));
    }
    case "nfl": {
      return (data.Quarters ?? []).map((q) => ({
        key: q.Name ?? `Q${q.Number}`,
        awayScore: q.AwayTeamScore ?? q.AwayScore ?? null,
        homeScore: q.HomeTeamScore ?? q.HomeScore ?? null,
        sortOrder: q.Number ?? 0,
      }));
    }
    case "nhl": {
      // NHL has no Number — use Name ("1","2","3","OT","SO")
      const nhlOrder: Record<string, number> = { "1": 1, "2": 2, "3": 3 };
      return (data.Periods ?? []).map((p) => {
        const name = p.Name ?? "?";
        const order = nhlOrder[name] ?? (name.startsWith("OT") ? 10 + (parseInt(name.slice(2)) || 1) : 20);
        return {
          key: name === "1" || name === "2" || name === "3" ? `${name}st`.replace("2st", "2nd").replace("3st", "3rd") : name,
          awayScore: p.AwayScore ?? null,
          homeScore: p.HomeScore ?? null,
          sortOrder: order,
        };
      });
    }
    case "cbb":
    case "cfb": {
      return (data.Periods ?? []).map((p) => ({
        key: p.Name ?? `P${p.Number}`,
        awayScore: p.AwayScore ?? null,
        homeScore: p.HomeScore ?? null,
        sortOrder: p.Number ?? 0,
      }));
    }
    case "mlb": {
      return (data.Innings ?? []).map((inn) => ({
        key: `${inn.InningNumber ?? "?"}`,
        awayScore: inn.AwayTeamRuns ?? null,
        homeScore: inn.HomeTeamRuns ?? null,
        sortOrder: inn.InningNumber ?? 0,
      }));
    }
    default:
      return [];
  }
}

export function LineScoreSection({ data, ctx }: { data: unknown; ctx: FetchContext }) {
  const boxScore = data as BoxScoreData;
  const sportKey = ctx.parsed.sportKey;
  const periods = normalizePeriods(boxScore, sportKey);

  if (periods.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">
        No line score data available
      </p>
    );
  }

  const sorted = [...periods].sort((a, b) => a.sortOrder - b.sortOrder);

  // Extract game info — NFL uses Score, MLB uses different score fields
  const game = boxScore.Game ?? boxScore.Score;
  const awayTeam = game?.AwayTeam ?? "Away";
  const homeTeam = game?.HomeTeam ?? "Home";
  const awayTotal = game?.AwayTeamScore ?? game?.AwayTeamRuns ?? game?.AwayScore ?? null;
  const homeTotal = game?.HomeTeamScore ?? game?.HomeTeamRuns ?? game?.HomeScore ?? null;

  // For MLB, also show R/H/E totals
  const isBaseball = sportKey === "mlb";
  const mlbGame = isBaseball ? (boxScore.Game as {
    AwayTeamHits?: number | null;
    HomeTeamHits?: number | null;
    AwayTeamErrors?: number | null;
    HomeTeamErrors?: number | null;
  } | undefined) : undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="px-3 py-2 text-left font-medium">Team</th>
            {sorted.map((p) => (
              <th key={p.key} className="px-3 py-2 text-center font-medium">
                {p.key}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-bold">{isBaseball ? "R" : "Total"}</th>
            {isBaseball && (
              <>
                <th className="px-3 py-2 text-center font-bold">H</th>
                <th className="px-3 py-2 text-center font-bold">E</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
              {awayTeam}
            </td>
            {sorted.map((p) => (
              <td key={p.key} className="px-3 py-2 text-center tabular-nums text-zinc-700 dark:text-zinc-300">
                {p.awayScore ?? "-"}
              </td>
            ))}
            <td className="px-3 py-2 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {awayTotal ?? "-"}
            </td>
            {isBaseball && (
              <>
                <td className="px-3 py-2 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {mlbGame?.AwayTeamHits ?? "-"}
                </td>
                <td className="px-3 py-2 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {mlbGame?.AwayTeamErrors ?? "-"}
                </td>
              </>
            )}
          </tr>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
              {homeTeam}
            </td>
            {sorted.map((p) => (
              <td key={p.key} className="px-3 py-2 text-center tabular-nums text-zinc-700 dark:text-zinc-300">
                {p.homeScore ?? "-"}
              </td>
            ))}
            <td className="px-3 py-2 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {homeTotal ?? "-"}
            </td>
            {isBaseball && (
              <>
                <td className="px-3 py-2 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {mlbGame?.HomeTeamHits ?? "-"}
                </td>
                <td className="px-3 py-2 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {mlbGame?.HomeTeamErrors ?? "-"}
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

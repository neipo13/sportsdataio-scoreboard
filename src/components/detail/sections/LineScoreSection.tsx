"use client";

import type { FetchContext } from "../../../lib/detail-registry";

interface Quarter {
  Number?: number;
  Name?: string | null;
  AwayScore?: number | null;
  HomeScore?: number | null;
}

interface BoxScoreData {
  Game?: {
    HomeTeam?: string | null;
    AwayTeam?: string | null;
    HomeTeamScore?: number | null;
    AwayTeamScore?: number | null;
  };
  Quarters?: Quarter[];
}

export function LineScoreSection({ data }: { data: unknown; ctx: FetchContext }) {
  const boxScore = data as BoxScoreData;
  const quarters = boxScore?.Quarters ?? [];
  const game = boxScore?.Game;

  if (quarters.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">
        No line score data available
      </p>
    );
  }

  // Sort by quarter number
  const sorted = [...quarters].sort((a, b) => (a.Number ?? 0) - (b.Number ?? 0));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="px-3 py-2 text-left font-medium">Team</th>
            {sorted.map((q) => (
              <th key={q.Number} className="px-3 py-2 text-center font-medium">
                {q.Name ?? `Q${q.Number}`}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
              {game?.AwayTeam ?? "Away"}
            </td>
            {sorted.map((q) => (
              <td key={q.Number} className="px-3 py-2 text-center tabular-nums text-zinc-700 dark:text-zinc-300">
                {q.AwayScore ?? "-"}
              </td>
            ))}
            <td className="px-3 py-2 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {game?.AwayTeamScore ?? "-"}
            </td>
          </tr>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
              {game?.HomeTeam ?? "Home"}
            </td>
            {sorted.map((q) => (
              <td key={q.Number} className="px-3 py-2 text-center tabular-nums text-zinc-700 dark:text-zinc-300">
                {q.HomeScore ?? "-"}
              </td>
            ))}
            <td className="px-3 py-2 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {game?.HomeTeamScore ?? "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

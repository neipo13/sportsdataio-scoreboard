"use client";

import type { FetchContext } from "../../../lib/detail-registry";

interface PlayerGame {
  Name?: string | null;
  Team?: string | null;
  Position?: string | null;
  Started?: number | null;
  Minutes?: number | null;
  Points?: number | null;
  Rebounds?: number | null;
  Assists?: number | null;
  Steals?: number | null;
  BlockedShots?: number | null;
  Turnovers?: number | null;
  PersonalFouls?: number | null;
  FieldGoalsMade?: number | null;
  FieldGoalsAttempted?: number | null;
  ThreePointersMade?: number | null;
  ThreePointersAttempted?: number | null;
  FreeThrowsMade?: number | null;
  FreeThrowsAttempted?: number | null;
  PlusMinus?: number | null;
  HomeOrAway?: string | null;
}

interface BoxScoreData {
  Game?: {
    HomeTeam?: string | null;
    AwayTeam?: string | null;
    HomeTeamScore?: number | null;
    AwayTeamScore?: number | null;
    Status?: string | null;
    DateTime?: string | null;
  };
  PlayerGames?: PlayerGame[];
}

function StatCell({ value }: { value: number | null | undefined }) {
  return (
    <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
      {value ?? "-"}
    </td>
  );
}

function PlayerTable({ players, teamLabel }: { players: PlayerGame[]; teamLabel: string }) {
  // Sort: starters first (Started=1), then by minutes descending
  const sorted = [...players].sort((a, b) => {
    const aStart = a.Started === 1 ? 0 : 1;
    const bStart = b.Started === 1 ? 0 : 1;
    if (aStart !== bStart) return aStart - bStart;
    return (b.Minutes ?? 0) - (a.Minutes ?? 0);
  });

  return (
    <div className="mb-6">
      <h4 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{teamLabel}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <th className="px-2 py-1.5 text-left font-medium">Player</th>
              <th className="px-2 py-1.5 text-left font-medium">Pos</th>
              <th className="px-2 py-1.5 text-right font-medium">MIN</th>
              <th className="px-2 py-1.5 text-right font-medium">PTS</th>
              <th className="px-2 py-1.5 text-right font-medium">REB</th>
              <th className="px-2 py-1.5 text-right font-medium">AST</th>
              <th className="px-2 py-1.5 text-right font-medium">STL</th>
              <th className="px-2 py-1.5 text-right font-medium">BLK</th>
              <th className="px-2 py-1.5 text-right font-medium">TO</th>
              <th className="px-2 py-1.5 text-right font-medium">PF</th>
              <th className="px-2 py-1.5 text-right font-medium">FG</th>
              <th className="px-2 py-1.5 text-right font-medium">3P</th>
              <th className="px-2 py-1.5 text-right font-medium">FT</th>
              <th className="px-2 py-1.5 text-right font-medium">+/-</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr
                key={`${p.Name}-${i}`}
                className={`border-b border-zinc-100 dark:border-zinc-800 ${
                  p.Started === 1 ? "bg-zinc-50 dark:bg-zinc-800/30" : ""
                }`}
              >
                <td className="whitespace-nowrap px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {p.Name ?? "Unknown"}
                  {p.Started === 1 && (
                    <span className="ml-1 text-[10px] text-zinc-400">S</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-zinc-500 dark:text-zinc-400">{p.Position ?? "-"}</td>
                <StatCell value={p.Minutes} />
                <StatCell value={p.Points} />
                <StatCell value={p.Rebounds} />
                <StatCell value={p.Assists} />
                <StatCell value={p.Steals} />
                <StatCell value={p.BlockedShots} />
                <StatCell value={p.Turnovers} />
                <StatCell value={p.PersonalFouls} />
                <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {p.FieldGoalsMade ?? 0}-{p.FieldGoalsAttempted ?? 0}
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {p.ThreePointersMade ?? 0}-{p.ThreePointersAttempted ?? 0}
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {p.FreeThrowsMade ?? 0}-{p.FreeThrowsAttempted ?? 0}
                </td>
                <StatCell value={p.PlusMinus} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TeamBoxScoreSection({ data }: { data: unknown; ctx: FetchContext }) {
  const boxScore = data as BoxScoreData;
  const players = boxScore?.PlayerGames ?? [];
  const game = boxScore?.Game;

  if (players.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">
        No box score data available
      </p>
    );
  }

  const awayTeam = game?.AwayTeam ?? "Away";
  const homeTeam = game?.HomeTeam ?? "Home";
  const awayPlayers = players.filter((p) => p.HomeOrAway === "AWAY" || p.Team === awayTeam);
  const homePlayers = players.filter((p) => p.HomeOrAway === "HOME" || p.Team === homeTeam);

  return (
    <div>
      <PlayerTable players={awayPlayers} teamLabel={awayTeam} />
      <PlayerTable players={homePlayers} teamLabel={homeTeam} />
    </div>
  );
}

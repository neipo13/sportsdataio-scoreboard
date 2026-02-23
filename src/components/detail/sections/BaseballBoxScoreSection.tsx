"use client";

import type { FetchContext } from "../../../lib/detail-registry";

interface PlayerGame {
  Name?: string | null;
  Team?: string | null;
  Position?: string | null;
  HomeOrAway?: string | null;
  Started?: number | null;
  BattingOrder?: number | null;
  // Batting
  AtBats?: number | null;
  Runs?: number | null;
  Hits?: number | null;
  HomeRuns?: number | null;
  RunsBattedIn?: number | null;
  Walks?: number | null;
  Strikeouts?: number | null;
  BattingAverage?: number | null;
  // Pitching
  InningsPitchedFull?: number | null;
  InningsPitchedOuts?: number | null;
  InningsPitchedDecimal?: number | null;
  PitchingHits?: number | null;
  PitchingRuns?: number | null;
  PitchingEarnedRuns?: number | null;
  PitchingWalks?: number | null;
  PitchingStrikeouts?: number | null;
  PitchingHomeRuns?: number | null;
  EarnedRunAverage?: number | null;
  Wins?: number | null;
  Losses?: number | null;
  Saves?: number | null;
  PitchesThrown?: number | null;
}

interface BoxScoreData {
  Game?: {
    HomeTeam?: string | null;
    AwayTeam?: string | null;
  };
  PlayerGames?: PlayerGame[];
}

function StatCell({ value, decimals }: { value: number | null | undefined; decimals?: number }) {
  return (
    <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
      {value != null ? (decimals != null ? value.toFixed(decimals) : value) : "-"}
    </td>
  );
}

function formatIP(full: number | null | undefined, outs: number | null | undefined): string {
  if (full == null && outs == null) return "-";
  const f = full ?? 0;
  const o = outs ?? 0;
  return o > 0 ? `${f}.${o}` : `${f}.0`;
}

function formatDecision(p: PlayerGame): string {
  if ((p.Wins ?? 0) > 0) return "W";
  if ((p.Losses ?? 0) > 0) return "L";
  if ((p.Saves ?? 0) > 0) return "SV";
  return "";
}

function BattingTable({ players, teamLabel }: { players: PlayerGame[]; teamLabel: string }) {
  // Sort by batting order (null goes last)
  const sorted = [...players].sort((a, b) => {
    const aOrder = a.BattingOrder ?? 999;
    const bOrder = b.BattingOrder ?? 999;
    return aOrder - bOrder;
  });

  return (
    <div className="mb-3">
      <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Batting
      </h5>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="px-2 py-1.5 text-left font-medium">Player</th>
            <th className="px-2 py-1.5 text-left font-medium">Pos</th>
            <th className="px-2 py-1.5 text-right font-medium">AB</th>
            <th className="px-2 py-1.5 text-right font-medium">R</th>
            <th className="px-2 py-1.5 text-right font-medium">H</th>
            <th className="px-2 py-1.5 text-right font-medium">HR</th>
            <th className="px-2 py-1.5 text-right font-medium">RBI</th>
            <th className="px-2 py-1.5 text-right font-medium">BB</th>
            <th className="px-2 py-1.5 text-right font-medium">SO</th>
            <th className="px-2 py-1.5 text-right font-medium">AVG</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr key={`${p.Name}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="whitespace-nowrap px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                {p.Name ?? "Unknown"}
              </td>
              <td className="px-2 py-1.5 text-zinc-500 dark:text-zinc-400">{p.Position ?? "-"}</td>
              <StatCell value={p.AtBats} />
              <StatCell value={p.Runs} />
              <StatCell value={p.Hits} />
              <StatCell value={p.HomeRuns} />
              <StatCell value={p.RunsBattedIn} />
              <StatCell value={p.Walks} />
              <StatCell value={p.Strikeouts} />
              <StatCell value={p.BattingAverage} decimals={3} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PitchingTable({ players }: { players: PlayerGame[] }) {
  if (players.length === 0) return null;

  // Starters first, then by IP descending
  const sorted = [...players].sort((a, b) => {
    const aStarter = a.Started === 1 ? 0 : 1;
    const bStarter = b.Started === 1 ? 0 : 1;
    if (aStarter !== bStarter) return aStarter - bStarter;
    return (b.InningsPitchedDecimal ?? 0) - (a.InningsPitchedDecimal ?? 0);
  });

  return (
    <div className="mb-3">
      <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Pitching
      </h5>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="px-2 py-1.5 text-left font-medium">Player</th>
            <th className="px-2 py-1.5 text-right font-medium">IP</th>
            <th className="px-2 py-1.5 text-right font-medium">H</th>
            <th className="px-2 py-1.5 text-right font-medium">R</th>
            <th className="px-2 py-1.5 text-right font-medium">ER</th>
            <th className="px-2 py-1.5 text-right font-medium">BB</th>
            <th className="px-2 py-1.5 text-right font-medium">SO</th>
            <th className="px-2 py-1.5 text-right font-medium">HR</th>
            <th className="px-2 py-1.5 text-right font-medium">ERA</th>
            <th className="px-2 py-1.5 text-right font-medium">NP</th>
            <th className="px-2 py-1.5 text-left font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const decision = formatDecision(p);
            return (
              <tr key={`${p.Name}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="whitespace-nowrap px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {p.Name ?? "Unknown"}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatIP(p.InningsPitchedFull, p.InningsPitchedOuts)}
                </td>
                <StatCell value={p.PitchingHits} />
                <StatCell value={p.PitchingRuns} />
                <StatCell value={p.PitchingEarnedRuns} />
                <StatCell value={p.PitchingWalks} />
                <StatCell value={p.PitchingStrikeouts} />
                <StatCell value={p.PitchingHomeRuns} />
                <StatCell value={p.EarnedRunAverage} decimals={2} />
                <StatCell value={p.PitchesThrown} />
                <td className="px-2 py-1.5 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {decision}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TeamSection({ players, teamLabel }: { players: PlayerGame[]; teamLabel: string }) {
  const isPitcher = (p: PlayerGame) =>
    p.Position === "P" ||
    p.Position === "SP" ||
    p.Position === "RP" ||
    (p.InningsPitchedDecimal ?? 0) > 0;

  // Batters: anyone with at-bats or a batting order
  const batters = players.filter((p) => (p.AtBats ?? 0) > 0 || p.BattingOrder != null);
  const pitchers = players.filter(isPitcher);

  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{teamLabel}</h4>
      <div className="overflow-x-auto">
        <BattingTable players={batters} teamLabel={teamLabel} />
        <PitchingTable players={pitchers} />
      </div>
    </div>
  );
}

export function BaseballBoxScoreSection({ data }: { data: unknown; ctx: FetchContext }) {
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
      <TeamSection players={awayPlayers} teamLabel={awayTeam} />
      <TeamSection players={homePlayers} teamLabel={homeTeam} />
    </div>
  );
}

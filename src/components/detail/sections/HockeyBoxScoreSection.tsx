"use client";

import type { FetchContext } from "../../../lib/detail-registry";
import { InjuryTag } from "./InjuryTag";

interface PlayerGame {
  Name?: string | null;
  Team?: string | null;
  Position?: string | null;
  HomeOrAway?: string | null;
  InjuryStatus?: string | null;
  InjuryBodyPart?: string | null;
  InjuryNotes?: string | null;
  // Skater stats
  Goals?: number | null;
  Assists?: number | null;
  Points?: number | null;
  ShotsOnGoal?: number | null;
  PlusMinus?: number | null;
  PenaltyMinutes?: number | null;
  PowerPlayGoals?: number | null;
  ShortHandedGoals?: number | null;
  Minutes?: number | null;
  Seconds?: number | null;
  // Goalie stats
  GoaltendingShotsAgainst?: number | null;
  GoaltendingGoalsAgainst?: number | null;
  GoaltendingSaves?: number | null;
  GoaltendingMinutes?: number | null;
  GoaltendingWins?: number | null;
  GoaltendingLosses?: number | null;
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

function formatTOI(minutes: number | null | undefined, seconds: number | null | undefined): string {
  if (minutes == null && seconds == null) return "-";
  const m = minutes ?? 0;
  const s = seconds != null ? seconds % 60 : 0;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SkatersTable({ players, teamLabel }: { players: PlayerGame[]; teamLabel: string }) {
  // Sort by points desc, then goals desc
  const sorted = [...players].sort((a, b) => {
    const diff = (b.Points ?? 0) - (a.Points ?? 0);
    if (diff !== 0) return diff;
    return (b.Goals ?? 0) - (a.Goals ?? 0);
  });

  return (
    <div className="mb-3">
      <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Skaters
      </h5>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="px-2 py-1.5 text-left font-medium">Player</th>
            <th className="px-2 py-1.5 text-left font-medium">Pos</th>
            <th className="px-2 py-1.5 text-right font-medium">G</th>
            <th className="px-2 py-1.5 text-right font-medium">A</th>
            <th className="px-2 py-1.5 text-right font-medium">PTS</th>
            <th className="px-2 py-1.5 text-right font-medium">SOG</th>
            <th className="px-2 py-1.5 text-right font-medium">+/-</th>
            <th className="px-2 py-1.5 text-right font-medium">PIM</th>
            <th className="px-2 py-1.5 text-right font-medium">PPG</th>
            <th className="px-2 py-1.5 text-right font-medium">SHG</th>
            <th className="px-2 py-1.5 text-right font-medium">TOI</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr key={`${p.Name}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="whitespace-nowrap px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                {p.Name ?? "Unknown"}
                <InjuryTag status={p.InjuryStatus} bodyPart={p.InjuryBodyPart} notes={p.InjuryNotes} />
              </td>
              <td className="px-2 py-1.5 text-zinc-500 dark:text-zinc-400">{p.Position ?? "-"}</td>
              <StatCell value={p.Goals} />
              <StatCell value={p.Assists} />
              <StatCell value={p.Points} />
              <StatCell value={p.ShotsOnGoal} />
              <StatCell value={p.PlusMinus} />
              <StatCell value={p.PenaltyMinutes} />
              <StatCell value={p.PowerPlayGoals} />
              <StatCell value={p.ShortHandedGoals} />
              <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                {formatTOI(p.Minutes, p.Seconds)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GoaliesTable({ players }: { players: PlayerGame[] }) {
  if (players.length === 0) return null;

  return (
    <div className="mb-3">
      <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Goalies
      </h5>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="px-2 py-1.5 text-left font-medium">Player</th>
            <th className="px-2 py-1.5 text-right font-medium">SA</th>
            <th className="px-2 py-1.5 text-right font-medium">GA</th>
            <th className="px-2 py-1.5 text-right font-medium">SV</th>
            <th className="px-2 py-1.5 text-right font-medium">SV%</th>
            <th className="px-2 py-1.5 text-right font-medium">MIN</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const sa = p.GoaltendingShotsAgainst ?? 0;
            const sv = p.GoaltendingSaves ?? 0;
            const svPct = sa > 0 ? (sv / sa) * 100 : null;
            return (
              <tr key={`${p.Name}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="whitespace-nowrap px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {p.Name ?? "Unknown"}
                  <InjuryTag status={p.InjuryStatus} bodyPart={p.InjuryBodyPart} notes={p.InjuryNotes} />
                </td>
                <StatCell value={p.GoaltendingShotsAgainst} />
                <StatCell value={p.GoaltendingGoalsAgainst} />
                <StatCell value={p.GoaltendingSaves} />
                <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {svPct != null ? `${svPct.toFixed(1)}%` : "-"}
                </td>
                <StatCell value={p.GoaltendingMinutes} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TeamSection({ players, teamLabel }: { players: PlayerGame[]; teamLabel: string }) {
  const goalies = players.filter((p) => p.Position === "G");
  const skaters = players.filter((p) => p.Position !== "G");

  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{teamLabel}</h4>
      <div className="overflow-x-auto">
        <SkatersTable players={skaters} teamLabel={teamLabel} />
        <GoaliesTable players={goalies} />
      </div>
    </div>
  );
}

export function HockeyBoxScoreSection({ data }: { data: unknown; ctx: FetchContext }) {
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

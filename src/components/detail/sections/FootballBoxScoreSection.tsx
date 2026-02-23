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
  // Passing
  PassingAttempts?: number | null;
  PassingCompletions?: number | null;
  PassingYards?: number | null;
  PassingTouchdowns?: number | null;
  PassingInterceptions?: number | null;
  // Rushing
  RushingAttempts?: number | null;
  RushingYards?: number | null;
  RushingYardsPerAttempt?: number | null;
  RushingTouchdowns?: number | null;
  // Receiving
  ReceivingTargets?: number | null;
  Receptions?: number | null;
  ReceivingYards?: number | null;
  ReceivingYardsPerReception?: number | null;
  ReceivingTouchdowns?: number | null;
  // Defense
  SoloTackles?: number | null;
  AssistedTackles?: number | null;
  Sacks?: number | null;
  Interceptions?: number | null;
  FumblesForced?: number | null;
  PassesDefended?: number | null;
}

interface GameInfo {
  HomeTeam?: string | null;
  AwayTeam?: string | null;
}

interface BoxScoreData {
  Game?: GameInfo;
  Score?: GameInfo; // NFL uses Score instead of Game
  PlayerGames?: PlayerGame[];
}

function StatCell({ value, decimals }: { value: number | null | undefined; decimals?: number }) {
  return (
    <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
      {value != null ? (decimals != null ? value.toFixed(decimals) : value) : "-"}
    </td>
  );
}

function SubTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mb-3">
      <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h5>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {headers.map((h) => (
              <th
                key={h}
                className={`px-2 py-1 font-medium ${h === "Player" ? "text-left" : "text-right"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
              {cells}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function nameCell(p: PlayerGame) {
  return (
    <td
      key="name"
      className="whitespace-nowrap px-2 py-1 font-medium text-zinc-900 dark:text-zinc-100"
    >
      {p.Name ?? "Unknown"}
      <InjuryTag status={p.InjuryStatus} bodyPart={p.InjuryBodyPart} notes={p.InjuryNotes} />
    </td>
  );
}

function TeamSection({ players, teamLabel }: { players: PlayerGame[]; teamLabel: string }) {
  // Passers: anyone with passing attempts
  const passers = players
    .filter((p) => (p.PassingAttempts ?? 0) > 0)
    .sort((a, b) => (b.PassingYards ?? 0) - (a.PassingYards ?? 0));

  // Rushers: anyone with rushing attempts
  const rushers = players
    .filter((p) => (p.RushingAttempts ?? 0) > 0)
    .sort((a, b) => (b.RushingYards ?? 0) - (a.RushingYards ?? 0));

  // Receivers: anyone with receptions or targets
  const receivers = players
    .filter((p) => (p.Receptions ?? 0) > 0 || (p.ReceivingTargets ?? 0) > 0)
    .sort((a, b) => (b.ReceivingYards ?? 0) - (a.ReceivingYards ?? 0));

  // Defense: anyone with tackles, sacks, or interceptions
  const defenders = players
    .filter(
      (p) =>
        (p.SoloTackles ?? 0) > 0 ||
        (p.AssistedTackles ?? 0) > 0 ||
        (p.Sacks ?? 0) > 0 ||
        (p.Interceptions ?? 0) > 0,
    )
    .sort(
      (a, b) =>
        (b.SoloTackles ?? 0) +
        (b.AssistedTackles ?? 0) -
        ((a.SoloTackles ?? 0) + (a.AssistedTackles ?? 0)),
    );

  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{teamLabel}</h4>
      <div className="space-y-4 overflow-x-auto">
        <SubTable
          title="Passing"
          headers={["Player", "C/ATT", "YDS", "TD", "INT"]}
          rows={passers.map((p) => [
            nameCell(p),
            <td key="catt" className="whitespace-nowrap px-2 py-1 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
              {p.PassingCompletions ?? 0}/{p.PassingAttempts ?? 0}
            </td>,
            <StatCell key="yds" value={p.PassingYards} />,
            <StatCell key="td" value={p.PassingTouchdowns} />,
            <StatCell key="int" value={p.PassingInterceptions} />,
          ])}
        />
        <SubTable
          title="Rushing"
          headers={["Player", "ATT", "YDS", "AVG", "TD"]}
          rows={rushers.map((p) => [
            nameCell(p),
            <StatCell key="att" value={p.RushingAttempts} />,
            <StatCell key="yds" value={p.RushingYards} />,
            <StatCell key="avg" value={p.RushingYardsPerAttempt} decimals={1} />,
            <StatCell key="td" value={p.RushingTouchdowns} />,
          ])}
        />
        <SubTable
          title="Receiving"
          headers={["Player", "REC", "YDS", "AVG", "TD"]}
          rows={receivers.map((p) => [
            nameCell(p),
            <StatCell key="rec" value={p.Receptions} />,
            <StatCell key="yds" value={p.ReceivingYards} />,
            <StatCell key="avg" value={p.ReceivingYardsPerReception} decimals={1} />,
            <StatCell key="td" value={p.ReceivingTouchdowns} />,
          ])}
        />
        <SubTable
          title="Defense"
          headers={["Player", "SOLO", "AST", "SACK", "INT", "FF", "PD"]}
          rows={defenders.map((p) => [
            nameCell(p),
            <StatCell key="solo" value={p.SoloTackles} />,
            <StatCell key="ast" value={p.AssistedTackles} />,
            <StatCell key="sack" value={p.Sacks} decimals={1} />,
            <StatCell key="int" value={p.Interceptions} />,
            <StatCell key="ff" value={p.FumblesForced} />,
            <StatCell key="pd" value={p.PassesDefended} />,
          ])}
        />
      </div>
    </div>
  );
}

export function FootballBoxScoreSection({ data }: { data: unknown; ctx: FetchContext }) {
  const boxScore = data as BoxScoreData;
  const players = boxScore?.PlayerGames ?? [];
  // NFL uses Score, CFB uses Game
  const game = boxScore?.Game ?? boxScore?.Score;

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

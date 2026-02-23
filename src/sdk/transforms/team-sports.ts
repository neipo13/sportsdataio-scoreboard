import type { components as NbaComponents } from "../generated/nba";
import type { components as NflComponents } from "../generated/nfl";
import type { components as NhlComponents } from "../generated/nhl";
import type { components as MlbComponents } from "../generated/mlb";
import type { components as CbbComponents } from "../generated/cbb";
import type { components as CfbComponents } from "../generated/cfb";
import type { components as WnbaComponents } from "../generated/wnba";
import type { components as CwbbComponents } from "../generated/cwbb";
import { type NormalizedEvent, emptyEvent, normalizeStatus } from "./types";
import { sdioDateToIso } from "./date-utils";

// These sports all share an almost-identical Game schema with small field-name differences.

type NbaGame = NbaComponents["schemas"]["Game"];
type NflScore = NflComponents["schemas"]["Score"];
type NhlGame = NhlComponents["schemas"]["Game"];
type MlbGame = MlbComponents["schemas"]["Game"];
type CbbGame = CbbComponents["schemas"]["Game"];
type CfbGame = CfbComponents["schemas"]["Game"];
type WnbaGame = WnbaComponents["schemas"]["Game"];
type CwbbGame = CwbbComponents["schemas"]["Game"];

export interface TransformOpts {
  stadiumMap?: Map<number, string>;
}

// -- Game status helpers --

/** Format quarter/period + time remaining for basketball/football sports */
function formatQuarterStatus(
  quarter: string | null | undefined,
  minutes: number | null | undefined,
  seconds: number | null | undefined,
): string | null {
  if (!quarter) return null;
  const q = quarter.trim();
  if (q.toLowerCase() === "half" || q.toLowerCase() === "halftime") return "Halftime";
  const timeStr = minutes != null && seconds != null
    ? ` ${minutes}:${String(seconds).padStart(2, "0")}`
    : "";
  // Map quarter names: "1" -> "Q1", "OT" -> "OT", etc.
  const label = /^\d+$/.test(q) ? `Q${q}` : q;
  return `${label}${timeStr}`;
}

/** Format NHL period + time remaining */
function formatPeriodStatus(
  period: string | null | undefined,
  minutes: number | null | undefined,
  seconds: number | null | undefined,
): string | null {
  if (!period) return null;
  const p = period.trim();
  if (p.toLowerCase() === "so" || p.toLowerCase() === "shootout") return "SO";
  const timeStr = minutes != null && seconds != null
    ? ` ${minutes}:${String(seconds).padStart(2, "0")}`
    : "";
  // Map period names: "1" -> "1st", "2" -> "2nd", "3" -> "3rd", "OT" -> "OT"
  const ordinals: Record<string, string> = { "1": "1st", "2": "2nd", "3": "3rd" };
  const label = ordinals[p] ?? p;
  return `${label}${timeStr}`;
}

// NBA, NHL, MLB, CBB, CFB, WNBA, CWBB all use AwayTeamScore/HomeTeamScore
// and AwayTeam/HomeTeam in the Game schema.
// NFL uses AwayScore/HomeScore in the Score schema, and Date instead of Day.

function transformStandardGame(
  game: {
    GameID?: number;
    Status?: string | null;
    Day?: string | null;
    DateTime?: string | null;
    AwayTeam?: string | null;
    HomeTeam?: string | null;
    AwayTeamScore?: number | null;
    HomeTeamScore?: number | null;
    PointSpread?: number | null;
    OverUnder?: number | null;
    AwayTeamMoneyLine?: number | null;
    HomeTeamMoneyLine?: number | null;
    IsClosed?: boolean | null;
    Channel?: string | null;
    Quarter?: string | null;
    Period?: string | null;
    TimeRemainingMinutes?: number | null;
    TimeRemainingSeconds?: number | null;
    LastPlay?: string | null;
    StadiumID?: number | null;
  },
  sportKey: string,
  sportLabel: string,
  opts?: TransformOpts,
): NormalizedEvent {
  // Resolve venue from stadium map
  const venue = game.StadiumID != null && opts?.stadiumMap
    ? opts.stadiumMap.get(game.StadiumID) ?? null
    : null;

  // Game status: use Quarter for basketball/football, Period for NHL
  let gameStatus: string | null = null;
  if (sportKey === "nhl") {
    gameStatus = formatPeriodStatus(game.Period, game.TimeRemainingMinutes, game.TimeRemainingSeconds);
  } else {
    gameStatus = formatQuarterStatus(
      game.Quarter ?? game.Period,
      game.TimeRemainingMinutes,
      game.TimeRemainingSeconds,
    );
  }

  return {
    ...emptyEvent(),
    id: `${sportKey}-${game.GameID}`,
    sport: "team",
    sportKey,
    sportLabel,
    status: normalizeStatus(game.Status),
    isClosed: game.IsClosed ?? false,
    dateTime: game.DateTime ?? null,
    day: sdioDateToIso(game.Day),
    homeTeam: game.HomeTeam ?? null,
    awayTeam: game.AwayTeam ?? null,
    homeScore: game.HomeTeamScore ?? null,
    awayScore: game.AwayTeamScore ?? null,
    pointSpread: game.PointSpread ?? null,
    overUnder: game.OverUnder ?? null,
    homeMoneyLine: game.HomeTeamMoneyLine ?? null,
    awayMoneyLine: game.AwayTeamMoneyLine ?? null,
    channel: game.Channel ?? null,
    venue,
    gameStatus,
    lastPlay: game.LastPlay ?? null,
  };
}

export function transformNbaGames(games: NbaGame[], opts?: TransformOpts): NormalizedEvent[] {
  return games.map((g) => transformStandardGame(g, "nba", "NBA", opts));
}

export function transformNhlGames(games: NhlGame[], opts?: TransformOpts): NormalizedEvent[] {
  return games.map((g) => transformStandardGame(g, "nhl", "NHL", opts));
}

export function transformMlbGames(games: MlbGame[], opts?: TransformOpts): NormalizedEvent[] {
  return games.map((g) => {
    const base = transformStandardGame(g, "mlb", "MLB", opts);
    // MLB uses runs instead of score, and has inning-specific fields
    const gameStatus = g.InningDescription ?? null;
    let gameDetail: string | null = null;
    if (g.Balls != null && g.Strikes != null && g.Outs != null) {
      gameDetail = `${g.Balls}-${g.Strikes}, ${g.Outs} Out`;
    }
    return {
      ...base,
      homeScore: g.HomeTeamRuns ?? null,
      awayScore: g.AwayTeamRuns ?? null,
      gameStatus,
      gameDetail,
      lastPlay: g.LastPlay ?? null,
    };
  });
}

export function transformCbbGames(games: CbbGame[], opts?: TransformOpts): NormalizedEvent[] {
  return games.map((g) => transformStandardGame(g, "cbb", "College Basketball", opts));
}

export function transformCfbGames(games: CfbGame[], opts?: TransformOpts): NormalizedEvent[] {
  return games.map((g) => transformStandardGame(g, "cfb", "College Football", opts));
}

export function transformWnbaGames(games: WnbaGame[], opts?: TransformOpts): NormalizedEvent[] {
  return games.map((g) => transformStandardGame(g, "wnba", "WNBA", opts));
}

export function transformCwbbGames(games: CwbbGame[], opts?: TransformOpts): NormalizedEvent[] {
  return games.map((g) => transformStandardGame(g, "cwbb", "College Women's Basketball", opts));
}

/** NFL uses different field names: AwayScore/HomeScore, Date instead of Day */
export function transformNflGames(games: NflScore[], opts?: TransformOpts): NormalizedEvent[] {
  return games.map((g) => {
    // NFL has StadiumDetails embedded in the Score response
    const venue = g.StadiumDetails?.Name ?? null;

    const gameStatus = g.QuarterDescription ?? null;
    let gameDetail: string | null = null;
    if (g.DownAndDistance) {
      const territory = g.YardLineTerritory ? ` at ${g.YardLineTerritory} ${g.YardLine ?? ""}`.trimEnd() : "";
      gameDetail = `${g.DownAndDistance}${territory}`;
    }

    return {
      ...emptyEvent(),
      id: `nfl-${g.ScoreID}`,
      sport: "team" as const,
      sportKey: "nfl",
      sportLabel: "NFL",
      status: normalizeStatus(g.IsOver ? "Final" : g.IsInProgress ? "InProgress" : "Scheduled"),
      isClosed: g.IsClosed ?? false,
      dateTime: g.Date ?? null,
      day: sdioDateToIso(g.Date),
      homeTeam: g.HomeTeam ?? null,
      awayTeam: g.AwayTeam ?? null,
      homeScore: g.HomeScore ?? null,
      awayScore: g.AwayScore ?? null,
      pointSpread: g.PointSpread ?? null,
      overUnder: g.OverUnder ?? null,
      homeMoneyLine: g.HomeTeamMoneyLine ?? null,
      awayMoneyLine: g.AwayTeamMoneyLine ?? null,
      channel: g.Channel ?? null,
      venue,
      gameStatus,
      gameDetail,
      lastPlay: g.LastPlay ?? null,
    };
  });
}

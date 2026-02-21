import type { components as SoccerComponents } from "../generated/soccer";
import { type NormalizedEvent, emptyEvent, normalizeStatus } from "./types";

type SoccerGame = SoccerComponents["schemas"]["Game"];

export interface SoccerTransformOpts {
  venueMap?: Map<number, string>;
}

function formatSoccerStatus(game: SoccerGame): string | null {
  const clockDisplay = game.ClockDisplay;
  const period = game.Period;

  if (clockDisplay) {
    const prefix = period === "ExtraTime" ? "ET " : period === "PenaltyKicks" ? "PKs " : "";
    return `${prefix}${clockDisplay}'`;
  }

  if (game.Clock != null) {
    const extra = game.ClockExtra != null && game.ClockExtra > 0 ? `+${game.ClockExtra}` : "";
    const prefix = period === "ExtraTime" ? "ET " : period === "PenaltyKicks" ? "PKs " : "";
    return `${prefix}${game.Clock}${extra}'`;
  }

  return null;
}

export function transformSoccerGames(
  games: SoccerGame[],
  competitionKey: string,
  competitionLabel?: string,
  opts?: SoccerTransformOpts,
): NormalizedEvent[] {
  return games.map((g) => {
    const venue = g.VenueId != null && opts?.venueMap
      ? opts.venueMap.get(g.VenueId) ?? null
      : null;

    return {
      ...emptyEvent(),
      id: `soccer-${competitionKey}-${g.GameId}`,
      sport: "soccer" as const,
      sportKey: "soccer",
      sportLabel: competitionLabel ?? `Soccer (${competitionKey})`,
      status: normalizeStatus(g.Status),
      isClosed: g.Status === "Final",
      dateTime: g.DateTime ?? null,
      day: g.Day?.slice(0, 10) ?? null,
      homeTeam: g.HomeTeamName ?? g.HomeTeamKey ?? null,
      awayTeam: g.AwayTeamName ?? g.AwayTeamKey ?? null,
      homeScore: g.HomeTeamScore ?? null,
      awayScore: g.AwayTeamScore ?? null,
      pointSpread: g.PointSpread ?? null,
      overUnder: g.OverUnder ?? null,
      homeMoneyLine: g.HomeTeamMoneyLine ?? null,
      awayMoneyLine: g.AwayTeamMoneyLine ?? null,
      competitionKey,
      gameStatus: formatSoccerStatus(g),
      venue,
    };
  });
}

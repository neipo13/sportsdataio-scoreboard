import type { ComponentType } from "react";
import type { DetailSectionConfig, FetchContext, SectionFetchResult } from "../detail-registry";
import { nba, nfl, nhl, mlb, cbb, cfb, wnba } from "../../sdk/clients/index";
import { BasketballBoxScoreSection } from "../../components/detail/sections/TeamBoxScoreSection";
import { FootballBoxScoreSection } from "../../components/detail/sections/FootballBoxScoreSection";
import { HockeyBoxScoreSection } from "../../components/detail/sections/HockeyBoxScoreSection";
import { BaseballBoxScoreSection } from "../../components/detail/sections/BaseballBoxScoreSection";
import { LineScoreSection } from "../../components/detail/sections/LineScoreSection";
import { PlayByPlaySection } from "../../components/detail/sections/PlayByPlaySection";
import { BettingDataSection } from "../../components/detail/sections/BettingDataSection";
import { PregameOddsSection } from "../../components/detail/sections/PregameOddsSection";
import { InplayOddsSection } from "../../components/detail/sections/InplayOddsSection";

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function fetchOrThrow<T>(
  result: { data: T | undefined; response: Response },
): Promise<SectionFetchResult<T>> {
  if (result.response.status === 401) {
    throw new HttpError(401, "Unauthorized");
  }
  if (!result.response.ok) {
    throw new HttpError(result.response.status, `HTTP ${result.response.status}`);
  }
  return { data: result.data as T, status: result.response.status };
}

// -- Factory helpers --

type BoxScoreClient = { getBoxScore: (id: string) => Promise<{ data: unknown; response: Response }> };
type PlayByPlayClient = { getPlayByPlay: (id: string) => Promise<{ data: unknown; response: Response }> };
type BettingClient = { getBettingMarkets: (id: string, sbGroup: string) => Promise<{ data: unknown; response: Response }> };
type PregameOddsClient = {
  getPregameOdds: (date: string, sbGroup: string) => Promise<{ data: unknown; response: Response }>;
  getPregameLineMovement: (id: string, sbGroup: string) => Promise<{ data: unknown; response: Response }>;
};
type InplayOddsClient = {
  getInplayOdds: (date: string, sbGroup: string) => Promise<{ data: unknown; response: Response }>;
  getInplayLineMovement: (id: string, sbGroup: string) => Promise<{ data: unknown; response: Response }>;
};

type SectionComponent = ComponentType<{ data: unknown; ctx: FetchContext; fetchLineMovement?: (ctx: FetchContext) => Promise<SectionFetchResult> }>;

function makeBoxScore(client: BoxScoreClient, component: SectionComponent): DetailSectionConfig {
  return {
    key: "boxscore",
    label: "Box Score",
    fetch: async (ctx: FetchContext) => fetchOrThrow(await client.getBoxScore(ctx.parsed.rawId)),
    component,
  };
}

function makeLineScore(client: BoxScoreClient): DetailSectionConfig {
  return {
    key: "linescore",
    label: "Line Score",
    fetch: async (ctx: FetchContext) => fetchOrThrow(await client.getBoxScore(ctx.parsed.rawId)),
    component: LineScoreSection,
  };
}

function makePlayByPlay(client: PlayByPlayClient): DetailSectionConfig {
  return {
    key: "playbyplay",
    label: "Play-by-Play",
    fetch: async (ctx: FetchContext) => fetchOrThrow(await client.getPlayByPlay(ctx.parsed.rawId)),
    component: PlayByPlaySection,
  };
}

function makeBettingData(client: BettingClient): DetailSectionConfig {
  return {
    key: "betting",
    label: "Betting Data",
    fetch: async (ctx: FetchContext) =>
      fetchOrThrow(await client.getBettingMarkets(ctx.parsed.rawId, ctx.sportsbookGroup)),
    component: BettingDataSection,
  };
}

function makePregameOdds(client: PregameOddsClient): DetailSectionConfig {
  return {
    key: "pregame-odds",
    label: "Pregame Odds",
    fetch: async (ctx: FetchContext) =>
      fetchOrThrow(await client.getPregameOdds(ctx.date, ctx.sportsbookGroup)),
    fetchLineMovement: async (ctx: FetchContext) =>
      fetchOrThrow(await client.getPregameLineMovement(ctx.parsed.rawId, ctx.sportsbookGroup)),
    component: PregameOddsSection,
  };
}

function makeInplayOdds(client: InplayOddsClient): DetailSectionConfig {
  return {
    key: "inplay-odds",
    label: "Inplay Odds",
    fetch: async (ctx: FetchContext) =>
      fetchOrThrow(await client.getInplayOdds(ctx.date, ctx.sportsbookGroup)),
    fetchLineMovement: async (ctx: FetchContext) =>
      fetchOrThrow(await client.getInplayLineMovement(ctx.parsed.rawId, ctx.sportsbookGroup)),
    component: InplayOddsSection,
  };
}

// -- NBA: boxscore, linescore, playbyplay, betting, pregameOdds, inplayOdds --
export const nbaSections: DetailSectionConfig[] = [
  makeBoxScore(nba, BasketballBoxScoreSection),
  makeLineScore(nba),
  makePlayByPlay(nba),
  makeBettingData(nba),
  makePregameOdds(nba),
  makeInplayOdds(nba),
];

// -- NFL: boxscore, linescore, playbyplay, betting (no date-based odds) --
export const nflSections: DetailSectionConfig[] = [
  makeBoxScore(nfl, FootballBoxScoreSection),
  makeLineScore(nfl),
  makePlayByPlay(nfl),
  makeBettingData(nfl),
];

// -- NHL: boxscore, linescore, playbyplay, betting, pregameOdds, inplayOdds --
export const nhlSections: DetailSectionConfig[] = [
  makeBoxScore(nhl, HockeyBoxScoreSection),
  makeLineScore(nhl),
  makePlayByPlay(nhl),
  makeBettingData(nhl),
  makePregameOdds(nhl),
  makeInplayOdds(nhl),
];

// -- MLB: boxscore, linescore, playbyplay, betting, pregameOdds, inplayOdds --
export const mlbSections: DetailSectionConfig[] = [
  makeBoxScore(mlb, BaseballBoxScoreSection),
  makeLineScore(mlb),
  makePlayByPlay(mlb),
  makeBettingData(mlb),
  makePregameOdds(mlb),
  makeInplayOdds(mlb),
];

// -- CBB: boxscore, linescore, betting, pregameOdds, inplayOdds (no playbyplay) --
export const cbbSections: DetailSectionConfig[] = [
  makeBoxScore(cbb, BasketballBoxScoreSection),
  makeLineScore(cbb),
  makeBettingData(cbb),
  makePregameOdds(cbb),
  makeInplayOdds(cbb),
];

// -- CFB: boxscore, linescore, betting (no playbyplay, no date-based odds) --
export const cfbSections: DetailSectionConfig[] = [
  makeBoxScore(cfb, FootballBoxScoreSection),
  makeLineScore(cfb),
  makeBettingData(cfb),
];

// -- WNBA: boxscore, linescore, betting (no playbyplay, no odds) --
export const wnbaSections: DetailSectionConfig[] = [
  makeBoxScore(wnba, BasketballBoxScoreSection),
  makeLineScore(wnba),
  makeBettingData(wnba),
];

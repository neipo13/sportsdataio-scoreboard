import type { DetailSectionConfig, FetchContext, SectionFetchResult } from "../detail-registry";
import { nba } from "../../sdk/clients/index";
import { TeamBoxScoreSection } from "../../components/detail/sections/TeamBoxScoreSection";
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

// -- NBA sections --

const nbaBoxScore: DetailSectionConfig = {
  key: "boxscore",
  label: "Box Score",
  fetch: async (ctx: FetchContext) => fetchOrThrow(await nba.getBoxScore(ctx.parsed.rawId)),
  component: TeamBoxScoreSection,
};

const nbaLineScore: DetailSectionConfig = {
  key: "linescore",
  label: "Line Score",
  fetch: async (ctx: FetchContext) => fetchOrThrow(await nba.getBoxScore(ctx.parsed.rawId)),
  component: LineScoreSection,
};

const nbaPlayByPlay: DetailSectionConfig = {
  key: "playbyplay",
  label: "Play-by-Play",
  fetch: async (ctx: FetchContext) => fetchOrThrow(await nba.getPlayByPlay(ctx.parsed.rawId)),
  component: PlayByPlaySection,
};

const nbaBettingData: DetailSectionConfig = {
  key: "betting",
  label: "Betting Data",
  fetch: async (ctx: FetchContext) =>
    fetchOrThrow(await nba.getBettingMarkets(ctx.parsed.rawId, ctx.sportsbookGroup)),
  component: BettingDataSection,
};

const nbaPregameOdds: DetailSectionConfig = {
  key: "pregame-odds",
  label: "Pregame Odds",
  fetch: async (ctx: FetchContext) =>
    fetchOrThrow(await nba.getPregameOdds(ctx.date, ctx.sportsbookGroup)),
  component: PregameOddsSection,
};

const nbaInplayOdds: DetailSectionConfig = {
  key: "inplay-odds",
  label: "Inplay Odds",
  fetch: async (ctx: FetchContext) =>
    fetchOrThrow(await nba.getInplayOdds(ctx.date, ctx.sportsbookGroup)),
  component: InplayOddsSection,
};

export const nbaSections: DetailSectionConfig[] = [
  nbaBoxScore,
  nbaLineScore,
  nbaPlayByPlay,
  nbaBettingData,
  nbaPregameOdds,
  nbaInplayOdds,
];

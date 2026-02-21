import type { components as MmaComponents } from "../generated/mma";
import { type NormalizedEvent, type NormalizedFight, emptyEvent, normalizeStatus } from "./types";
import { sdioDateToIso } from "./date-utils";

type MmaEvent = MmaComponents["schemas"]["Event"];
type MmaEventDetail = MmaComponents["schemas"]["EventDetail"];
type MmaFight = MmaComponents["schemas"]["Fight"];
type MmaFighterInfo = MmaComponents["schemas"]["FighterInfo"];

function fighterName(f: MmaFighterInfo | undefined): string | null {
  if (!f) return null;
  return [f.FirstName, f.LastName].filter(Boolean).join(" ") || null;
}

function transformFight(fight: MmaFight): NormalizedFight {
  const fighters = fight.Fighters ?? [];
  const f1 = fighters[0];
  const f2 = fighters[1];
  return {
    id: fight.FightId ?? 0,
    order: fight.Order ?? null,
    status: fight.Status ?? null,
    weightClass: fight.WeightClass ?? null,
    fighter1: fighterName(f1),
    fighter2: fighterName(f2),
    fighter1MoneyLine: f1?.Moneyline ?? null,
    fighter2MoneyLine: f2?.Moneyline ?? null,
    winnerId: fight.WinnerId ?? null,
    resultType: fight.ResultType ?? null,
  };
}

/** Transform basic MMA Event list (from schedule endpoint, no fight details). */
export function transformMmaEvents(events: MmaEvent[]): NormalizedEvent[] {
  return events.map((e) => ({
    ...emptyEvent(),
    id: `mma-${e.EventId}`,
    sport: "combat" as const,
    sportKey: "mma",
    sportLabel: "MMA",
    status: normalizeStatus(e.Status),
    isClosed: e.Status === "Final",
    dateTime: e.DateTime ?? null,
    day: sdioDateToIso(e.Day),
    eventName: e.Name ?? e.ShortName ?? null,
    fights: null,
  }));
}

/** Transform a detailed MMA event (from event endpoint, includes fights). */
export function transformMmaEventDetail(detail: MmaEventDetail): NormalizedEvent {
  return {
    ...emptyEvent(),
    id: `mma-${detail.EventId}`,
    sport: "combat" as const,
    sportKey: "mma",
    sportLabel: "MMA",
    status: normalizeStatus(detail.Status),
    isClosed: detail.Status === "Final",
    dateTime: detail.DateTime ?? null,
    day: sdioDateToIso(detail.Day),
    eventName: detail.Name ?? detail.ShortName ?? null,
    fights: (detail.Fights ?? []).map(transformFight),
  };
}

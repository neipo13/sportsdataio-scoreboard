import type { components as NascarComponents } from "../generated/nascar";
import { type NormalizedEvent, emptyEvent, normalizeStatus } from "./types";
import { sdioDateToIso } from "./date-utils";

type NascarRace = NascarComponents["schemas"]["Race"];

export function transformNascarRaces(races: NascarRace[]): NormalizedEvent[] {
  return races.map((r) => {
    const isOver = r.IsOver ?? false;
    const isInProgress = r.IsInProgress ?? false;
    const isCanceled = r.Canceled ?? false;

    let status: "Final" | "InProgress" | "Scheduled" | "Canceled";
    if (isCanceled) status = "Canceled";
    else if (isOver) status = "Final";
    else if (isInProgress) status = "InProgress";
    else status = "Scheduled";

    return {
      ...emptyEvent(),
      id: `nascar-${r.RaceID}`,
      sport: "motorsport" as const,
      sportKey: "nascar",
      sportLabel: r.SeriesName ? `NASCAR ${r.SeriesName}` : "NASCAR",
      status: normalizeStatus(status),
      isClosed: isOver,
      dateTime: r.DateTime ?? null,
      day: sdioDateToIso(r.Day),
      eventName: r.Name ?? null,
      venue: r.Track ?? null,
      channel: r.Broadcast ?? null,
    };
  });
}

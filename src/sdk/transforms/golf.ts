import type { components as GolfComponents } from "../generated/golf";
import { type NormalizedEvent, emptyEvent, normalizeStatus } from "./types";

type GolfTournament = GolfComponents["schemas"]["Tournament"];

export function transformGolfTournaments(tournaments: GolfTournament[]): NormalizedEvent[] {
  return tournaments.map((t) => {
    const isOver = t.IsOver ?? false;
    const isInProgress = t.IsInProgress ?? false;
    const isCanceled = t.Canceled ?? false;

    let status: "Final" | "InProgress" | "Scheduled" | "Canceled";
    if (isCanceled) status = "Canceled";
    else if (isOver) status = "Final";
    else if (isInProgress) status = "InProgress";
    else status = "Scheduled";

    const startDate = t.StartDate?.slice(0, 10) ?? null;
    const endDate = t.EndDate?.slice(0, 10) ?? null;
    const isMultiDay = !!(startDate && endDate && startDate !== endDate);

    return {
      ...emptyEvent(),
      id: `golf-${t.TournamentID}`,
      sport: "golf" as const,
      sportKey: "golf",
      sportLabel: "Golf",
      status: normalizeStatus(status),
      isClosed: isOver,
      dateTime: t.StartDateTime ?? t.StartDate ?? null,
      day: startDate,
      eventName: t.Name ?? null,
      venue: [t.Venue, t.Location].filter(Boolean).join(", ") || null,
      isMultiDay,
      endDate,
    };
  });
}

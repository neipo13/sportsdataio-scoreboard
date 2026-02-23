"use client";

import type { NormalizedEvent, SportCategory } from "../sdk/transforms/types";
import type { SportData } from "../hooks/useSportData";
import type { SportAccess } from "../sdk/clients/probe";
import { eventDetailHash } from "../lib/event-id";
import { DETAIL_REGISTRY } from "../lib/detail-configs/index";
import { LoadingSpinner } from "./LoadingSpinner";
import { TeamGameCard } from "./cards/TeamGameCard";
import { SoccerGameCard } from "./cards/SoccerGameCard";
import { MotorsportCard } from "./cards/MotorsportCard";
import { CombatEventCard } from "./cards/CombatEventCard";
import { GolfTournamentCard } from "./cards/GolfTournamentCard";

export type GetLogoUrl = (sportKey: string, teamKey: string | null) => string | null;

function CardForSport({
  event,
  sport,
  getLogoUrl,
}: {
  event: NormalizedEvent;
  sport: SportCategory;
  getLogoUrl?: GetLogoUrl;
}) {
  switch (sport) {
    case "team":
      return <TeamGameCard event={event} getLogoUrl={getLogoUrl} />;
    case "soccer":
      return <SoccerGameCard event={event} />;
    case "motorsport":
      return <MotorsportCard event={event} />;
    case "combat":
      return <CombatEventCard event={event} />;
    case "golf":
      return <GolfTournamentCard event={event} />;
  }
}

/** Check if a sport has detail sections configured */
function hasDetailPage(sportKey: string): boolean {
  return !!(DETAIL_REGISTRY as Record<string, unknown>)[sportKey];
}

function EventGrid({
  events,
  sport,
  getLogoUrl,
}: {
  events: NormalizedEvent[];
  sport: SportCategory;
  getLogoUrl?: GetLogoUrl;
}) {
  if (events.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
        No events scheduled
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const linkable = hasDetailPage(event.sportKey);
        const card = (
          <CardForSport key={event.id} event={event} sport={sport} getLogoUrl={getLogoUrl} />
        );

        if (!linkable) return <div key={event.id}>{card}</div>;

        return (
          <a
            key={event.id}
            href={eventDetailHash(event.id)}
            className="block rounded-lg transition-shadow hover:shadow-md hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50"
          >
            {card}
          </a>
        );
      })}
    </div>
  );
}

export function SportSection({
  sportAccess,
  data,
  getLogoUrl,
}: {
  sportAccess: SportAccess;
  data: SportData | undefined;
  getLogoUrl?: GetLogoUrl;
}) {
  if (!data) return null;

  // Determine sport category from events, or fall back to mapping
  const sportCategory = data.events[0]?.sport ?? getSportCategory(sportAccess.key);

  return (
    <section className="mb-8">
      <h3 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {sportAccess.displayName}
      </h3>

      {data.loading && <LoadingSpinner />}

      {data.error && (
        <p className="py-4 text-center text-sm text-red-500">{data.error}</p>
      )}

      {!data.loading && !data.error && sportCategory === "soccer" ? (
        <SoccerSection events={data.events} />
      ) : !data.loading && !data.error ? (
        <EventGrid events={data.events} sport={sportCategory} getLogoUrl={getLogoUrl} />
      ) : null}
    </section>
  );
}

function SoccerSection({ events }: { events: NormalizedEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
        No events scheduled
      </p>
    );
  }

  // Group by competition
  const byComp = new Map<string, NormalizedEvent[]>();
  for (const e of events) {
    const key = e.competitionKey ?? "other";
    const list = byComp.get(key) ?? [];
    list.push(e);
    byComp.set(key, list);
  }

  return (
    <div className="space-y-6">
      {Array.from(byComp.entries()).map(([comp, compEvents]) => (
        <div key={comp}>
          <h4 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            {compEvents[0]?.sportLabel ?? comp}
          </h4>
          <EventGrid events={compEvents} sport="soccer" />
        </div>
      ))}
    </div>
  );
}

function getSportCategory(key: string): SportCategory {
  if (key === "soccer") return "soccer";
  if (key === "nascar") return "motorsport";
  if (key === "mma") return "combat";
  if (key === "golf") return "golf";
  return "team";
}

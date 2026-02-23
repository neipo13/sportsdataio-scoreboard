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

const COMPETITION_LABELS: Record<string, string> = {
	EPL: "England - Premier League",
	DEB: "Germany - Bundesliga",
	UCL: "Europe - UEFA Champions League",
	ESP: "Spain - La Liga",
	ARP: "Argentina - Liga Profesional de Fútbol",
	ITSA: "Italy - Serie A",
	NLE: "Netherlands - Eredivisie",
	MLS: "United States - MLS",
	UEL: "Europe - UEFA Europa League",
	COPA: "South America - Copa America",
	ACN: "Africa - Africa Cup of Nations",
	LMX: "Mexico - Liga MX",
	FRL1: "France - Ligue 1",
	RFPL: "Russia - RFPL",
	BRSA: "Brazil - Série A",
	EUC: "Europe - European Championship",
	UEQ: "Europe - UEFA Euro Qualification",
	NCAG: "N/C America - CONCACAF Gold Cup",
	AUA: "Australia - A League",
	COLI: "South America - Copa Libertadores",
	FIFA: "World - FIFA World Cup",
	COSA: "South America - Copa Sudamericana",
	FPD: "Costa Rica - Liga Promérica",
	IND: "India - Indian Super League",
	FIFAF: "World - FIFA Friendlies",
	TIM: "Italy - Coppa Italia",
	EFAC: "England - FA Cup",
	EFLC: "England - Football League Cup",
	EL1: "England - League One",
	EL2: "England - League Two",
	ARCL: "Argentina - Copa Liga Profesional",
	SAWQ: "South America - WC Qualification",
	SLIG: "Türkiye - Süper Lig",
	ELC: "England - Championship",
	GTM: "Guatemala - Liga Nacional",
	BRCM: "Brazil - Campeonato Mineiro",
	ASWQ: "Asia - WC Qualification",
	AFWQ: "Africa - WC Qualification",
	NAWQ: "N/C America - WC Qualification",
	OWQ: "Oceania - WC Qualification",
	EWQ: "Europe - WC Qualification",
	NOR1: "Norway - Eliteserien",
	UPL: "Ukraine - Premier Liha",
	DEN1: "Denmark - Superliga",
	ENL: "England - National League",
	UNL: "Europe - UEFA Nations League",
	WEUC: "Europe - UEFA Women's EURO",
	FIFAW: "World - FIFA Women's World Cup",
	LEC: "N/C America - Leagues Cup",
	SPL: "Saudi Arabia - Saudi Professional League",
	SKC: "Saudi Arabia - King Cup",
	J1L: "Japan - J. League",
	CONL: "N/C America - Concacaf Nations League",
	SCOP: "Scotland - Premiership",
	UCOL: "Europe - UEFA Europa Conference League",
	BR2: "Brazil - Série B",
	PR1: "Peru - Primera División",
	FR2: "France - Ligue 2",
	CSL: "China PR - Chinese Super League",
	ITSB: "Italy - Serie B",
	ES2: "Spain - La Liga 2",
	HR1: "Croatia - Prva Liga",
	SVK1: "Slovakia - Nikè Liga",
	TRSK: "Türkiye - TFF Süper Kupa",
	PTC: "Portugal - Taça de Portugal",
	CH1: "Chile - Primera División",
	ATC: "Austria - ÖFB Cup",
	COLA: "Colombia - Liga Águila",
	AUC: "Australia - Australia Cup",
	GRC: "Greece - Greek Cup ",
	SCOC: "Scotland - Scottish Cup",
	NLC: "Netherlands - KNVB Beker",
	BRCO: "Brazil - Copa do Brasil",
	BL2: "Germany - 2. Bundesliga",
	CWC: "World - FIFA Club World Cup",
	POR1: "Portugal - Liga Portugal",
	CDR: "Spain - Copa del Rey",
	CDF: "France - Coupe de France",
	DFBP: "Germany - DFB-Pokal",
	KL1: "Korea Republic - K League 1",
	J2L: "Japan - J2 League",
	NWSL: "United States - NWSL",
	UWCL: "Europe - UEFA Women's Champions League",
	ICWQ: "World - WCQ Inter-Confederation Playoffs",
	J1VL: "Japan - J1 100 Year Vision League",
	J2VL: "Japan - J2/J3 100 Year Vision League",
	ESSC: "Spain - Supercopa de España",
	MAR1: "Morocco - Botola Pro",
	EGY1: "Egypt - Egyptian Premier League",
	CZE1: "Czechia - Fortuna Liga",
	BOL1: "Bolivia - LFPB",
	ROU1: "Romania - SuperLiga",
};

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
            {COMPETITION_LABELS[comp] ?? comp}
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

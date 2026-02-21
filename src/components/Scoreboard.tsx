"use client";

import { useMemo } from "react";
import { useAppState } from "../hooks/useAppState";
import { useSportData } from "../hooks/useSportData";
import { useTeamLogos } from "../hooks/useTeamLogos";
import { useStadiumLookup } from "../hooks/useStadiumLookup";
import type { SportKey } from "../sdk/clients/probe";
import { ApiKeyPrompt } from "./ApiKeyPrompt";
import { DateNavigator } from "./DateNavigator";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorBanner } from "./ErrorBanner";
import { SportSection } from "./SportSection";
import { LastPolled } from "./LastPolled";

// Display order for sports
const SPORT_ORDER: SportKey[] = [
  "nba", "nfl", "nhl", "mlb",
  "cbb", "cfb", "wnba", "cwbb",
  "soccer", "nascar", "mma", "golf",
];

export function Scoreboard() {
  const { state, dispatch, submitKey, logout, retryProbe } = useAppState();

  const accessibleKeys = useMemo(
    () => state.accessibleSports.filter((s) => s.accessible).map((s) => s.key),
    [state.accessibleSports],
  );

  const stadiumMaps = useStadiumLookup(accessibleKeys);

  const { data: sportData, lastPolled } = useSportData(
    state.selectedDate,
    accessibleKeys,
    state.accessibleCompetitions,
    state.selectedSport,
    stadiumMaps,
  );

  const getLogoUrl = useTeamLogos(accessibleKeys);

  if (state.phase === "needsKey") {
    return <ApiKeyPrompt onSubmit={submitKey} />;
  }

  if (state.phase === "probing") {
    return <LoadingSpinner message="Detecting accessible sports..." />;
  }

  if (state.phase === "error") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorBanner
          message={state.probeError ?? "An error occurred"}
          onRetry={retryProbe}
          onChangeKey={logout}
        />
      </div>
    );
  }

  // phase === "ready"
  const allOrdered = SPORT_ORDER.filter((k) => accessibleKeys.includes(k));
  const orderedSports =
    state.selectedSport === "all"
      ? allOrdered
      : allOrdered.filter((k) => k === state.selectedSport);
  const accessMap = new Map(state.accessibleSports.map((s) => [s.key, s]));

  return (
    <div>
      <DateNavigator
        selectedDate={state.selectedDate}
        onPrev={() => dispatch({ type: "PREV_DAY" })}
        onNext={() => dispatch({ type: "NEXT_DAY" })}
        onToday={() => dispatch({ type: "TODAY" })}
        onSetDate={(d) => dispatch({ type: "SET_DATE", date: d })}
        onChangeKey={logout}
        accessibleSports={allOrdered}
        selectedSport={state.selectedSport}
        onSelectSport={(s) => dispatch({ type: "SET_SPORT", sport: s })}
      />

      <main className="mx-auto max-w-5xl px-4 py-6">
        {orderedSports.map((key) => {
          const access = accessMap.get(key);
          if (!access) return null;
          return (
            <SportSection
              key={key}
              sportAccess={access}
              data={sportData[key]}
              getLogoUrl={getLogoUrl}
            />
          );
        })}
      </main>

      <LastPolled timestamp={lastPolled} />
    </div>
  );
}

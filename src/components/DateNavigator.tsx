"use client";

import type { SportKey } from "../sdk/clients/probe";
import { todayIso } from "../sdk/transforms/date-utils";

const SPORT_LABELS: Record<SportKey, string> = {
  nba: "NBA",
  nfl: "NFL",
  nhl: "NHL",
  mlb: "MLB",
  cbb: "CBB",
  cfb: "CFB",
  wnba: "WNBA",
  cwbb: "CWBB",
  soccer: "Soccer",
  nascar: "NASCAR",
  mma: "MMA",
  golf: "Golf",
};

export function DateNavigator({
  selectedDate,
  onPrev,
  onNext,
  onToday,
  onSetDate,
  onChangeKey,
  accessibleSports,
  selectedSport,
  onSelectSport,
}: {
  selectedDate: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSetDate: (iso: string) => void;
  onChangeKey: () => void;
  accessibleSports: SportKey[];
  selectedSport: SportKey | "all";
  onSelectSport: (sport: SportKey | "all") => void;
}) {
  const isToday = selectedDate === todayIso();

  return (
    <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto max-w-5xl px-4 py-3">
        {/* Date row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Previous day"
            >
              &larr;
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onSetDate(e.target.value);
              }}
              className="rounded-md border border-zinc-300 bg-transparent px-2.5 py-1 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
            <button
              onClick={onNext}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Next day"
            >
              &rarr;
            </button>
            {!isToday && (
              <button
                onClick={onToday}
                className="ml-2 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Today
              </button>
            )}
          </div>
          <button
            onClick={onChangeKey}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            Change Key
          </button>
        </div>

        {/* Sport pills */}
        {accessibleSports.length > 0 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
            <button
              onClick={() => onSelectSport("all")}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedSport === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              All
            </button>
            {accessibleSports.map((key) => (
              <button
                key={key}
                onClick={() => onSelectSport(key)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSport === key
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {SPORT_LABELS[key]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

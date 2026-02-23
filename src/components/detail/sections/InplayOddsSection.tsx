"use client";

import { useCallback, useState } from "react";
import type { FetchContext, SectionFetchResult } from "../../../lib/detail-registry";

interface GameOdd {
  GameOddId?: number;
  Sportsbook?: string | null;
  HomeMoneyLine?: number | null;
  AwayMoneyLine?: number | null;
  HomePointSpread?: number | null;
  AwayPointSpread?: number | null;
  HomePointSpreadPayout?: number | null;
  AwayPointSpreadPayout?: number | null;
  OverUnder?: number | null;
  OverPayout?: number | null;
  UnderPayout?: number | null;
  OddType?: string | null;
  Updated?: string | null;
}

interface GameInfo {
  GameId?: number;
  HomeTeamName?: string | null;
  AwayTeamName?: string | null;
  LiveOdds?: GameOdd[];
}

function formatOdds(value: number | null | undefined): string {
  if (value == null) return "-";
  return value > 0 ? `+${value}` : `${value}`;
}

export function InplayOddsSection({ data, ctx, fetchLineMovement }: { data: unknown; ctx: FetchContext; fetchLineMovement?: (ctx: FetchContext) => Promise<SectionFetchResult> }) {
  const allGames = (data ?? []) as GameInfo[];
  const gameId = Number(ctx.parsed.rawId);
  const game = allGames.find((g) => g.GameId === gameId);
  const odds = game?.LiveOdds ?? [];

  const [lineMovement, setLineMovement] = useState<GameOdd[] | null>(null);
  const [loadingLM, setLoadingLM] = useState(false);

  const handleLoadLineMovement = useCallback(async () => {
    if (lineMovement) {
      setLineMovement(null);
      return;
    }
    if (!fetchLineMovement) return;
    setLoadingLM(true);
    try {
      const result = await fetchLineMovement(ctx);
      const games = (result.data ?? []) as GameInfo[];
      const found = games.find((g) => g.GameId === gameId);
      setLineMovement(found?.LiveOdds ?? []);
    } catch {
      setLineMovement([]);
    } finally {
      setLoadingLM(false);
    }
  }, [lineMovement, ctx, fetchLineMovement, gameId]);

  if (!game && allGames.length > 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">
        No in-play odds for this game (game may not be in progress)
      </p>
    );
  }

  if (odds.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">
        No in-play odds available (game may not be in progress)
      </p>
    );
  }

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
        Live Odds
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <th className="px-2 py-1.5 text-left font-medium">Sportsbook</th>
              <th className="px-2 py-1.5 text-left font-medium">Type</th>
              <th className="px-2 py-1.5 text-right font-medium">Home ML</th>
              <th className="px-2 py-1.5 text-right font-medium">Away ML</th>
              <th className="px-2 py-1.5 text-right font-medium">Home Spread</th>
              <th className="px-2 py-1.5 text-right font-medium">Away Spread</th>
              <th className="px-2 py-1.5 text-right font-medium">O/U</th>
            </tr>
          </thead>
          <tbody>
            {odds.map((o, i) => (
              <tr key={o.GameOddId ?? i} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  {o.Sportsbook ?? "-"}
                </td>
                <td className="px-2 py-1.5 text-zinc-500 dark:text-zinc-400">
                  {o.OddType ?? "-"}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatOdds(o.HomeMoneyLine)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatOdds(o.AwayMoneyLine)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {o.HomePointSpread != null ? formatOdds(o.HomePointSpread) : "-"}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {o.AwayPointSpread != null ? formatOdds(o.AwayPointSpread) : "-"}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                  {o.OverUnder ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fetchLineMovement && (
        <button
          onClick={handleLoadLineMovement}
          disabled={loadingLM}
          className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {loadingLM ? "Loading..." : lineMovement ? "Hide Line Movement" : "Show Line Movement"}
        </button>
      )}

      {lineMovement && lineMovement.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <h4 className="mb-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            Live Line Movement
          </h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                <th className="px-2 py-1.5 text-left font-medium">Sportsbook</th>
                <th className="px-2 py-1.5 text-right font-medium">Home ML</th>
                <th className="px-2 py-1.5 text-right font-medium">Away ML</th>
                <th className="px-2 py-1.5 text-right font-medium">Spread</th>
                <th className="px-2 py-1.5 text-right font-medium">O/U</th>
                <th className="px-2 py-1.5 text-right font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {lineMovement.map((o, i) => (
                <tr key={o.GameOddId ?? i} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                    {o.Sportsbook ?? "-"}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {formatOdds(o.HomeMoneyLine)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {formatOdds(o.AwayMoneyLine)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {o.HomePointSpread != null ? formatOdds(o.HomePointSpread) : "-"}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {o.OverUnder ?? "-"}
                  </td>
                  <td className="px-2 py-1.5 text-right text-zinc-400">
                    {o.Updated ? new Date(o.Updated).toLocaleTimeString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {lineMovement && lineMovement.length === 0 && (
        <p className="mt-2 text-xs text-zinc-400">No line movement data available</p>
      )}
    </div>
  );
}

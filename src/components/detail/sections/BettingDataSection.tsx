"use client";

import { useMemo, useState } from "react";
import type { FetchContext } from "../../../lib/detail-registry";

interface Sportsbook {
  SportsbookID?: number;
  Name?: string | null;
}

interface BettingOutcome {
  BettingOutcomeID?: number | null;
  SportsBook?: Sportsbook;
  BettingOutcomeType?: string | null;
  PayoutAmerican?: number | null;
  Value?: number | null;
  Participant?: string | null;
  IsAvailable?: boolean | null;
}

interface BettingMarket {
  BettingMarketID?: number;
  BettingMarketTypeID?: number | null;
  BettingMarketType?: string | null;
  BettingBetTypeID?: number | null;
  BettingBetType?: string | null;
  BettingPeriodTypeID?: number | null;
  BettingPeriodType?: string | null;
  Name?: string | null;
  PlayerName?: string | null;
  TeamKey?: string | null;
  BettingOutcomes?: BettingOutcome[];
}

type BettingMarketsData = BettingMarket[];

function formatOdds(value: number | null | undefined): string {
  if (value == null) return "-";
  return value > 0 ? `+${value}` : `${value}`;
}

export function BettingDataSection({ data }: { data: unknown; ctx: FetchContext }) {
  const markets = (data ?? []) as BettingMarketsData;

  // Extract unique market types and period types for filters
  const { marketTypes, periodTypes } = useMemo(() => {
    const mt = new Map<number, string>();
    const pt = new Map<number, string>();
    for (const m of markets) {
      if (m.BettingMarketTypeID != null && m.BettingMarketType) {
        mt.set(m.BettingMarketTypeID, m.BettingMarketType);
      }
      if (m.BettingPeriodTypeID != null && m.BettingPeriodType) {
        pt.set(m.BettingPeriodTypeID, m.BettingPeriodType);
      }
    }
    return {
      marketTypes: Array.from(mt.entries()).sort((a, b) => a[0] - b[0]),
      periodTypes: Array.from(pt.entries()).sort((a, b) => a[0] - b[0]),
    };
  }, [markets]);

  const [selectedMarketType, setSelectedMarketType] = useState<number | null>(null);
  const [selectedPeriodType, setSelectedPeriodType] = useState<number | null>(null);

  const filteredMarkets = useMemo(() => {
    return markets.filter((m) => {
      if (selectedMarketType != null && m.BettingMarketTypeID !== selectedMarketType) return false;
      if (selectedPeriodType != null && m.BettingPeriodTypeID !== selectedPeriodType) return false;
      return true;
    });
  }, [markets, selectedMarketType, selectedPeriodType]);

  if (markets.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">
        No betting markets available
      </p>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Market Type</label>
          <select
            value={selectedMarketType ?? ""}
            onChange={(e) => setSelectedMarketType(e.target.value ? Number(e.target.value) : null)}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="">All</option>
            {marketTypes.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Period Type</label>
          <select
            value={selectedPeriodType ?? ""}
            onChange={(e) => setSelectedPeriodType(e.target.value ? Number(e.target.value) : null)}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="">All</option>
            {periodTypes.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div className="self-end text-xs text-zinc-400">
          {filteredMarkets.length} market{filteredMarkets.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Markets */}
      <div className="space-y-4">
        {filteredMarkets.map((market) => (
          <MarketCard key={market.BettingMarketID} market={market} />
        ))}
      </div>
    </div>
  );
}

function MarketCard({ market }: { market: BettingMarket }) {
  const outcomes = market.BettingOutcomes ?? [];

  // Group outcomes by sportsbook
  const bySportsbook = new Map<string, BettingOutcome[]>();
  for (const o of outcomes) {
    const name = o.SportsBook?.Name ?? "Unknown";
    const list = bySportsbook.get(name) ?? [];
    list.push(o);
    bySportsbook.set(name, list);
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {market.Name ?? "Market"}
        </h4>
        <span className="text-[10px] text-zinc-400">
          {market.BettingBetType} · {market.BettingPeriodType}
        </span>
      </div>

      {outcomes.length === 0 ? (
        <p className="text-xs text-zinc-400">No outcomes available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700">
                <th className="px-2 py-1 text-left font-medium">Sportsbook</th>
                <th className="px-2 py-1 text-left font-medium">Outcome</th>
                <th className="px-2 py-1 text-left font-medium">Participant</th>
                <th className="px-2 py-1 text-right font-medium">Odds</th>
                <th className="px-2 py-1 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(bySportsbook.entries()).map(([sbName, sbOutcomes]) =>
                sbOutcomes.map((o, i) => (
                  <tr
                    key={`${sbName}-${o.BettingOutcomeID ?? i}`}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    {i === 0 && (
                      <td
                        className="px-2 py-1 font-medium text-zinc-700 dark:text-zinc-300"
                        rowSpan={sbOutcomes.length}
                      >
                        {sbName}
                      </td>
                    )}
                    <td className="px-2 py-1 text-zinc-600 dark:text-zinc-400">
                      {o.BettingOutcomeType ?? "-"}
                    </td>
                    <td className="px-2 py-1 text-zinc-700 dark:text-zinc-300">
                      {o.Participant ?? "-"}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatOdds(o.PayoutAmerican)}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {o.Value ?? "-"}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseEventId } from "../../lib/event-id";
import { DETAIL_REGISTRY } from "../../lib/detail-configs/index";
import type { FetchContext } from "../../lib/detail-registry";
import { normalizeStatus } from "../../sdk/transforms/types";
import { useAppState } from "../../hooks/useAppState";
import { DetailHeader, type HeaderInfo } from "./DetailHeader";
import { DetailTabBar, type TabInfo } from "./DetailTabBar";
import { SectionSkeleton } from "./SectionSkeleton";
import { SectionError } from "./SectionError";
import { LastPolled } from "../LastPolled";

const LIVE_POLL_KEYS = new Set(["boxscore", "linescore", "playbyplay", "inplay-odds"]);
const PREGAME_POLL_KEYS = new Set(["betting", "pregame-odds", "projections"]);
const LIVE_INTERVAL_MS = 5_000;
const PREGAME_INTERVAL_MS = 60_000;

type GamePhase = "pregame" | "live" | "closed" | "unknown";

function getGamePhase(info: HeaderInfo | null): GamePhase {
  if (!info) return "unknown";
  if (info.isClosed) return "closed";

  const { status, dateTime } = info;
  if (status === "InProgress" || status === "Suspended" || status === "Delayed") return "live";

  if (status === "Scheduled") {
    if (dateTime) {
      const start = new Date(dateTime).getTime();
      if (start <= Date.now()) return "live";
    }
    return "pregame";
  }

  if (status === "Final") return "closed";

  // Canceled, Postponed, Unknown
  return "unknown";
}

const DEFAULT_SB_GROUP = "G1001";
const SB_GROUP_KEY = "sdio-sportsbook-group";

function getSavedSbGroup(): string {
  return localStorage.getItem(SB_GROUP_KEY) || DEFAULT_SB_GROUP;
}

interface SectionState {
  status: "idle" | "loading" | "loaded" | "error" | "unauthorized";
  data: unknown;
  error: string | null;
}

export function EventDetailPage({
  eventId,
  initialTab,
}: {
  eventId: string;
  initialTab?: string;
}) {
  const { state } = useAppState();
  const parsed = useMemo(() => parseEventId(eventId), [eventId]);
  const sportConfig = parsed ? DETAIL_REGISTRY[parsed.sportKey] : undefined;
  const sections = sportConfig?.sections ?? [];

  const [sportsbookGroup, setSportsbookGroup] = useState(DEFAULT_SB_GROUP);
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({});
  const [availableTabs, setAvailableTabs] = useState<TabInfo[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialTab ?? "");
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const probeRanRef = useRef(false);
  const headerInfoRef = useRef<HeaderInfo | null>(null);
  const sectionStatesRef = useRef<Record<string, SectionState>>({});

  // Sync sportsbook group from localStorage after hydration
  useEffect(() => {
    const saved = getSavedSbGroup();
    if (saved !== DEFAULT_SB_GROUP) setSportsbookGroup(saved);
  }, []);

  // Save sportsbook group to localStorage
  const handleSbGroupChange = useCallback((value: string) => {
    setSportsbookGroup(value);
    localStorage.setItem(SB_GROUP_KEY, value);
  }, []);

  // Build fetch context
  const fetchCtx: FetchContext | null = useMemo(() => {
    if (!parsed) return null;
    return {
      parsed,
      date: state.selectedDate,
      sportsbookGroup,
    };
  }, [parsed, state.selectedDate, sportsbookGroup]);

  // Probe all sections on mount to determine which tabs to show
  useEffect(() => {
    if (!fetchCtx || sections.length === 0 || probeRanRef.current) return;
    probeRanRef.current = true;

    const probeAll = async () => {
      const results = await Promise.allSettled(
        sections.map(async (section) => {
          setSectionStates((prev) => ({
            ...prev,
            [section.key]: { status: "loading", data: null, error: null },
          }));

          try {
            const result = await section.fetch(fetchCtx);

            // Extract header info from box score or first successful fetch
            // NFL uses "Score" instead of "Game", and different field names
            if (result.data && typeof result.data === "object") {
              const rd = result.data as Record<string, unknown>;
              const game = (rd.Game ?? rd.Score) as Record<string, unknown> | undefined;
              if (game) {
                setHeaderInfo((prev) => prev ?? {
                  homeTeam: (game.HomeTeam as string) ?? null,
                  awayTeam: (game.AwayTeam as string) ?? null,
                  homeScore: (game.HomeTeamScore as number) ?? (game.HomeScore as number) ?? null,
                  awayScore: (game.AwayTeamScore as number) ?? (game.AwayScore as number) ?? null,
                  status: normalizeStatus(game.Status as string),
                  gameStatus: null,
                  eventName: null,
                  dateTime: (game.DateTime as string) ?? (game.Date as string) ?? null,
                  isClosed: !!(game.IsClosed),
                });
              }
            }

            setSectionStates((prev) => ({
              ...prev,
              [section.key]: { status: "loaded", data: result.data, error: null },
            }));

            return { key: section.key, label: section.label, available: true };
          } catch (err) {
            const status = (err as { status?: number })?.status;
            if (status === 401) {
              setSectionStates((prev) => ({
                ...prev,
                [section.key]: { status: "unauthorized", data: null, error: null },
              }));
              return { key: section.key, label: section.label, available: false };
            }
            setSectionStates((prev) => ({
              ...prev,
              [section.key]: {
                status: "error",
                data: null,
                error: err instanceof Error ? err.message : "Failed to load",
              },
            }));
            // Still show the tab so the error is visible
            return { key: section.key, label: section.label, available: true };
          }
        }),
      );

      const tabs: TabInfo[] = [];
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.available) {
          tabs.push({ key: r.value.key, label: r.value.label });
        }
      }
      setAvailableTabs(tabs);

      // Set active tab to initialTab if available, otherwise first
      if (tabs.length > 0) {
        setActiveTab((prev) => {
          if (prev && tabs.some((t) => t.key === prev)) return prev;
          return tabs[0].key;
        });
      }
    };

    probeAll();
  }, [fetchCtx, sections]);

  // Keep refs in sync so polling reads fresh state without re-triggering intervals
  useEffect(() => { headerInfoRef.current = headerInfo; }, [headerInfo]);
  useEffect(() => { sectionStatesRef.current = sectionStates; }, [sectionStates]);

  // Polling for live & pregame data
  useEffect(() => {
    if (!fetchCtx || sections.length === 0) return;

    let lastPregamePoll = 0;
    let polling = false;

    const tick = async () => {
      const info = headerInfoRef.current;
      const phase = getGamePhase(info);
      if (phase === "closed" || phase === "unknown" || polling) return;

      const states = sectionStatesRef.current;
      const now = Date.now();

      // Determine which section keys to re-fetch this tick
      let keysToFetch: string[];
      if (phase === "live") {
        keysToFetch = sections
          .filter((s) => LIVE_POLL_KEYS.has(s.key) && states[s.key]?.status === "loaded")
          .map((s) => s.key);
      } else {
        // pregame — only poll if enough time has passed
        if (now - lastPregamePoll < PREGAME_INTERVAL_MS) return;
        keysToFetch = sections
          .filter((s) => PREGAME_POLL_KEYS.has(s.key) && states[s.key]?.status === "loaded")
          .map((s) => s.key);
      }

      if (keysToFetch.length === 0) return;
      polling = true;

      try {
        const results = await Promise.allSettled(
          keysToFetch.map(async (key) => {
            const section = sections.find((s) => s.key === key)!;
            const result = await section.fetch(fetchCtx);
            return { key, result };
          }),
        );

        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          const { key, result } = r.value;

          setSectionStates((prev) => ({
            ...prev,
            [key]: { status: "loaded", data: result.data, error: null },
          }));

          // Update header from boxscore refreshes
          if (key === "boxscore" && result.data && typeof result.data === "object") {
            const rd = result.data as Record<string, unknown>;
            const game = (rd.Game ?? rd.Score) as Record<string, unknown> | undefined;
            if (game) {
              setHeaderInfo({
                homeTeam: (game.HomeTeam as string) ?? null,
                awayTeam: (game.AwayTeam as string) ?? null,
                homeScore: (game.HomeTeamScore as number) ?? (game.HomeScore as number) ?? null,
                awayScore: (game.AwayTeamScore as number) ?? (game.AwayScore as number) ?? null,
                status: normalizeStatus(game.Status as string),
                gameStatus: (game.GameStatus as string) ?? null,
                eventName: null,
                dateTime: (game.DateTime as string) ?? (game.Date as string) ?? null,
                isClosed: !!(game.IsClosed),
              });
            }
          }
        }

        if (phase === "pregame") lastPregamePoll = now;
        setLastPolled(new Date());
      } catch {
        // Silently ignore poll errors — keep showing stale data
      } finally {
        polling = false;
      }
    };

    const id = setInterval(tick, LIVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchCtx, sections]);

  // Handle tab selection — update URL hash
  const handleSelectTab = useCallback(
    (key: string) => {
      setActiveTab(key);
      window.history.replaceState(null, "", `#/event/${eventId}/${key}`);
    },
    [eventId],
  );

  if (!parsed) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <a href="#/" className="text-sm text-blue-500 hover:text-blue-600">
          Back to Dashboard
        </a>
        <p className="mt-4 text-zinc-500">Invalid event ID</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <DetailHeader parsed={parsed} info={headerInfo} />
        <p className="text-center text-sm text-zinc-400">
          No detail data available for {parsed.sportKey.toUpperCase()}
        </p>
      </div>
    );
  }

  const activeSection = sections.find((s) => s.key === activeTab);
  const activeSectionState = activeTab ? sectionStates[activeTab] : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <DetailHeader parsed={parsed} info={headerInfo} />

      {/* Sportsbook group input */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">
          Sportsbook Group:
        </label>
        <input
          type="text"
          value={sportsbookGroup}
          onChange={(e) => handleSbGroupChange(e.target.value)}
          className="w-24 rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      <DetailTabBar tabs={availableTabs} activeTab={activeTab} onSelectTab={handleSelectTab} />

      <div className="mt-4">
        {activeSectionState?.status === "loading" && <SectionSkeleton />}
        {activeSectionState?.status === "error" && (
          <SectionError message={activeSectionState.error ?? "Failed to load"} />
        )}
        {activeSectionState?.status === "loaded" && activeSection && fetchCtx && (
          <activeSection.component data={activeSectionState.data} ctx={fetchCtx} fetchLineMovement={activeSection.fetchLineMovement} />
        )}
        {!activeSectionState && availableTabs.length === 0 && (
          <SectionSkeleton />
        )}
      </div>

      {lastPolled && getGamePhase(headerInfo) !== "closed" && getGamePhase(headerInfo) !== "unknown" && (
        <LastPolled timestamp={lastPolled} />
      )}
    </div>
  );
}

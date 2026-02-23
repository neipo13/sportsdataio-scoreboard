"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { getApiKey, setApiKey, clearApiKey } from "../sdk/clients/base";
import { probeAllSports, type SportKey, type SportAccess } from "../sdk/clients/probe";
import { soccer } from "../sdk/clients/index";
import { todayIso } from "../sdk/transforms/date-utils";

// Known soccer competitions to probe
const KNOWN_COMPETITIONS = [
  "EPL", "DEB", "UCL", "ESP", "ARP", "ITSA", "NLE", "MLS", "UEL",
  "COPA", "ACN", "LMX", "FRL1", "RFPL", "BRSA", "EUC", "UEQ",
  "NCAG", "AUA", "COLI", "FIFA", "COSA", "FPD", "IND", "FIFAF",
  "TIM", "EFAC", "EFLC", "EL1", "EL2", "ARCL", "SAWQ", "SLIG",
  "ELC", "GTM", "BRCM", "ASWQ", "AFWQ", "NAWQ", "OWQ", "EWQ",
  "NOR1", "UPL", "DEN1", "ENL", "UNL", "WEUC", "FIFAW", "LEC",
  "SPL", "SKC", "J1L", "CONL", "SCOP", "UCOL", "BR2", "PR1",
  "FR2", "CSL", "ITSB", "ES2", "HR1", "SVK1", "TRSK", "PTC",
  "CH1", "ATC", "COLA", "AUC", "GRC", "SCOC", "NLC", "BRCO",
  "BL2", "CWC", "POR1", "CDR", "CDF", "DFBP", "KL1", "J2L",
  "NWSL", "UWCL", "ICWQ", "J1VL", "J2VL", "ESSC", "MAR1", "EGY1",
  "CZE1", "BOL1", "ROU1", "BEL1",
];

export type Phase = "needsKey" | "probing" | "ready" | "error";

export interface AppState {
  apiKey: string | null;
  phase: Phase;
  accessibleSports: SportAccess[];
  accessibleCompetitions: string[];
  selectedDate: string; // ISO date YYYY-MM-DD
  selectedSport: SportKey | "all";
  probeError: string | null;
}

type Action =
  | { type: "SET_API_KEY"; key: string }
  | { type: "PROBE_START" }
  | { type: "PROBE_SUCCESS"; sports: SportAccess[]; competitions: string[] }
  | { type: "PROBE_ERROR"; error: string }
  | { type: "CLEAR_KEY" }
  | { type: "SET_DATE"; date: string }
  | { type: "PREV_DAY" }
  | { type: "NEXT_DAY" }
  | { type: "TODAY" }
  | { type: "SET_SPORT"; sport: SportKey | "all" };

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_API_KEY":
      return { ...state, apiKey: action.key, phase: "probing", probeError: null };
    case "PROBE_START":
      return { ...state, phase: "probing", probeError: null };
    case "PROBE_SUCCESS":
      return {
        ...state,
        phase: "ready",
        accessibleSports: action.sports,
        accessibleCompetitions: action.competitions,
        probeError: null,
      };
    case "PROBE_ERROR":
      return { ...state, phase: "error", probeError: action.error };
    case "CLEAR_KEY":
      return {
        ...state,
        apiKey: null,
        phase: "needsKey",
        accessibleSports: [],
        accessibleCompetitions: [],
        probeError: null,
      };
    case "SET_DATE":
      return { ...state, selectedDate: action.date };
    case "PREV_DAY":
      return { ...state, selectedDate: shiftDate(state.selectedDate, -1) };
    case "NEXT_DAY":
      return { ...state, selectedDate: shiftDate(state.selectedDate, 1) };
    case "TODAY":
      return { ...state, selectedDate: todayIso() };
    case "SET_SPORT":
      return { ...state, selectedSport: action.sport };
    default:
      return state;
  }
}

function initialState(): AppState {
  return {
    apiKey: null,
    phase: "needsKey",
    accessibleSports: [],
    accessibleCompetitions: [],
    selectedDate: todayIso(),
    selectedSport: "all",
    probeError: null,
  };
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  submitKey: (key: string) => void;
  logout: () => void;
  retryProbe: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

async function runProbe(dispatch: Dispatch<Action>) {
  dispatch({ type: "PROBE_START" });
  try {
    const [sportsResult, competitionsResult] = await Promise.allSettled([
      probeAllSports(),
      soccer.probeCompetitions(KNOWN_COMPETITIONS),
    ]);

    const sports =
      sportsResult.status === "fulfilled" ? sportsResult.value : [];
    const competitions =
      competitionsResult.status === "fulfilled" ? competitionsResult.value : [];

    const anyAccessible = sports.some((s) => s.accessible);
    if (!anyAccessible) {
      dispatch({
        type: "PROBE_ERROR",
        error: "No sports accessible with this API key. Check that your key is valid.",
      });
      return;
    }

    dispatch({ type: "PROBE_SUCCESS", sports, competitions });
  } catch (err) {
    dispatch({
      type: "PROBE_ERROR",
      error: err instanceof Error ? err.message : "Probe failed",
    });
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // On mount, check localStorage for existing key
  useEffect(() => {
    const existing = getApiKey();
    if (existing) {
      dispatch({ type: "SET_API_KEY", key: existing });
    }
  }, []);

  // When phase transitions to "probing", run the probe
  useEffect(() => {
    if (state.phase === "probing" && state.apiKey) {
      runProbe(dispatch);
    }
  }, [state.phase, state.apiKey]);

  const submitKey = useCallback((key: string) => {
    setApiKey(key);
    dispatch({ type: "SET_API_KEY", key });
  }, []);

  const logout = useCallback(() => {
    clearApiKey();
    dispatch({ type: "CLEAR_KEY" });
  }, []);

  const retryProbe = useCallback(() => {
    if (state.apiKey) {
      runProbe(dispatch);
    }
  }, [state.apiKey]);

  return (
    <AppContext value={{ state, dispatch, submitKey, logout, retryProbe }}>
      {children}
    </AppContext>
  );
}

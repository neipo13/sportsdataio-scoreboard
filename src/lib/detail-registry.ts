import type { SportKey } from "../sdk/clients/probe";
import type { ParsedEventId } from "./event-id";
import type { ComponentType } from "react";

/** Context passed to each section's fetch function */
export interface FetchContext {
  parsed: ParsedEventId;
  date: string; // ISO date YYYY-MM-DD
  sportsbookGroup: string;
}

/** Result from a section fetch */
export interface SectionFetchResult<T = unknown> {
  data: T;
  status: number;
}

/** Configuration for a single detail section (tab) */
export interface DetailSectionConfig<T = unknown> {
  /** Unique key for this section (used in URL hash) */
  key: string;
  /** Display label in the tab bar */
  label: string;
  /** Fetch data for this section. Throw on error. Return { data, status }. */
  fetch: (ctx: FetchContext) => Promise<SectionFetchResult<T>>;
  /** Component to render the section data */
  component: ComponentType<{ data: T; ctx: FetchContext }>;
}

/** Per-sport detail configuration */
export interface SportDetailConfig {
  sections: DetailSectionConfig[];
}

/** The registry mapping sport keys to their detail configs */
export type DetailRegistry = Partial<Record<SportKey, SportDetailConfig>>;

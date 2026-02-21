const SDIO_MONTHS: Record<string, string> = {
  JAN: "01", FEB: "02", MAR: "03", APR: "04",
  MAY: "05", JUN: "06", JUL: "07", AUG: "08",
  SEP: "09", OCT: "10", NOV: "11", DEC: "12",
};

/**
 * Parses SDIO's standard date format YYYY-MMM-DD (e.g., "2025-FEB-20")
 * into an ISO date string "2025-02-20".
 */
export function sdioDateToIso(sdioDate: string | null | undefined): string | null {
  if (!sdioDate) return null;
  // Handle case where it's already ISO-formatted
  if (/^\d{4}-\d{2}-\d{2}/.test(sdioDate)) return sdioDate;
  const parts = sdioDate.split("-");
  if (parts.length < 3) return sdioDate;
  const [year, monthAbbr, day] = parts;
  const month = SDIO_MONTHS[monthAbbr?.toUpperCase()] ?? monthAbbr;
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given date falls within a multi-day range.
 * Both start and end should be ISO date strings (YYYY-MM-DD).
 */
export function isDateInRange(
  date: string,
  start: string | null | undefined,
  end: string | null | undefined,
): boolean {
  if (!start) return false;
  const d = date.slice(0, 10);
  const s = start.slice(0, 10);
  const e = end?.slice(0, 10) ?? s;
  return d >= s && d <= e;
}

/**
 * Returns today's date as a YYYY-MM-DD string in the local timezone.
 */
export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

import createClient, { type Middleware } from "openapi-fetch";

const API_KEY_STORAGE_KEY = "sdio-api-key";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const key = getApiKey();
    if (key) {
      const url = new URL(request.url);
      url.searchParams.set("key", key);
      return new Request(url, request);
    }
    return request;
  },
};

export function createSportClient<Paths extends {}>(baseUrl: string) {
  const client = createClient<Paths>({ baseUrl });
  client.use(authMiddleware);
  return client;
}

/** Format a Date as SDIO's standard date string: YYYY-MMM-DD (e.g., 2025-FEB-20) */
export function formatSdioDate(date: Date): string {
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const y = date.getFullYear();
  const m = months[date.getMonth()];
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format a Date as YYYY-MM-DD for soccer API */
export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

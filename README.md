# SDIO Scoreboard

A client-side web app for [Sportsdata.io](https://sportsdata.io/) subscribers to view live scores and daily events across all their subscribed sports. No backend — your API key stays in your browser.

## Supported Sports

| Sport | Card Type |
|-------|-----------|
| NBA, NFL, NHL, MLB, CBB, CFB, WNBA, CWBB | Team game (scores, odds, status) |
| Soccer (EPL, MLS, La Liga, etc.) | Team game, sub-grouped by competition |
| NASCAR | Race (name, track, broadcast) |
| MMA | Event + expandable fight card |
| Golf | Tournament (venue, date range) |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A Sportsdata.io API key (subscription key)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be prompted to enter your SDIO API key. The app probes each sport to detect which ones your key can access, then shows a daily scoreboard for those sports.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (static export to `out/`) |
| `npm run lint` | Run ESLint |
| `npm run sdk:download` | Download OpenAPI specs to `specs/` |
| `npm run sdk:generate` | Generate TypeScript types from specs |
| `npm run sdk:refresh` | Download + generate in one step |

## How It Works

1. **API key entry** — stored in `localStorage`, never sent to any server other than `api.sportsdata.io`.
2. **Sport probing** — on key submit, the app calls each sport's API in parallel. A 401 means no access; that sport is hidden.
3. **Soccer competitions** — probed separately since every soccer call requires a competition ID. Only accessible competitions are shown.
4. **Daily fetch** — team sports fetch by date. Season-based sports (NASCAR, MMA, Golf) are fetched once per season and filtered client-side.
5. **Date navigation** — use the sticky header to move between days. A "Today" button resets to the current date.

## Regenerating the SDK

If Sportsdata.io updates their specs or adds a new sport:

1. Add the new spec URL to `open-api-docs.txt`
2. Run `npm run sdk:refresh`
3. Generated types land in `src/sdk/generated/`

## Deployment

The app is designed for static hosting (Cloudflare Pages, GitHub Pages, Vercel). There is no server-side code — all API calls go directly from the browser.

```bash
npm run build
```

This produces a static `out/` directory. For Cloudflare Pages, set the build command to `npm run build` and the output directory to `out`.

## Project Structure

```
src/
  app/
    page.tsx                    -- Entry point (AppProvider + Scoreboard)
    layout.tsx                  -- Root layout (Geist fonts, metadata)
    globals.css                 -- Tailwind CSS + dark mode
  hooks/
    useAppState.tsx             -- App state (API key, probing, date, accessible sports)
    useSportData.ts             -- Data fetching for all sports on a given date
    useSeasonCache.ts           -- In-memory cache for season-based sports
  components/
    Scoreboard.tsx              -- Top-level: key prompt / probing / error / scoreboard
    ApiKeyPrompt.tsx            -- API key entry form
    DateNavigator.tsx           -- Sticky date nav header
    SportSection.tsx            -- Sport header + card grid
    LoadingSpinner.tsx          -- Spinner
    ErrorBanner.tsx             -- Error display with retry
    cards/
      StatusBadge.tsx           -- Color-coded status badge
      TeamGameCard.tsx          -- Team sport card (scores + odds)
      SoccerGameCard.tsx        -- Soccer card (same layout, grouped by competition)
      MotorsportCard.tsx        -- NASCAR race card
      CombatEventCard.tsx       -- MMA event + expandable fight card
      GolfTournamentCard.tsx    -- Golf tournament card
  sdk/
    generated/                  -- Auto-generated .d.ts types (12 sports)
    clients/                    -- Sport-specific API clients + probing
    transforms/                 -- Normalize API responses to a common shape
```

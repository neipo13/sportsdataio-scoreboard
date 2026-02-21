# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React client-side-only web app that lets Sportsdata.io (SDIO) customers enter their API key and view a dashboard of the day's sporting events. No backend — designed for static hosting on Cloudflare Pages or GitHub Pages with CI/CD deploy on push.

## Key Architectural Constraints

- **No server-side anything.** All API calls go directly from the browser to the SDIO API. No key storage or proxying.
- **API key stored in browser localStorage.** User is prompted to enter their key on first visit; no login system.
- **SDIO auth:** Either query param `key=xxxx` or header `Ocp-Apim-Subscription-Key` (both documented in SDIO's OpenAPI 3.1 specs).
- **Sport access detection:** On key load, probe each sport by calling its `GetGamesByDate` (or equivalent). A 401 means the key lacks access to that sport; hide it. Non-401 responses mean the sport is available.

## SDK Generation

TypeScript SDKs are generated from SDIO OpenAPI spec JSONs. `open-api-docs.txt` holds the list of spec URLs to download.

- One SDK covers all sports but each sport may need its own transformations.
- SDKs must be easily regenerable when SDIO adds new sports (e.g., F1 is upcoming).
- Field naming is inconsistent across sports (e.g., `AwayTeamScore` in CBB vs `AwayScore` in NBA). Normalize these in a transformation layer rather than patching the SDK.

## Sport-Specific Requirements

- **Team sports (NBA, NFL, CBB, etc.):** Show home/away teams, start time, lock icon for closed games, pre-game odds.
- **Motorsport:** Show race name instead of teams.
- **MMA/combat sports:** Show fighter names instead of teams.
- **Soccer:** Requires a competition ID for every call. Keys have access to a subset of competitions. On key load, probe which competitions are accessible. Split the soccer view by competition.
- **Multi-day events:** Display on each relevant day.

## Project Files

- `project.md` — Full project specification and requirements
- `auth.md` — API authentication strategy and key management notes
- `open-api-docs.txt` — List of OpenAPI spec URLs to download (populate before SDK generation)

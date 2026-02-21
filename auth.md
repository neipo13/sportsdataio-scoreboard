## How to Auth to API
Sportsdata.io (SDIO) API keys have access to different sports & endpoints
calls can either use query param `key=xxxx` or `Ocp-Apim-Subscription-Key` header (as noted in the OpenAPI3.1 docs)

## How to track SDIO keys
Instead of a login, the app should prompt the user for their key. This can be stored in local storage perhaps? is this safe?

## How API Auth works for diffent sports
SDIO keys have different sports & urls allowed in "coverages" or buckets. On loading a key, we should check which sports are available via a call to a `GetGamesByDate` or `GetGamesBySeason` equivalent for that sport. If it returns data we should be able to get something. That should at least allow pulling up of events into the main board.
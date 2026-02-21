# Sportsdata.io Monitor Tool

## Description
This is a react web tool that uses a Sportsdata.io (SDIO) client's API key to call the sportsdata.io API and show cards for the days events. For each sport the displayed data will be slightly different. Team sports will be mostly similar with a home & away team, a start time, & additional info like a lock for games that are closed or the odds before a game starts. Users should be able to only see sports their api key has access to (via testing if the API 401s) and will use an SDK or set of SDKs generated from the openapi specs provided by SDIO to get access to relevant endpoints.

## Requirements
there is a list of open api docs included which you can download each and find relevant calls for each sport and then build 1 SDK to call for relevant data for each. You may need transformations for inconsistent name formats (ie CBB-> AwayTeamScore vs NBA -> AwayScore) or data that is just different in each sport vs another. Prep to have simple ways to build more data into the cards as more data is available and as the APIs change. Allow for simple regeneration of the API SDKs so we can update simply when a new sport is added (such as F1 coming soon but not existing yet).


## Output
ideally this is an app that can be hosted on something like cloudflare pages or github pages with no backend outside of the production SDIO api. this cannot leak keys between users or store any information outside of the API key for use in that specific users instance. We should also ensure deployment on git push if builds succeeed.


## Order of operations
Download the openapi JSONs from the txt list into a folder. setup an SDK generator for use inside a webpage to generate from those. Build a base page that runs for allt he included sports to show events with simple information (date, teams, race name, fighters, whatever is relevant) if an event runs over multiple days, show it on each of the days. For soccer consider splitting on competitions since each client will have access to a subset of the soccer competitions based on their keys. They may need to do a few checks within soccer to see what comps they have access to as all soccer calls require a competition ID or indicator.
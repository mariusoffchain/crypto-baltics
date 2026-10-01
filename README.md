# Crypto Baltics

Regional directory at https://cryptobaltics.org with a dedicated homepage, events and places map, and editorial approach.

## Rebuild and preview

Requires Node.js 22+ and Python 3.

```sh
npm run build:crypto
npm run preview:crypto
```

Open http://127.0.0.1:8777/ for the new homepage. Directory and approach use separate routes; `/events-places/` combines the inherited map and event dashboard in a same-origin iframe. `/events/` and `/merchants/` remain compatibility aliases. The inherited interactive map is preserved at `/map/`. Output is generated in `public-baltics/`; edit sources, not generated pages.

## Content

- `data/research.json` is the canonical research collection with source URLs, verification notes and historical records.
- `profiles/baltics/` contains configuration and community data adapted to the inherited engine.
- `data/directory-logos.json` records official logo sources; assets are stored locally in `assets/directory-logos/`. Unverified logos retain text headings.
- `directory/map-embed.css` and `directory/map-embed.js` adapt the original map to the shared navigation and theme.
- `directory/build-directory.mjs`, `directory/directory.css` and `directory/directory.js` generate the current website after the shared engine and historical identity previews.
- All researched events enter the main calendar through `scripts/sync-research-events.mjs`. Date-only events hide placeholder times and do not offer an ICS download until times are confirmed.

Research was checked on 2026-10-01 and is non-exhaustive. Historical or uncertain organisations are hidden by default. W3N has conflicting dates and is deliberately absent from the dated calendar. A software project is not evidence of an active local meetup.

## Boundaries

No deployment configuration or new GitHub repository has been set up. Local pages are noindex. Contact address is the previously supplied contact@cryptobaltics.org, pending domain confirmation. Existing production sites were not changed.

The inherited BTC Map layer indicates Bitcoin acceptance only. It must not be relabelled as general cryptocurrency acceptance. Logos, social thumbnails, PWA branding, policy text, and other inherited assets still need a Crypto Baltics identity pass before publication. Existing upstream tests contain Bitcoin-specific assumptions and have not been certified for this prototype.

## Licensing

Code retains its upstream MIT license. Third-party logos, photography, map data and other assets retain their own rights and attribution requirements. Research links do not grant image reuse rights.

## Deployment

Run `npm ci`, `npm run build:crypto`, then `npm run deploy:check` and `npm run deploy` after authenticating to the configured Cloudflare account. This Mac uses the named profile `lithuania-btc` with `--profile lithuania-btc`. Never use the default account for production. The `www` host redirects to the canonical domain. Public output is `public-baltics/`. Code is MIT; third-party photos and logos retain their respective rights and sources.

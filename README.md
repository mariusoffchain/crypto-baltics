# Crypto Baltics

Regional directory at https://cryptobaltics.org with a dedicated homepage, events and places map, and editorial approach.

## Rebuild and preview

Requires Node.js 22+ and Python 3.

```sh
npm run build:crypto
npm run preview:crypto
```

Open http://127.0.0.1:8777/ for the new homepage. Directory and approach use separate routes; `/events-places/` combines the inherited map and event dashboard in a same-origin iframe. `/events/` and `/merchants/` remain compatibility aliases. The inherited interactive map is preserved at `/map/`. Output is generated in `public-baltics/`; edit sources, not generated pages.

## Homepage selection

Edit `data/home-featured.json` to select and order homepage communities and companies by organisation ID. Lithuania BTC remains first in the community selection. The full directory sorts names alphabetically; events retain chronological order. Entries not featured remain in the directory.

## Content

- `data/research.json` is the canonical research collection with source URLs, verification notes and historical records.
- `profiles/baltics/` contains configuration and community data adapted to the inherited engine.
- `data/directory-logos.json` records official logo sources; assets are stored locally in `assets/directory-logos/`. Unverified logos retain text headings.
- `directory/map-embed.css` and `directory/map-embed.js` adapt the original map to the shared navigation and theme.
- `directory/build-directory.mjs`, `directory/directory.css` and `directory/directory.js` generate the current website after the shared engine and historical identity previews.
- All researched events enter the main calendar through `scripts/sync-research-events.mjs`. Date-only events hide placeholder times and do not offer an ICS download until times are confirmed.

Research was checked on 2026-10-01 and is non-exhaustive. Historical or uncertain organisations are hidden by default. W3N has conflicting dates and is deliberately absent from the dated calendar. A software project is not evidence of an active local meetup.

## Publication and verification

Published at https://cryptobaltics.org with canonical www redirection. The public repository is https://github.com/mariusoffchain/crypto-baltics and is linked in the site footer. Contact and contribution links use contact@cryptobaltics.org.

Run `npm test` to rebuild and check current release metadata, local resources, contact/GitHub links, PNG dimensions, manifest, crawler files, canonical redirection and the shared domain/PWA logic. `npm run test:legacy` retains the inherited Lithuania/Bitcoin Baltics tests for reference; their old content assumptions do not describe this directory.

The share card is `assets/crypto-share.png` (1200×630), application icon `assets/crypto-icon.png` (512×512), and PNG favicon `assets/crypto-favicon.png` (32×32). Editable layouts are in `designs/crypto-share.html` and `designs/crypto-icon.html`; capture at those dimensions after fonts load and export genuine PNG. SVG favicon uses the approved plain map. Generated pages include Open Graph, Twitter card and manifest links.

CoinGate and Bringin retain colour accents with dedicated dark SVG wordmarks. Monochrome logos adapt with CSS; no glow is used. Original sources are recorded in `data/directory-logos.json`.

Browser checks on 2026-10-01 covered 320, 375, 430, 768, 1024 and 1440 px, home/directory/approach/map pages, light/dark company logos, mobile event details and directory filters. These are browser viewport tests, not physical iOS/Android certification.

The BTC Map layer indicates Bitcoin acceptance only. Other cryptocurrency payment claims require separate confirmation.

## Licensing

Code retains its upstream MIT license. Third-party logos, photography, map data and other assets retain their own rights and attribution requirements. Research links do not grant image reuse rights.

## Deployment

Run `npm ci`, `npm run build:crypto`, then `npm run deploy:check` and `npm run deploy` after authenticating to the configured Cloudflare account. This Mac uses the named profile `lithuania-btc` with `--profile lithuania-btc`. Never use the default account for production. The `www` host redirects to the canonical domain. Public output is `public-baltics/`. Code is MIT; third-party photos and logos retain their respective rights and sources.

# Bitcoin Baltics assets — 2026-09-30

## Verified implementation

Courant identity is now integrated in the regional build, including locally hosted Inter and Space Grotesk (OFL files alongside fonts), neutral icons, the approved country silhouette with a land-only Bitcoin knockout, and Baltic navy PWA colours. Lithuania remains a separate build. Country flags render at 18×12 px in navigation, 15×10 px in addresses and 12×8 px on photographs.

The 9-image gallery uses WebP thumbnails (187,098 bytes combined) and separate enlarged views (900,640 bytes combined), from 6,804,636 bytes of original files. Original images are preserved. EXIF metadata is removed from derivatives. Full views load on opening the carousel and are not part of the installation precache; offline availability of full views is not guaranteed. The filtered carousel now navigates only the displayed country's images.

The SVG logo was reduced to 25,479 bytes by removing unused definitions. The new sharing JPEG is 28,369 bytes; the 512px application PNG is 55,812 bytes.

## Sources and reuse

Exact original image URLs, credits and rights notes are in site.json; generated captions and country metadata are in gallery-optimized.json.

- Baltic Honeybadger official website, https://baltichoneybadger.com/ — 2 images. The stage photograph shows the 2023 edition, not the 2025 event added to the archive. The second image shows Bitcoin artwork.
- Mission Liberty Tallinn event, https://www.meetup.com/mission-liberty-tallinn/events/316565528/ — announcement artwork, explicitly labelled as such, not a photograph of attendees. No public meetup photo was obtained.
- Event dates and venues for Baltic Honeybadger 2025 and bitcoin++ Riga 2025 were checked against https://baltichoneybadger.com/riga-bitcoin-week, https://baltichoneybadger.com/location and https://btcpp.dev/riga.
- Riga Walk local Telegram was found through https://bitcoinwalk.org/riga/.
- Business/community links include https://bringin.app/about-us and https://btc2bgroup.com/. These links do not assert that they are physical Bitcoin-accepting shops.

No reuse licence was found for the 3 third-party media files. They are credited on the site and excluded from the code's MIT licence. The site owner elected to retain them; attribution does not establish permission. Fork owners must obtain their own permission or replace these images. Own Lithuanian photographs retain their existing provenance.

## Rebuild

Requires existing Node dependencies plus Python 3 and Pillow (verified with 11.3.0).

1. Edit regional data in profiles/baltics/site.json and events.json. Preserve sources.
2. Run `python3 scripts/optimize-baltics-media.py` to regenerate thumbnail/view derivatives and size reports.
3. Run `npm run build:baltics` and `npm test`.
4. Serve public-baltics with a local HTTP server. Close old preview tabs to let the waiting service worker activate; a fresh localhost origin also avoids stale preview caches.

Canonical regional appearance files are profiles/baltics/identity.css and identity.js. Historical design comparisons are not included in this repository.

Sharing/icon sources are share-preview.html and icon-preview.html. Render in a browser at 1200×630 and 512×512 respectively; convert the screenshots with Pillow, JPEG quality 85/optimize/progressive and PNG optimize, into baltics-share.jpg and baltics-icon.png. These files are copied by the regional build.

Use a clean output directory for a production release; incremental builds can leave unreferenced old assets on disk. Do not deploy with the Lithuania Wrangler configuration. The production deployment uses wrangler.baltics.jsonc.

## Verification

25 automated tests passed. Desktop and 390px mobile previews checked, including country filters, carousel navigation, image loading and overflow. No Lighthouse or Core Web Vitals measurements were taken; byte reductions are file measurements, not a speed-score claim.

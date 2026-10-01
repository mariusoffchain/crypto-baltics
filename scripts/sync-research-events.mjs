import { readFile, writeFile } from "node:fs/promises";
const research = JSON.parse(await readFile("data/research.json", "utf8"));
const events = research.events.map(e => ({
  id: e.id, country: e.country, type: e.category,
  initiative: `${e.organiser}-${e.country}`,
  title: { en: e.name }, description: { en: [e.summary, e.locationNote].filter(Boolean).join(" ") },
  // Noon UTC is a stable display anchor for Baltic date-only records; it is not an event time.
  start: e.start || `${e.date}T12:00:00Z`,
  end: e.end || `${e.endDate || e.date}T23:59:59+03:00`,
  dateOnly: !e.start,
  venue: e.city, address: e.city, addressUncertain: true,
  url: e.url, website: e.url, sources: e.sources, sourceVerifiedAt: e.reviewedAt
}));
const regional = JSON.parse(await readFile("data/bitcoin-regional-events.json", "utf8"));
const combined = [...regional, ...events];
const unique = [...new Map(combined.map(e => [e.id, e])).values()];
const artwork = JSON.parse(await readFile("data/event-images.json", "utf8"));
for (const e of unique) if (artwork[e.id]) e.image = artwork[e.id];
await writeFile("profiles/baltics/events.json", JSON.stringify(unique, null, 2) + "\n");
console.log(`Synced ${events.length} researched events into the main calendar.`);

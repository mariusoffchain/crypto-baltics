import { eventGroups, EVENT_TIME_ZONE } from "./event-status.js";
import { esc, hasEventPage, eventSlug } from "./scripts/event-data.mjs";
const countries = { EE: "Estonia", LV: "Latvia", LT: "Lithuania" };
const emoji = { EE: "🇪🇪", LV: "🇱🇻", LT: "🇱🇹" };
const fmt = (date, options) =>
  new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(date));
export const eventCard = (e) =>
  `<article class="event-entry" data-entry data-country="${e.country || "LT"}"><a class="event-open" data-event="${esc(e.id)}" href="${hasEventPage(e) ? `/events/${eventSlug(e)}/` : `/events-places/?event=${encodeURIComponent(e.id)}`}"><div class="date">${e.start ? `<strong>${fmt(e.start, { day: "2-digit" })}</strong><span>${fmt(e.start, { month: "short" })}</span>` : "<strong>…</strong><span>SOON</span>"}</div><div><div class="eyebrow">${esc(e.type || "Meetup")} · ${e.start ? fmt(e.start, { year: "numeric" }) : "Date to be announced"}</div><h3>${esc(e.title.en)}</h3><p><span aria-hidden="true">${emoji[e.country || "LT"]}</span> ${countries[e.country || "LT"]}${e.venue ? " · " + esc(e.venue) : ""}</p></div><span class="arrow" aria-hidden="true">↗</span></a></article>`;

export function homeEvents(events, now = Date.now()) {
  const upcoming = eventGroups(events, now).upcoming;
  return {
    count: upcoming.length,
    label: upcoming.length === 1 ? "upcoming event" : "upcoming events",
    html:
      upcoming.map(eventCard).join("") ||
      '<p class="empty-state">No upcoming events with confirmed dates. <a href="/events-places/">Browse the calendar and past events ↗</a></p>',
  };
}

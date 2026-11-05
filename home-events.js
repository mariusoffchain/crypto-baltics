import { eventGroups, EVENT_TIME_ZONE } from "./event-status.js";
import { esc, hasEventPage, eventSlug } from "./scripts/event-data.mjs";
const countries = { EE: "Estonia", LV: "Latvia", LT: "Lithuania" };
const emoji = { EE: "🇪🇪", LV: "🇱🇻", LT: "🇱🇹" };
const fmt = (date, options, lang = "en") =>
  new Intl.DateTimeFormat(lang === "lt" ? "lt-LT" : "en-GB", {
    ...options,
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(date));
export const eventCard = (e, lang = "en") =>
  `<article class="event-entry" data-entry data-country="${e.country || "LT"}"><a class="event-open" data-event="${esc(e.id)}" href="${hasEventPage(e) ? `${lang === "lt" ? "/lt" : ""}/events/${eventSlug(e)}/` : `${lang === "lt" ? "/lt" : ""}/events-places/?event=${encodeURIComponent(e.id)}`}"><div class="date">${e.start && !e.dateUncertain ? `<strong>${fmt(e.start, { day: "2-digit" }, lang)}</strong><span>${fmt(e.start, { month: "short" }, lang)}</span>` : `<strong>…</strong><span>${lang === "lt" ? "VĖLIAU" : "TBC"}</span>`}</div><div><div class="eyebrow">${esc(e.type || "Meetup")} · ${e.start && !e.dateUncertain ? fmt(e.start, { year: "numeric" }, lang) : (lang === "lt" ? "Data tikslinama" : "Date to be confirmed")}</div><h3>${esc(e.title[lang] || e.title.en)}</h3><p><span aria-hidden="true">${emoji[e.country || "LT"]}</span> ${lang === "lt" ? ({LT:"Lietuva",LV:"Latvija",EE:"Estija"}[e.country || "LT"]) : countries[e.country || "LT"]}${e.venue ? " · " + esc(e.venue) : ""}</p></div><span class="arrow" aria-hidden="true">↗</span></a></article>`;

export function homeEvents(events, now = Date.now(), lang = "en") {
  const upcoming = eventGroups(events, now).upcoming;
  return {
    count: upcoming.length,
    label: lang === "lt" ? "renginiai su patvirtintomis datomis" : upcoming.length === 1 ? "upcoming event" : "upcoming events",
    html:
      upcoming.map(e => eventCard(e, lang)).join("") ||
      (lang === 'lt' ? '<p class="empty-state">Renginių su patvirtintomis datomis kol kas nėra. <a href="/lt/events-places/">Atverti renginius ir archyvą ↗</a></p>' : '<p class="empty-state">No upcoming events with confirmed dates. <a href="/events-places/">Browse the calendar and past events ↗</a></p>'),
  };
}

// One clock and one rule for the homepage, calendar and event badges.
export const EVENT_TIME_ZONE = "Europe/Vilnius";
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const day = (value) => dayFormatter.format(new Date(value));
function validDay(value) {
  const date = typeof value === "string" ? value.slice(0, 10) : "";
  const parsed = Date.parse(date);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(parsed) &&
    new Date(parsed).toISOString().slice(0, 10) === date
    ? date
    : null;
}
function instant(value) {
  // Timed records must specify their offset; never use the visitor's local zone.
  return typeof value === "string" &&
    validDay(value) &&
    /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    ? Date.parse(value)
    : NaN;
}
export function eventStatus(event, now = Date.now()) {
  if (event.status === "planned" || !event.start) return "planned";
  if (event.dateOnly || /^\d{4}-\d{2}-\d{2}$/.test(event.start)) {
    // Legacy dateOnly timestamps are display anchors, not confirmed hours.
    const start = validDay(event.start),
      end = validDay(event.end || event.start);
    if (!start || !end || end < start) return "planned";
    return day(now) > end ? "past" : "upcoming";
  }
  const start = instant(event.start),
    end = instant(event.end || event.start);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start)
    return "planned";
  // Keep the existing inclusive end convention, including events in progress.
  return Number(now) > end ? "past" : "upcoming";
}
export function eventGroups(events, now = Date.now()) {
  const groups = { planned: [], upcoming: [], past: [] };
  for (const event of events) groups[eventStatus(event, now)].push(event);
  groups.upcoming.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  groups.past.sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
  return groups;
}

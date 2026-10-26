import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { eventGroups, eventStatus } from "../event-status.js";
import { homeEvents } from "../home-events.js";
import { watchEventDates } from "../event-refresh.js";
const at = (value) => Date.parse(value);
const timed = {
  id: "timed",
  start: "2026-10-26T15:00:00+02:00",
  end: "2026-10-26T17:00:00+02:00",
};
const allDay = (start, end = start) => ({
  id: "all-day",
  start,
  end,
  dateOnly: true,
});

test("past, in-progress and future events share one grouping; end is inclusive", () => {
  assert.equal(eventStatus(timed, at("2026-10-26T12:00:00Z")), "upcoming");
  assert.equal(eventStatus(timed, at("2026-10-26T14:00:00Z")), "upcoming");
  assert.equal(eventStatus(timed, at("2026-10-26T15:00:00Z")), "upcoming");
  assert.equal(eventStatus(timed, at("2026-10-26T15:00:00.001Z")), "past");
  assert.equal(
    eventStatus({ ...timed, end: undefined }, at("2026-10-26T13:00:00.001Z")),
    "past",
  );
});
test("multi-day events stay listed through their final day", () => {
  const e = allDay("2026-10-24", "2026-10-26");
  assert.equal(eventStatus(e, at("2026-10-25T12:00Z")), "upcoming");
  assert.equal(eventStatus(e, at("2026-10-26T21:59:59.999Z")), "upcoming");
  assert.equal(eventStatus(e, at("2026-10-26T22:00Z")), "past");
});
test("date-only boundaries use Baltic midnight in summer, winter and both DST transitions", () => {
  for (const [date, midnight] of [
    ["2026-07-01", "2026-07-01T21:00Z"],
    ["2026-01-01", "2026-01-01T22:00Z"],
    ["2026-03-29", "2026-03-29T21:00Z"],
    ["2026-10-25", "2026-10-25T22:00Z"],
  ]) {
    const event = allDay(`${date}T12:00:00Z`, `${date}T23:59:59+03:00`);
    assert.equal(eventStatus(event, at(midnight) - 1), "upcoming", date);
    assert.equal(eventStatus(event, at(midnight)), "past", date);
  }
});
test("date-only without end lasts the full day; timed offsets describe the same instant", () => {
  assert.equal(
    eventStatus({ start: "2026-10-26" }, at("2026-10-26T21:59Z")),
    "upcoming",
  );
  for (const end of [
    "2026-10-26T17:00:00+02:00",
    "2026-10-26T15:00:00Z",
    "2026-10-26T11:00:00-04:00",
  ])
    assert.equal(
      eventStatus({ ...timed, end }, at("2026-10-26T15:00:00.001Z")),
      "past",
    );
});
test("undated, planned, invalid and ambiguous dates never inflate the count or disappear", () => {
  const events = [
    {},
    { status: "planned", ...timed },
    { start: "invalid" },
    { start: "2026-10-26T15:00:00" },
    { start: "2026-02-30", dateOnly: true },
    { ...timed, end: "invalid" },
    { ...timed, end: "2026-10-25T12:00:00Z" },
  ];
  const groups = eventGroups(events, at("2026-10-26T10:00Z"));
  assert.equal(groups.planned.length, events.length);
  assert.equal(groups.upcoming.length, 0);
  assert.equal(groups.past.length, 0);
});
test("real data keeps October events in archives and only UN:BLOCK 2027 upcoming on 26 October", () => {
  const events = JSON.parse(readFileSync("public-baltics/data/events.json"));
  const now = at("2026-10-26T12:00Z");
  const groups = eventGroups(events, now),
    home = homeEvents(events, now);
  assert.deepEqual(
    groups.upcoming.map((e) => e.id),
    ["unblock-2027"],
  );
  assert.ok(groups.past.some((e) => e.id === "solana-connect-2026"));
  assert.ok(groups.past.some((e) => e.id === "unblock-fintech-2026"));
  assert.equal(home.count, 1);
  assert.equal(home.label, "upcoming event");
  assert.equal(
    (home.html.match(/class="event-entry"/g) || []).length,
    home.count,
  );
  assert.doesNotMatch(home.html, /solana-connect-2026|unblock-fintech-2026/);
  const later = homeEvents(events, at("2028-01-01T00:00Z"));
  assert.equal(later.count, 0);
  assert.match(later.html, /No upcoming events/);
  assert.match(later.html, /Browse the calendar and past events/);
});
test("chronological rendering escapes editorial text and leaves the source array intact", () => {
  const first = {
    ...timed,
    id: "first",
    title: { en: '<script> & "test"' },
    venue: "<Riga>",
  };
  const last = {
    ...first,
    id: "last",
    start: "2026-11-01T10:00:00Z",
    end: "2026-11-01T12:00:00Z",
  };
  const events = [last, first],
    result = homeEvents(events, at("2026-10-01T00:00Z"));
  assert.ok(
    result.html.indexOf('data-event="first"') <
      result.html.indexOf('data-event="last"'),
  );
  assert.match(result.html, /&lt;script&gt; &amp; &quot;test&quot;/);
  assert.deepEqual(
    events.map((e) => e.id),
    ["last", "first"],
  );
});
test("an open page refreshes after midnight, on visibility, pageshow and focus without a build", (t) => {
  const doc = new EventTarget(),
    win = new EventTarget();
  doc.hidden = false;
  t.mock.method(globalThis, "setInterval", (fn, delay) => {
    assert.equal(delay, 30000);
    tick = fn;
    return 123;
  });
  t.mock.method(globalThis, "clearInterval", (id) => assert.equal(id, 123));
  const previousDocument = globalThis.document,
    previousWindow = globalThis.window;
  globalThis.document = doc;
  globalThis.window = win;
  t.after(() => {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  });
  let tick,
    now = at("2026-10-26T21:59:59Z"),
    current,
    calls = 0;
  const stop = watchEventDates(() => {
    calls++;
    current = eventGroups([allDay("2026-10-26")], now);
  });
  assert.equal(current.upcoming.length, 1);
  now = at("2026-10-26T22:00Z");
  tick();
  assert.equal(current.upcoming.length, 0);
  assert.equal(current.past.length, 1);
  doc.dispatchEvent(new Event("visibilitychange"));
  win.dispatchEvent(new Event("pageshow"));
  win.dispatchEvent(new Event("focus"));
  assert.equal(calls, 5);
  stop();
  win.dispatchEvent(new Event("focus"));
  assert.equal(calls, 5);
});

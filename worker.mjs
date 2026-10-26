import events from "./public-baltics/data/events.json" with { type: "json" };
import { homeEvents } from "./home-events.js";

async function currentHome(request, env) {
  // Static asset validators describe the build, not today's event selection.
  const headers = new Headers(request.headers);
  for (const name of [
    "if-none-match",
    "if-modified-since",
    "range",
    "if-range",
  ])
    headers.delete(name);
  const asset = await env.ASSETS.fetch(
    new Request(request, { method: "GET", headers }),
  );
  if (
    asset.status !== 200 ||
    !asset.headers.get("content-type")?.includes("text/html")
  )
    return asset;
  const schedule = homeEvents(events);
  const response = new Response(asset.body, asset);
  response.headers.set("Cache-Control", "no-store");
  for (const name of ["etag", "last-modified", "content-length"])
    response.headers.delete(name);
  const rendered = new HTMLRewriter()
    .on("#upcoming-count", {
      element: (el) => el.setInnerContent(String(schedule.count)),
    })
    .on("#upcoming-label", {
      element: (el) => el.setInnerContent(schedule.label),
    })
    .on(".home-events", {
      element: (el) => el.setInnerContent(schedule.html, { html: true }),
    })
    .transform(response);
  return request.method === "HEAD" ? new Response(null, rendered) : rendered;
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (
      url.hostname === "www.cryptobaltics.org" ||
      (url.hostname === "cryptobaltics.org" && url.protocol === "http:")
    ) {
      url.hostname = "cryptobaltics.org";
      url.protocol = "https:";
      return Response.redirect(url.href, 301);
    }
    if (
      ["GET", "HEAD"].includes(request.method) &&
      ["/", "/index.html", "/en", "/en/", "/en/index.html"].includes(
        url.pathname,
      )
    )
      return currentHome(request, env);
    return env.ASSETS.fetch(request);
  },
};

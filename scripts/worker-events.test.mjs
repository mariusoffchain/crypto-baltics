import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
// Use the same workerd and bundler versions as the project's pinned Wrangler.
const requireWrangler = createRequire(import.meta.resolve("wrangler"));
const { Miniflare, convertV4MiniflareOptions } = requireWrangler("miniflare");
const { build } = requireWrangler("esbuild");

test("Worker replaces stale build HTML on successive dates, handles aliases and bypasses validators", async () => {
  const bundle = await build({
    stdin: {
      contents: `import worker from './worker.mjs';
      export default { fetch(request, env) {
        Date.now = () => Date.parse(request.headers.get('x-test-now') || '2026-10-26T12:00Z');
        return worker.fetch(request, env);
      }};`,
      resolveDir: process.cwd(),
      sourcefile: "test-clock.mjs",
    },
    bundle: true,
    format: "esm",
    platform: "browser",
    write: false,
  });
  // A deliberately stale asset simulates a build made before the events ended.
  const stale = readFileSync("public-baltics/index.html", "utf8").replace(
    /id="upcoming-count">\d+/,
    'id="upcoming-count">999',
  );
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: bundle.outputFiles[0].text,
      compatibilityDate: "2026-09-30",
      serviceBindings: {
        ASSETS: (request) => {
          if (
            request.headers.has("if-none-match") ||
            request.headers.has("if-modified-since")
          )
            return new Response(null, { status: 304 });
          return new Response(stale, {
            headers: {
              "content-type": "text/html",
              etag: '"stale-build"',
              "last-modified": "Thu, 08 Oct 2026 12:00:00 GMT",
              "cache-control": "public, max-age=31536000",
            },
          });
        },
      },
    }),
  );
  const check = async (date, count, path = "/") => {
    const response = await mf.dispatchFetch(
      `https://cryptobaltics.org${path}`,
      {
        headers: {
          "x-test-now": date,
          "if-none-match": '"stale-build"',
          "if-modified-since": "Thu, 08 Oct 2026 12:00:00 GMT",
        },
      },
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("etag"), null);
    assert.equal(response.headers.get("last-modified"), null);
    const html = await response.text();
    assert.match(html, new RegExp(`id="upcoming-count">${count}</b>`));
    const list = html.match(/<div class="home-events">(.*?)<\/section>/s)[1];
    assert.equal((list.match(/class="event-entry"/g) || []).length, count);
    return list;
  };
  try {
    await check("2026-10-13T12:00Z", 3);
    const current = await check("2026-10-26T12:00Z", 1);
    assert.doesNotMatch(current, /solana-connect-2026|unblock-fintech-2026/);
    for (const path of ["/en/", "/index.html", "/en/index.html", "/?mode=dark"])
      await check("2026-10-26T12:00Z", 1, path);
    await check("2027-03-11T21:59:59.999Z", 1);
    const empty = await check("2027-03-11T22:00Z", 0);
    assert.match(empty, /No upcoming events/);
    const head = await mf.dispatchFetch("https://cryptobaltics.org/", {
      method: "HEAD",
    });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
    assert.equal(head.headers.get("cache-control"), "no-store");
    const other = await mf.dispatchFetch(
      "https://cryptobaltics.org/directory/",
    );
    assert.equal(other.headers.get("etag"), '"stale-build"');
    await other.text();
    const redirect = await mf.dispatchFetch(
      "http://cryptobaltics.org/?mode=dark",
      { redirect: "manual" },
    );
    assert.equal(redirect.status, 301);
    assert.equal(
      redirect.headers.get("location"),
      "https://cryptobaltics.org/?mode=dark",
    );
  } finally {
    await mf.dispose();
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root='public-baltics';
for(const route of ['/','/directory/','/approach/','/events-places/']) test(`${route} production metadata, assets and local links`,()=>{
 const html=readFileSync(root+route+'index.html','utf8');
 assert.ok(html.includes(`rel="canonical" href="https://cryptobaltics.org${route}"`));
 assert.match(html,/og:image" content="https:\/\/cryptobaltics.org\/assets\/crypto-share.png/);
 assert.match(html,/summary_large_image/);assert.match(html,/rel="icon"/);
 assert.match(html,/mailto:contact@cryptobaltics.org/);
 assert.match(html,/github.com\/mariusoffchain\/crypto-baltics/);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
 assert.equal(graph[0]['@type'],'WebSite');assert.equal(graph[1].url,`https://cryptobaltics.org${route}`);
 for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
  assert.ok(existsSync(root+url)||existsSync(root+url+'/index.html'),url);
 }
});
test('PNG share and application icons have correct sizes and signatures',()=>{
 for(const [name,w,h] of [['crypto-share.png',1200,630],['crypto-icon.png',512,512],['crypto-favicon.png',32,32]]){
 const png=readFileSync(root+'/assets/'+name); assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
});
test('crawler resources and manifest identify Crypto Baltics',()=>{
 const manifest=JSON.parse(readFileSync(root+'/manifest.webmanifest'));assert.equal(manifest.name,'Crypto Baltics');assert.equal(manifest.start_url,'/');
 for(const path of ['robots.txt','sitemap.xml','llms.txt']) assert.ok(readFileSync(root+'/'+path,'utf8').length>50);
 const sitemap=readFileSync(root+'/sitemap.xml','utf8'); assert.match(sitemap,/https:\/\/cryptobaltics.org\/directory\//);assert.doesNotMatch(sitemap,/lithuaniabtc|bitcoinbaltics/);
});
test('www redirects to canonical preserving path and query',async()=>{
 const worker=(await import('../worker.mjs')).default;
 const response=worker.fetch(new Request('https://www.cryptobaltics.org/directory/?category=company'),{});
 assert.equal(response.status,301);assert.equal(response.headers.get('location'),'https://cryptobaltics.org/directory/?category=company');
});
test('map embed lists events before JavaScript and may be indexed only where it is embedded',()=>{
 const html=readFileSync(root+'/map/index.html','utf8');
 assert.match(html,/<meta name="robots" content="noindex,nofollow,indexifembedded">/);
 assert.match(html,/rel="canonical" href="https:\/\/cryptobaltics.org\/events-places\/"/);
 assert.ok((html.match(/<(?:a|div) class="event-card/g)||[]).length>=3);
 assert.match(html,/<a class="event-card" href="\/events\/[a-z0-9-]+\/"/);
 assert.equal((html.match(/<h1/g)||[]).length,0);
 assert.match(readFileSync(root+'/index.html','utf8'),/<title>Bitcoin &amp; crypto across the Baltics \| Crypto Baltics<\/title>/);
});
test('every dated event has a page; only events researched here carry Event data',()=>{
 const events=JSON.parse(readFileSync(root+'/data/events.json','utf8')).filter(e=>e.status!=='planned'&&e.start);
 const lithuanian=new Set(JSON.parse(readFileSync('data/events.json','utf8')).map(e=>e.id));
 const regional=new Set(JSON.parse(readFileSync('data/bitcoin-regional-events.json','utf8')).map(e=>e.id));
 const sitemap=readFileSync(root+'/sitemap.xml','utf8'),home=readFileSync(root+'/index.html','utf8');
 let own=0;
 for(const e of events){
  const route=`/events/${e.id}/`,html=readFileSync(root+route+'index.html','utf8');
  const canonical=lithuanian.has(e.id)?`https://lithuaniabtc.com/en${route}`:regional.has(e.id)?`https://bitcoinbaltics.com${route}`:`https://cryptobaltics.org${route}`;
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`),e.id);
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
  const mine=canonical.startsWith('https://cryptobaltics.org/');own+=mine;
  assert.equal(schemas.length,mine?1:0,e.id);assert.equal(sitemap.includes(`<loc>${canonical}</loc>`),mine);
  if(mine){assert.equal(schemas[0]['@type'],'Event');assert.equal(schemas[0].url,canonical);assert.ok(schemas[0].startDate);assert.equal(schemas[0].location.address.addressCountry,e.country);assert.ok(schemas[0].organizer.name);}
  for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g))assert.ok(existsSync(root+url)||existsSync(root+url+'/index.html'),url);
  if(Date.parse(e.end||e.start)>=Date.now())assert.ok(home.includes(`href="${route}"`),e.id);
 }
 assert.ok(own>=3);
});

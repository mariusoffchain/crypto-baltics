import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const out='public-baltics';
const data=JSON.parse(await readFile('data/research.json','utf8'));
const mainEvents = JSON.parse(await readFile(out + '/data/events.json', 'utf8'));
const existingEventIds = new Set(data.events.map(e => e.id));
for (const e of mainEvents) {
  if (existingEventIds.has(e.id) || !e.start || e.status === 'planned') continue;
  data.events.push({ id: e.id, name: e.title.en, country: e.country || 'LT', city: e.venue || e.address || '', category: e.type, organiser: e.country === 'LT' ? 'lithuania-btc' : 'bitcoin-baltics', start: e.start, end: e.end, url: e.website || e.url, summary: e.description.en });
}
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={LT:'Lithuania',LV:'Latvia',EE:'Estonia'};
const categories={community:'Communities',association:'Associations',initiative:'Open-source initiatives',company:'Companies',conference:'Conferences',venue:'Places'};
const country=cs=>cs.map(c=>`<span><img src="/assets/country-${c.toLowerCase()}.svg" width="18" height="12" alt=""> ${names[c]}</span>`).join(' · ');
const external=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
const card=r=>`<article class="research-card" data-country="${r.countries.join(' ')}" data-category="${r.category}" data-state="${r.verification}" data-search="${esc([r.name,r.summary,...r.topics].join(' ').toLowerCase())}"><div class="card-meta">${country(r.countries)}</div><h3>${esc(r.name)}</h3><p>${esc(r.summary)}</p><div class="topics">${r.topics.map(esc).join(' · ')}</div>${r.verification!=='listed'?`<p class="status">${r.verification==='historical'?'Historical record · current activity unconfirmed':'Needs confirmation'}</p>`:''}<div class="links">${external(r.url,'Website / profile')}${r.links.map(l=>external(l.url,l.name)).join('')}</div><details><summary>Sources and verification</summary><p>${esc(r.note||'Official source checked on 1 October 2026. Listing does not imply endorsement.')}</p>${r.sources.map((u,i)=>external(u,'Source '+(i+1))).join(' · ')}</details></article>`;
const date=e=>{const d=e.date||e.start.slice(0,10);const fmt=s=>new Date(s+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});return fmt(d)+(e.endDate?' – '+fmt(e.endDate):'');};
const event=e=>`<article class="research-event"><div>${esc(date(e))}<small>${names[e.country]} · ${esc(e.city)}</small></div><div><h3>${external(e.url,e.name)}</h3><p>${esc(e.summary)}</p>${e.locationNote?`<small>${esc(e.locationNote)}</small>`:''}<small>${esc(e.category)} · <a href="/ecosystem/#${esc(e.organiser)}">Organiser</a></small></div></article>`;
let about=await readFile(out+'/about/index.html','utf8');
const intro=`<header class="about-intro"><span class="about-kicker">Crypto Baltics / Content preview</span><h1>Meet the Baltic crypto ecosystem.</h1><p>Communities, conferences and people building in Estonia, Latvia and Lithuania. A first sourced collection, checked on 1 October 2026.</p><p class="preview-note">Shared template preview. Visual identity and domain are still to be chosen.</p><nav class="jump-links"><a href="/ecosystem/#directory">Explore the directory</a><a href="/ecosystem/#calendar">Events</a><a href="/">Open the map</a></nav></header>`;
const filters=`<section id="directory"><h2>Communities and initiatives</h2><div class="research-filters"><label>Search<input id="q" type="search" placeholder="Solana, Monero, payments…"></label><label>Country<select id="country"><option value="">All countries</option>${Object.entries(names).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>Type<select id="category"><option value="">All types</option>${Object.entries(categories).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="check"><input type="checkbox" id="uncertain"> Include historical / unconfirmed</label></div><p id="count" aria-live="polite"></p><div class="research-grid">${data.organisations.map(r=>card(r).replace('<article ',`<article id="${r.id}" `)).join('')}</div></section>`;
const upcoming=data.events.filter(e=>(e.date||e.start.slice(0,10))>='2026-10-01').sort((a,b)=>(a.date||a.start).localeCompare(b.date||b.start));
const past=data.events.filter(e=>(e.date||e.start.slice(0,10))<'2026-10-01').sort((a,b)=>(b.date||b.start).localeCompare(a.date||a.start));
const calendar=`<section id="calendar"><h2>Upcoming events</h2>${upcoming.map(event).join('')}<h2>Past events</h2>${past.map(event).join('')}<p class="preview-note">Dates without confirmed times are shown as dates only. W3N is not assigned a calendar date while its sources disagree.</p></section>`;
const footer=`<footer class="about-contribute"><h2>What still needs checking</h2><ul>${data.openQuestions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul><p>This is an initial collection, not an exhaustive directory. Official organisation pages establish existence and activity claims; they do not imply a recommendation.</p><a href="/">Back to shared map interface →</a></footer>`;
let html=about.replace(/<main class="about-content">[\s\S]*?<\/main>/,`<main class="about-content research-content">${intro}${calendar}${filters}${footer}</main>`).replace(/<title>.*?<\/title>/,'<title>Crypto Baltics | Research directory</title>');
await mkdir(out+'/ecosystem',{recursive:true});
await writeFile(out+'/ecosystem/index.html',html.replace('</head>','<link rel="stylesheet" href="/research.css"><script defer src="/research.js"></script></head>'));
await copyFile('research.css',out+'/research.css');await copyFile('research.js',out+'/research.js');await copyFile('data/research.json',out+'/data/research.json');
for(const file of ['index.html','en/index.html','about/index.html','en/about/index.html','ecosystem/index.html']){
 let s=await readFile(out+'/'+file,'utf8');
 s=s.replaceAll('>Bitcoin</span','>Crypto</span').replace(/<img[^>]*src="(?:\/)?assets\/baltics-logo.svg"[^>]*>/g,'');
 s=s.replace('</head>','<meta name="robots" content="noindex,nofollow"><style>.brand-btc{font-size:1em!important} .preview-directory{display:block;padding:18px 24px;border-bottom:1px solid var(--line);font-weight:600} .desktop-directory{color:var(--text);text-decoration:underline;text-underline-offset:5px;margin-inline:12px} @media(max-width:760px){.desktop-directory{display:none}}</style></head>');
 s=s.replace(/(<a class="desktop-about")/,'<a class="desktop-directory" href="/ecosystem/">Ecosystem</a>$1');
 s=s.replace('<section id="community-contact"','<a class="preview-directory" href="/ecosystem/">Explore communities, companies and the full event calendar →</a><section id="community-contact"');
 s=s.replace('<div id="upcoming"','<a class="preview-directory" href="/ecosystem/#calendar">Full event calendar →</a><div id="upcoming"');
 if(file==='ecosystem/index.html') s=s.replaceAll(' aria-current="page"','').replace('class="desktop-directory"','class="desktop-directory" aria-current="page"');
 await writeFile(out+'/'+file,s);
}
console.log(`Research preview: ${data.organisations.length} organisations, ${data.events.length} events`);

await mkdir(out+"/identity", {recursive:true});
await copyFile("identity/directions.html", out+"/identity/directions.html");

await copyFile("identity/collectif-logos.html",out+"/identity/collectif-logos.html");

await copyFile("identity/map-c-logos.html",out+"/identity/map-c-logos.html");

await copyFile("identity/currency-map-logos.html",out+"/identity/currency-map-logos.html");

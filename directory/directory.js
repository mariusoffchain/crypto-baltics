(() => {
  const params = new URLSearchParams(location.search);
  const root = document.documentElement;
  let saved; try { saved = localStorage.getItem('crypto-directory-theme'); } catch {}
  root.dataset.theme = (['light','dark'].includes(params.get('mode')) ? params.get('mode') : saved) || 'light';
  if(['light','dark'].includes(params.get('mode')))try{localStorage.setItem('crypto-directory-theme',root.dataset.theme)}catch{}
  const theme = document.querySelector('#theme');
  const labelTheme = () => theme.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'light' ? 'dark' : 'light'} mode`);
  labelTheme();
  const mapFrame=document.querySelector('#regional-map');
  if(mapFrame){const u=new URL(mapFrame.src);u.searchParams.set('mode',root.dataset.theme);mapFrame.src=u.href;}
  theme.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light'; labelTheme(); if(mapFrame) mapFrame.contentWindow.postMessage({type:'crypto-theme',mode:root.dataset.theme},location.origin); try { localStorage.setItem('crypto-directory-theme', root.dataset.theme); } catch {} });
  const form = document.querySelector('.filters');
  if (form) {
    const entries = [...document.querySelectorAll('[data-entry]')];
    const country = document.querySelector('#country');
    const category=document.querySelector('#kind');if(category && [...category.options].some(o=>o.value===params.get('category')))category.value=params.get('category');
    if ([...country.options].some(o => o.value === params.get('country'))) country.value = params.get('country');
    function filter() {
      const q = document.querySelector('#q').value.toLocaleLowerCase().trim();
      const kind = document.querySelector('#kind')?.value;
      const history = document.querySelector('#historical')?.checked;
      let count = 0;
      for (const item of entries) {
        const show = (!q || item.textContent.toLocaleLowerCase().includes(q)) && (!country.value || item.dataset.country.split(' ').includes(country.value)) && (!kind || item.dataset.kind === kind) && (!item.dataset.state || item.dataset.state === 'listed' || history);
        item.hidden = !show; if (show) count++;
      }
      document.querySelector('#result-count').textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
      document.querySelector('#empty').hidden = count !== 0;
      document.querySelectorAll('.event-group').forEach(group => group.hidden = ![...group.querySelectorAll('[data-entry]')].some(e => !e.hidden));
    }
    form.addEventListener('input', filter); form.addEventListener('change', filter); filter();
  }
  const { events, initiatives } = JSON.parse(document.querySelector('#event-data').textContent);
  const dialog = document.querySelector('#event-dialog');
  const detail = document.querySelector('#event-detail');
  let opener;
  const node = (tag, text, cls) => { const el = document.createElement(tag); if (text) el.textContent = text; if (cls) el.className = cls; return el; };
  const link = (url, text) => { try { const u = new URL(url); if (!['https:', 'http:'].includes(u.protocol)) return null; const a = node('a', text); a.href = u.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; } catch { return null; } };
  const date = d => new Intl.DateTimeFormat('en-GB', { day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Vilnius' }).format(new Date(d));
  function openEvent(id, trigger) {
    const e = events.find(e => e.id === id); if (!e) return;
    opener = trigger; detail.replaceChildren();
    const heading = node('header', null, 'detail-heading');
    heading.append(node('div', e.type || 'Event', 'eyebrow'));
    const title = node('h2', e.title.en); title.id = 'event-title'; heading.append(title); detail.append(heading);
    const grid = node('div', null, 'detail-grid'); const info = node('div');
    let when = e.start ? date(e.start) : 'Date to be announced';
    if (e.end && date(e.end) !== date(e.start)) when += ' – ' + date(e.end);
    if (e.start && !e.dateOnly) when += ' · ' + new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Vilnius',timeZoneName:'short'}).format(new Date(e.start));
    info.append(node('p', when, 'detail-meta'));
    info.append(node('p', [...new Set([e.venue, e.address].filter(Boolean))].join(' · ') || 'Venue to be confirmed'));
    info.append(node('p', e.description?.en || 'See the official event page for details.'));
    grid.append(info);
    if (e.image?.src && /^\/?assets\//.test(e.image.src)) {
      const fig = node('figure'); const img = node('img'); img.src = '/' + e.image.src.replace(/^\//,''); img.alt = e.title.en; fig.append(img);
      const caption = node('figcaption', 'Event visual · '); const source = link(e.image.source, 'Source ↗'); if (source) caption.append(source); fig.append(caption); grid.append(fig);
    } else grid.classList.add('no-image');
    detail.append(grid);
    const actions = node('div', null, 'detail-actions');
    const urls = [...new Set([e.url,e.website,...(e.sources||[])].filter(u=>typeof u==='string'))];
    urls.forEach((url,i) => { const a = link(url,i===0?'Official event ↗':'Additional source ↗'); if(a) actions.append(a); });
    const community = initiatives?.find(i=>i.id===(e.initiative || (e.type?.toLowerCase()==='walk'?'walks':'meetups')));
    if (!e.start && community) for (const l of community.links.filter(l=>l.kind!=='event')) { const a=link(l.url,l.name+' ↗'); if(a) actions.append(a); }
    if (e.start && !e.dateOnly) {
      const calendar=node('button','Add to calendar');calendar.className='calendar-link';
      calendar.addEventListener('click',async()=>{const {ics}=await import('/domain.js');const url=URL.createObjectURL(new Blob([ics(e)],{type:'text/calendar;charset=utf-8'}));const a=node('a');a.href=url;a.download=e.id+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});actions.append(calendar);
    }
    detail.append(actions);
    const u = new URL(location.href); u.searchParams.set('event',id); history.replaceState(null,'',u);
    if (!dialog.open) dialog.showModal();
  }
  document.addEventListener('click', ev => { const a = ev.target.closest('.event-open'); if(a && !ev.metaKey && !ev.ctrlKey){ ev.preventDefault(); openEvent(a.dataset.event,a); } });
  dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',ev=>{if(ev.target===dialog){const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{const u=new URL(location.href);u.searchParams.delete('event');history.replaceState(null,'',u);opener?.focus();});
  if(params.get('event')) openEvent(params.get('event'));
})();

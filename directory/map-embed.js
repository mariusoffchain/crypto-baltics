if(new URLSearchParams(location.search).get('embed')==='1'){
 document.documentElement.classList.add('directory-embed');
 document.querySelectorAll('.preview-directory').forEach(e=>e.hidden=true);
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='crypto-theme'||!['dark','light'].includes(e.data.mode))return;
  if(document.body.classList.contains('mode-dark')!==(e.data.mode==='dark'))document.querySelector('#appearance')?.click();
 });
 document.querySelectorAll('a[href="/directory/"],a[data-about-link]').forEach(a=>a.target='_parent');
}

if(parent!==window){
 window.addEventListener('atlas-state',()=>parent.postMessage({type:'crypto-map-state',query:location.search},location.origin));
 // Contribution drafts belong to the full page, outside the map frame.
 document.addEventListener('click',event=>{const link=event.target.closest('a[href^="/contribute/"]');if(link)link.target='_parent';});
}

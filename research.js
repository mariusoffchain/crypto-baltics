const $=s=>document.querySelector(s);
function filter(){let n=0;const q=$('#q').value.toLowerCase().trim(),c=$('#country').value,t=$('#category').value,uncertain=$('#uncertain').checked;for(const el of document.querySelectorAll('.research-card')){const show=(!q||el.dataset.search.includes(q))&&(!c||el.dataset.country.split(' ').includes(c))&&(!t||el.dataset.category===t)&&(uncertain||el.dataset.state==='listed');el.hidden=!show;if(show)n++;}$('#count').textContent=`${n} entries shown`;}
for(const id of ['q','country','category','uncertain'])$('#'+id).addEventListener('input',filter);
filter();

function showHash(){const id=location.hash.slice(1),card=document.getElementById(id);if(card?.classList.contains('research-card')){$('#q').value='';$('#country').value='';$('#category').value='';if(card.dataset.state!=='listed')$('#uncertain').checked=true;filter();card.scrollIntoView();}}
window.addEventListener('hashchange',showHash);showHash();

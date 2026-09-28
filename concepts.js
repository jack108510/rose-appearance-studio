(() => {
  const concepts=[...document.querySelectorAll('[data-concept]')];
  const names={halo:'01 Halo',petal:'02 Petal',signal:'03 Signal',companion:'04 Companion',ribbon:'05 Ribbon',prism:'06 Prism'};
  const status=document.querySelector('#review-status');
  let picks=new Set();let filtered=false;
  try{const saved=JSON.parse(localStorage.getItem('rose-concept-shortlist')||'[]');if(Array.isArray(saved))picks=new Set(saved.filter(id=>names[id]));}catch{}
  function render(){for(const concept of concepts){const picked=picks.has(concept.dataset.concept);concept.hidden=filtered&&!picked;const button=concept.querySelector('.shortlist');button.setAttribute('aria-pressed',String(picked));button.textContent=picked?'Shortlisted ✓':'Shortlist ＋';}document.querySelector('#shortlist-count').textContent=`${picks.size} shortlisted`;document.querySelector('#empty-shortlist').hidden=!(filtered&&picks.size===0);document.querySelector('#filter').setAttribute('aria-pressed',String(filtered));document.querySelector('#filter').textContent=filtered?'Show all six':'Show shortlist';}
  for(const concept of concepts){
    concept.querySelector('.shortlist').addEventListener('click',()=>{const id=concept.dataset.concept;picks.has(id)?picks.delete(id):picks.add(id);render();try{localStorage.setItem('rose-concept-shortlist',JSON.stringify([...picks]));status.textContent='Your shortlist is saved in this browser.';}catch{status.textContent='Your shortlist will stay here for this visit.';}});
    const play=concept.querySelector('[data-play]');const original=play.innerHTML;const text=concept.querySelector('.concept-status');const idle=text.innerHTML;const reply=concept.querySelector('.ribbon-reply');let timer;
    text.setAttribute('role','status');
    function end(){clearTimeout(timer);concept.classList.remove('is-playing');text.innerHTML=idle;play.innerHTML=original;if(reply)reply.hidden=true;}
    play.addEventListener('click',()=>{if(concept.classList.contains('is-playing')){end();return;}concept.classList.add('is-playing');text.textContent=concept.dataset.concept==='companion'?'Hi! Good to see you.':concept.dataset.concept==='ribbon'?'Listening. Take your time.':'Listening. I’m here.';play.textContent=concept.dataset.concept==='ribbon'?'■':'End example';if(reply)reply.hidden=false;timer=setTimeout(()=>{text.textContent=concept.dataset.concept==='companion'?'Let’s figure it out.':concept.dataset.concept==='ribbon'?'I can help with that.':'Let’s take the next step.';timer=setTimeout(end,4500);},2300);});
  }
  document.querySelector('#filter').addEventListener('click',()=>{filtered=!filtered;render();});
  document.querySelector('#copy').addEventListener('click',async()=>{if(!picks.size){status.textContent='Shortlist a concept first, then copy your choices.';return;}const text='Rose concepts I want to explore: '+[...picks].map(id=>names[id]).join(', ')+'.';try{await navigator.clipboard.writeText(text);status.textContent='Copied. Paste your picks into our conversation.';}catch{status.textContent=text;}});
  const reference=document.querySelector('#original');document.querySelector('#reference-open').addEventListener('click',()=>reference.showModal());document.querySelector('#reference-close').addEventListener('click',()=>reference.close());reference.addEventListener('click',event=>{if(event.target===reference)reference.close();});render();
})();

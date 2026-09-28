(() => {
  const $ = selector => document.querySelector(selector);
  const root = $('#rose-studio-widget .wr-ai');
  const defaults = {preset:'reference',accent:'#f35b22',radius:38,glass:74,blur:28,orb:164,hue:0,backdrop:'dark',name:'Original glass'};
  const common = {rail:'rgba(234,225,218,.13)',active:'linear-gradient(145deg,rgba(251,245,239,.74),rgba(239,228,219,.49))',line:'rgba(255,245,237,.49)'};
  const presets = {
    reference:{name:'Original glass',ink:'#171310',muted:'#332923',...common,surface:'radial-gradient(ellipse at 2% 0%,rgba(255,255,255,.35),transparent 52%),linear-gradient(135deg,rgba(225,219,214,calc(.74 * var(--glass-factor))),rgba(187,165,152,calc(.57 * var(--glass-factor))) 35%,rgba(188,178,170,calc(.69 * var(--glass-factor))) 69%,rgba(170,160,153,calc(.66 * var(--glass-factor))))'},
    pearl:{name:'Pearl',ink:'#2a211a',muted:'#655346',rail:'rgba(255,255,255,.28)',active:'rgba(255,255,255,.75)',line:'rgba(255,255,255,.7)',surface:'radial-gradient(ellipse at 4% 0%,rgba(255,255,255,.8),transparent 70%),linear-gradient(145deg,rgba(255,248,240,calc(.86 * var(--glass-factor))),rgba(228,210,191,calc(.81 * var(--glass-factor))))'},
    onyx:{name:'Onyx',ink:'#fff0e3',muted:'#e3c9b6',rail:'rgba(16,11,8,.24)',active:'rgba(211,169,136,.18)',line:'rgba(239,198,166,.22)',surface:'radial-gradient(ellipse at 0% 0%,rgba(226,199,181,.15),transparent 55%),linear-gradient(145deg,rgba(60,48,41,calc(.89 * var(--glass-factor))),rgba(23,17,13,calc(.94 * var(--glass-factor))))'},
    copper:{name:'Copper',ink:'#21150e',muted:'#3e281a',...common,surface:'radial-gradient(ellipse at 4% 0%,rgba(255,224,191,.55),transparent 60%),linear-gradient(145deg,rgba(220,165,124,calc(.76 * var(--glass-factor))),rgba(173,104,65,calc(.76 * var(--glass-factor))) 60%,rgba(208,157,120,calc(.8 * var(--glass-factor))))'},
  };
  let state = {...defaults};
  let phase = 'idle';
  function validated(value) {
    const next = {...defaults};
    if (value && typeof value === 'object') {
      if (presets[value.preset]) next.preset = value.preset;
      if (/^#[0-9a-f]{6}$/i.test(value.accent)) next.accent = value.accent;
      for (const [key,min,max] of [['radius',12,48],['glass',30,100],['blur',0,44],['orb',100,200],['hue',0,360]]) {
        if (Number.isFinite(value[key])) next[key] = Math.max(min,Math.min(max,value[key]));
      }
      if (['dark','warm','light'].includes(value.backdrop)) next.backdrop = value.backdrop;
      if (typeof value.name === 'string') next.name = value.name.slice(0,60);
    }
    return next;
  }
  try { const saved=JSON.parse(localStorage.getItem('rose-appearance-draft')); if(saved)state=validated(saved); } catch {}
  const urlPreset = new URLSearchParams(location.search).get('look');
  if(presets[urlPreset]) state={...defaults,preset:urlPreset,name:presets[urlPreset].name};
  function variables() {
    const preset=presets[state.preset];
    return {'--accent':state.accent,'--surface':preset.surface,'--type-ink':preset.ink,'--type-muted':preset.muted,'--tab-rail':preset.rail,'--tab-active':preset.active,'--glass-line':preset.line,'--radius':`${state.radius}px`,'--blur':`${state.blur}px`,'--orb-size':`${state.orb}px`,'--orb-hue':`${state.hue}deg`,'--glass-factor':state.glass/74};
  }
  function apply(sync=true) {
    for(const [key,value] of Object.entries(variables()))root.style.setProperty(key,value);
    root.dataset.appearance=state.preset;
    $('#canvas').dataset.backdrop=state.backdrop;
    $('#look-title').textContent=state.name||presets[state.preset].name;
    $('#accent-value').textContent=state.accent.toUpperCase();
    for(const key of ['radius','glass','blur','orb','hue']) {
      if(sync)$('#'+key).value=state[key];
      $('#'+key+'-value').textContent=state[key]+(key==='hue'?'°':key==='glass'?'%':' px');
    }
    if(sync){$('#accent').value=state.accent;$('#design-name').value=state.name;}
    document.querySelectorAll('[data-preset]').forEach(button=>{const active=button.dataset.preset===state.preset;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);});
    document.querySelectorAll('[data-backdrop]').forEach(button=>{const active=button.dataset.backdrop===state.backdrop;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);});
  }
  function dirty(){ $('#save-status').textContent='Unsaved changes · This workspace only'; }
  document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{state={...defaults,preset:button.dataset.preset,name:presets[button.dataset.preset].name,backdrop:state.backdrop};apply();dirty();}));
  for(const key of ['accent','radius','glass','blur','orb','hue'])$('#'+key).addEventListener('input',event=>{state[key]=key==='accent'?event.target.value:Number(event.target.value);apply(false);dirty();});
  $('#design-name').addEventListener('input',event=>{state.name=event.target.value;apply(false);dirty();});
  document.querySelectorAll('[data-backdrop]').forEach(button=>button.addEventListener('click',()=>{state.backdrop=button.dataset.backdrop;apply(false);dirty();}));
  $('#reset').addEventListener('click',()=>{state={...defaults};apply();setPhase('idle');dirty();});
  $('#save').addEventListener('click',()=>{try{localStorage.setItem('rose-appearance-draft',JSON.stringify(state));$('#save-status').textContent='Draft saved in this browser.';}catch{$('#save-status').textContent='This browser cannot save drafts. Export CSS to keep this look.';}});
  function setPhase(value) {
    phase=value;
    window.__roseSimulation.update({phase:phase==='idle'?'ended':phase,lines:[{who:'visitor',text:'Can I get a quote?'},{who:'rose',text:'Of course. Tell me what you need, and I’ll help you take the next step.'}]});
    if(phase==='idle'){$('.wr-status').textContent='Ready when you are';$('.wr-note').textContent='Tap start and speak naturally.';}
    if(phase==='thinking')$('.wr-note').textContent='Finding the next step.';
    document.querySelectorAll('[data-phase]').forEach(button=>{const active=button.dataset.phase===phase;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);});
  }
  document.querySelectorAll('[data-phase]').forEach(button=>button.addEventListener('click',()=>setPhase(button.dataset.phase)));
  root.addEventListener('rose:simulation-start',()=>setPhase('listening'));
  root.addEventListener('rose:simulation-end',()=>setPhase('idle'));
  $('#export').addEventListener('click',async()=>{
    try {
      const response=await fetch('rose-appearance.css');
      if(!response.ok)throw new Error('Appearance stylesheet is unavailable.');
      const base=(await response.text()).split('/* A darker stage')[0];
      const overrides=[...document.styleSheets].flatMap(sheet=>{try{return [...sheet.cssRules].filter(rule=>rule.selectorText?.startsWith('.studio .wr-ai')).map(rule=>rule.cssText.replaceAll('.studio .wr-ai','.wr-ai'));}catch{return [];}}).join('\n');
      const vars=Object.entries(variables()).map(([key,value])=>`  ${key}: ${value};`).join('\n');
      const css=`/* Rose appearance: ${state.name.replaceAll('*/','')} */\n${base}\n.wr-ai {\n${vars}\n}\n${overrides}\n`;
      const blobURL=URL.createObjectURL(new Blob([css],{type:'text/css'}));
      const link=document.createElement('a');link.href=blobURL;link.download=`rose-${state.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'appearance'}.css`;link.click();setTimeout(()=>URL.revokeObjectURL(blobURL),1000);
      $('#save-status').textContent='CSS exported. Keep the reference orb image beside its assets folder.';
    }catch(error){$('#save-status').textContent=error.message||'Could not export this appearance.';}
  });
  const references=$('#references');
  $('#references-open').addEventListener('click',()=>references.showModal());
  $('#references-close').addEventListener('click',()=>references.close());
  references.addEventListener('click',event=>{if(event.target===references)references.close();});
  apply();setPhase('idle');
})();

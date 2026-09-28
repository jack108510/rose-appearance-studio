(() => {
  const script = document.currentScript;
  const cfg = {
    apiBase: script?.dataset.apiBase || "",
    title: script?.dataset.title || "Rose",
    businessName: script?.dataset.businessName || script?.dataset.company || "Wildrose Automations",
    accent: script?.dataset.accent || "#ff5722",
    logo: script?.dataset.logo || "/logos/wildrose.png",
    ownerEmail: script?.dataset.ownerEmail || script?.dataset.leadEmail || script?.dataset.notificationEmail || "",
    fallbackUrl: script?.dataset.fallbackUrl || "",
    businessId: script?.dataset.businessId || script?.dataset.clientId || "",
    mount: script?.dataset.mount || "",
    inline: script?.dataset.inline === "true",
    contained: script?.dataset.contained === "true",
    subtitle: script?.dataset.subtitle || "AI intake assistant",
    greeting: script?.dataset.greeting || "Tell me what you want automated and I’ll turn it into a clear next step.",
    placeholder: script?.dataset.placeholder || "Ask Rose…",
    website: script?.dataset.website || "",
    businessContext: script?.dataset.businessContext || "",
    services: script?.dataset.services || "",
    defaultView: script?.dataset.defaultView || (script?.dataset.inline === "true" ? "chat" : "voice"),
  };
  const css = `
    .wr-ai,.wr-ai *{box-sizing:border-box}
    .wr-ai{
      --accent:${cfg.accent};
      --accent-soft:color-mix(in srgb,var(--accent) 32%,white);
      --glass:rgba(255,255,255,.34);
      --glass-strong:rgba(255,255,255,.56);
      --ink:#18120f;
      --muted:#554b45;
      position:fixed;right:22px;bottom:22px;z-index:2147483000;
      font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;
      color:var(--ink);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
    }
    .wr-ai.inline{position:relative;right:auto;bottom:auto;width:min(430px,100%);margin:0 auto;z-index:3}.wr-ai.inline:before{right:50%;bottom:50%;transform:translate(50%,50%);width:280px;height:280px}.wr-ai.inline .wr-fab{display:none!important}.wr-ai.inline .wr-close{display:none}.wr-ai.inline .wr-panel{position:relative;right:auto;bottom:auto;display:grid;width:100%;height:560px}.wr-ai.inline .wr-panel.open{display:grid;animation:none}.wr-ai.contained{position:absolute;right:18px;bottom:18px;z-index:20}.wr-ai.contained .wr-panel{width:min(390px,calc(100vw - 52px));height:min(570px,calc(100vh - 110px))}@media (max-width:720px){.wr-ai.contained{right:12px;bottom:12px}.wr-ai.contained .wr-panel{width:min(360px,calc(100vw - 36px));height:min(560px,calc(100vh - 92px))}}
    .wr-ai:before{content:"";position:absolute;right:-26px;bottom:-26px;width:176px;height:176px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 28%,transparent),transparent 68%);filter:blur(10px);pointer-events:none;opacity:.9}
    .wr-fab{width:76px;height:76px;border:0;padding:0;border-radius:28px;display:grid;place-items:center;cursor:pointer;background:linear-gradient(145deg,rgba(255,255,255,.66),rgba(255,255,255,.22));box-shadow:0 26px 70px rgba(34,20,14,.24),0 0 0 1px rgba(255,255,255,.55),inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(255,255,255,.24);backdrop-filter:blur(34px) saturate(1.55);-webkit-backdrop-filter:blur(34px) saturate(1.55);transition:transform .22s cubic-bezier(.2,.8,.2,1),box-shadow .22s ease,filter .22s ease;position:relative;overflow:hidden}
    .wr-fab:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(255,255,255,0) 38%,color-mix(in srgb,var(--accent) 18%,transparent) 100%);mix-blend-mode:screen;pointer-events:none}
    .wr-fab:after{content:"";position:absolute;inset:9px;border-radius:22px;border:1px solid rgba(255,255,255,.42);pointer-events:none}
    .wr-fab:hover{transform:translateY(-4px) scale(1.035);box-shadow:0 34px 86px rgba(34,20,14,.30),0 0 0 1px rgba(255,255,255,.70),0 0 36px color-mix(in srgb,var(--accent) 18%,transparent),inset 0 1px 0 rgba(255,255,255,.98)}
    .wr-dot{width:56px;height:56px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.26));box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 12px 30px rgba(36,20,12,.15);overflow:hidden;position:relative}.wr-dot img{width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 5px 12px rgba(0,0,0,.14))}
    .wr-panel{position:absolute;right:0;bottom:0;width:min(382px,calc(100vw - 24px));height:min(578px,calc(100vh - 24px));display:none;grid-template-rows:auto auto 1fr auto;overflow:hidden;border-radius:38px;background:linear-gradient(145deg,#fffefd,color-mix(in srgb,var(--accent) 7%,white) 46%,color-mix(in srgb,var(--accent) 16%,white));border:1px solid rgba(255,255,255,.75);box-shadow:0 34px 110px rgba(29,18,12,.28),0 0 0 1px rgba(255,255,255,.28),inset 0 1px 0 rgba(255,255,255,.92),inset 0 -1px 0 rgba(255,255,255,.20);backdrop-filter:blur(44px) saturate(1.8);-webkit-backdrop-filter:blur(44px) saturate(1.8)}
    .wr-panel:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 12% 0%,rgba(255,255,255,.88),transparent 30%),radial-gradient(circle at 92% 10%,color-mix(in srgb,var(--accent) 26%,transparent),transparent 34%),linear-gradient(160deg,rgba(255,255,255,.38),transparent 45%);pointer-events:none}.wr-panel:after{content:"";position:absolute;inset:1px;border-radius:37px;border:1px solid rgba(255,255,255,.40);pointer-events:none}.wr-panel.open{display:grid;animation:wrGlassIn .28s cubic-bezier(.18,.9,.2,1)}@keyframes wrGlassIn{from{opacity:0;transform:translateY(18px) scale(.972);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
    .wr-head,.wr-tabs,.wr-compose{position:relative;z-index:1}.wr-head{padding:17px 17px 12px}.wr-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.wr-brand{display:flex;align-items:center;gap:11px}.wr-mark{width:44px;height:44px;border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.68),rgba(255,255,255,.24));display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 12px 28px rgba(36,20,12,.13);overflow:hidden}.wr-mark img{width:88%;height:88%;object-fit:contain;filter:drop-shadow(0 4px 9px rgba(0,0,0,.12))}.wr-title h3{margin:0;font-size:17px;font-weight:850;letter-spacing:-.035em}.wr-title small{display:block;margin-top:1px;color:var(--muted);font-size:12px;font-weight:650}.wr-close{width:36px;height:36px;border:1px solid rgba(255,255,255,.46);border-radius:14px;background:rgba(255,255,255,.28);color:rgba(24,18,15,.72);font-size:21px;line-height:1;cursor:pointer;backdrop-filter:blur(16px);transition:.16s ease}.wr-close:hover{background:rgba(255,255,255,.48);color:#160f0c;transform:scale(1.04)}
    .wr-tabs{margin:0 17px 12px;padding:4px;border-radius:18px;background:rgba(255,255,255,.26);border:1px solid rgba(255,255,255,.42);display:grid;grid-template-columns:1fr 1fr;gap:4px;box-shadow:inset 0 1px 0 rgba(255,255,255,.50)}.wr-tab{height:38px;border:0;border-radius:14px;background:transparent;color:rgba(24,18,15,.54);font-weight:780;cursor:pointer;transition:.18s ease}.wr-tab.active{background:rgba(255,255,255,.62);color:#18120f;box-shadow:0 10px 24px rgba(28,18,12,.10),inset 0 1px 0 rgba(255,255,255,.82)}
    .wr-view{position:relative;z-index:1;display:none;min-height:0;overflow:auto;padding:0 17px 14px}.wr-view.active{display:block}.wr-chat-log{display:flex;flex-direction:column;gap:10px;padding:2px 0 10px}.wr-row{display:flex;align-items:flex-end;gap:8px}.wr-avatar{width:28px;height:28px;border-radius:11px;background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 58%,white));display:grid;place-items:center;overflow:hidden;flex:0 0 auto}.wr-avatar img{width:78%;height:78%;object-fit:contain}.wr-dot[data-logo-fallback="true"]::before,.wr-mark[data-logo-fallback="true"]::before,.wr-avatar[data-logo-fallback="true"]::before{content:"✦";font-weight:950;color:var(--accent);font-size:22px}.wr-avatar[data-logo-fallback="true"]::before{color:#fff;font-size:15px}.wr-msg{max-width:86%;padding:11px 13px;border-radius:18px;font-size:14px;line-height:1.45;white-space:pre-wrap;box-shadow:0 10px 26px rgba(28,18,12,.08)}.wr-msg.bot{background:rgba(255,255,255,.54);border:1px solid rgba(255,255,255,.56);border-bottom-left-radius:7px}.wr-msg.user{align-self:flex-end;background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 72%,white));color:white;border-bottom-right-radius:7px}
    .wr-voice{height:100%;min-height:330px;display:grid;place-items:center;text-align:center;padding:18px 12px 26px}.wr-orb{width:164px;height:164px;margin:0 auto 22px;border-radius:50%;background:radial-gradient(circle at 35% 27%,rgba(255,255,255,.95),color-mix(in srgb,var(--accent) 12%,white) 22%,color-mix(in srgb,var(--accent) 42%,white) 48%,color-mix(in srgb,var(--accent) 76%,white) 78%);box-shadow:inset 0 2px 8px rgba(255,255,255,.9),inset 0 -18px 32px color-mix(in srgb,var(--accent) 15%,transparent),0 24px 74px color-mix(in srgb,var(--accent) 26%,transparent),0 0 0 1px rgba(255,255,255,.72);position:relative;overflow:hidden;transform-origin:50% 58%}.wr-orb:before{content:"";position:absolute;inset:18px;border-radius:50%;background:radial-gradient(circle at 35% 20%,rgba(255,255,255,.86),transparent 34%);filter:blur(2px)}.wr-orb:after{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 20deg,transparent,rgba(255,255,255,.45),transparent,color-mix(in srgb,var(--accent) 25%,transparent),transparent);animation:wrSpin 6s linear infinite;opacity:.72}@keyframes wrSpin{to{transform:rotate(1turn)}}.wr-orb.live{animation:wrPulse 1.8s ease-in-out infinite}.wr-orb.speaking{animation:wrSpeak 1.05s cubic-bezier(.35,0,.25,1) infinite;box-shadow:inset 0 2px 8px rgba(255,255,255,.9),0 28px 94px color-mix(in srgb,var(--accent) 42%,transparent),0 0 0 12px color-mix(in srgb,var(--accent) 8%,transparent)}@keyframes wrPulse{50%{transform:scale(1.035);filter:saturate(1.12)}}@keyframes wrSpeak{0%,100%{transform:translateY(0) scale(1);border-radius:50%}22%{transform:translateY(-5px) scale(1.035,.965);border-radius:48% 52% 47% 53%}48%{transform:translateY(3px) scale(.982,1.026);border-radius:54% 46% 52% 48%}72%{transform:translateY(-2px) scale(1.018,.99);border-radius:49% 51% 55% 45%}}.wr-panel.speaking .wr-status{animation:wrTextBreathe 1.05s ease-in-out infinite}@keyframes wrTextBreathe{50%{opacity:.72;transform:translateY(-1px)}}.wr-status{font-size:23px;font-weight:860;letter-spacing:-.05em;margin-bottom:7px}.wr-note{font-size:13px;color:var(--muted);line-height:1.45;margin-bottom:18px}.wr-primary,.wr-secondary{height:48px;border:0;border-radius:999px;padding:0 22px;font-weight:860;cursor:pointer}.wr-primary{color:white;background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 75%,white));box-shadow:0 16px 34px color-mix(in srgb,var(--accent) 25%,transparent),inset 0 1px 0 rgba(255,255,255,.28)}.wr-secondary{background:rgba(255,255,255,.44);border:1px solid rgba(255,255,255,.56);color:#211612}.wr-live-transcript{display:none;margin:18px auto 0;width:min(292px,100%);border-radius:22px;padding:12px;background:rgba(255,255,255,.30);border:1px solid rgba(255,255,255,.48);box-shadow:inset 0 1px 0 rgba(255,255,255,.55);text-align:left}.wr-live-transcript.has-lines{display:block}.wr-live-label{font-size:11px;text-transform:uppercase;letter-spacing:.14em;font-weight:900;color:rgba(24,18,15,.46);margin-bottom:8px}.wr-live-lines{display:flex;flex-direction:column;gap:6px;max-height:96px;overflow:auto}.wr-live-line{font-size:12px;line-height:1.35;color:rgba(24,18,15,.78);padding:7px 9px;border-radius:13px;background:rgba(255,255,255,.34)}.wr-live-line.user{background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--ink)}.wr-compose{display:none;align-items:center;gap:8px;margin:0 17px 17px;padding:8px;border-radius:22px;background:rgba(255,255,255,.36);border:1px solid rgba(255,255,255,.52);box-shadow:inset 0 1px 0 rgba(255,255,255,.55)}.wr-input{flex:1;height:38px;border:0;background:transparent;outline:0;color:var(--ink);font-size:14px;padding:0 8px}.wr-input::placeholder{color:rgba(24,18,15,.44)}.wr-send{width:38px;height:38px;border:0;border-radius:15px;background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 75%,white));color:white;display:grid;place-items:center;cursor:pointer}.wr-send svg{width:18px;height:18px}.wr-toast{position:absolute;left:17px;right:17px;bottom:78px;padding:10px 12px;border-radius:16px;background:rgba(24,18,15,.78);color:white;font-size:12px;text-align:center;opacity:0;transform:translateY(6px);pointer-events:none;transition:.16s ease}.wr-toast.show{opacity:1;transform:none}.wr-fallback{display:inline-block;margin-top:5px;color:#9a3210;font-weight:850;text-decoration:underline;text-underline-offset:2px}
    @media (max-width:520px){.wr-ai{right:12px;bottom:12px}.wr-panel{width:calc(100vw - 24px);height:min(620px,calc(100vh - 24px));border-radius:34px}.wr-fab{width:70px;height:70px;border-radius:25px}.wr-orb{width:146px;height:146px}}
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.className = cfg.inline ? "wr-ai inline" : (cfg.contained ? "wr-ai contained" : "wr-ai");
  root.innerHTML = `
    <button class="wr-fab" aria-label="Open Rose assistant"><span class="wr-dot"><img src="${cfg.logo}" alt=""></span></button>
    <section class="wr-panel" aria-label="${cfg.title}">
      <header class="wr-head"><div class="wr-top"><div class="wr-brand"><div class="wr-mark"><img src="${cfg.logo}" alt=""></div><div class="wr-title"><h3>${cfg.title}</h3><small>${cfg.subtitle}</small></div></div><button class="wr-close" aria-label="Close">×</button></div></header>
      <div class="wr-tabs" role="tablist"><button class="wr-tab" data-view="chat">Chat</button><button class="wr-tab active" data-view="voice">Voice</button></div>
      <main class="wr-view" data-view="chat"><div class="wr-chat-log"><div class="wr-row"><div class="wr-avatar"><img src="${cfg.logo}" alt=""></div><div class="wr-msg bot">${cfg.greeting}</div></div></div></main>
      <main class="wr-view active" data-view="voice"><div class="wr-voice"><div><div class="wr-orb"></div><div class="wr-status">Ready when you are</div><div class="wr-note">Tap start and speak naturally.</div><button class="wr-primary wr-start-voice">Start talking</button><button class="wr-secondary wr-end-voice" style="display:none">End</button></div></div></main>
      <div class="wr-compose"><input class="wr-input" placeholder="${cfg.placeholder}"><button class="wr-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h12M12 7l5 5-5 5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="wr-toast"></div>
    </section>`;
  const mount = cfg.mount ? document.querySelector(cfg.mount) : null;
  (mount || document.body).appendChild(root);

  // Native website visuals, driven only by the illustrated conversation timeline.
  const $ = selector => root.querySelector(selector);
  const $$ = selector => Array.from(root.querySelectorAll(selector));
  const panel=$('.wr-panel'),orb=$('.wr-orb'),status=$('.wr-status'),note=$('.wr-note');
  let transcriptKey='',currentPhase='';
  function setView(view){
    $$('.wr-tab').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
    $$('.wr-view').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
    $('.wr-compose').style.display=view==='chat'?'flex':'none';
  }
  $$('.wr-tab').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.view)));
  setView(cfg.defaultView);
  $('.wr-input').readOnly=true;$('.wr-send').disabled=true;
  $('.wr-start-voice').addEventListener('click',()=>root.dispatchEvent(new CustomEvent('rose:simulation-start',{bubbles:true})));
  $('.wr-end-voice').addEventListener('click',()=>root.dispatchEvent(new CustomEvent('rose:simulation-end',{bubbles:true})));
  window.__roseSimulation={update({phase,lines,paused=false}){
    root.dataset.simulationPhase=phase;root.dataset.simulationPaused=String(paused);
    if(currentPhase!==phase){
      currentPhase=phase;
      panel.classList.toggle('speaking',phase==='speaking');
      orb.classList.toggle('speaking',phase==='speaking');orb.classList.toggle('listening',phase==='listening');
      orb.classList.toggle('live',phase==='speaking'||phase==='listening');
      status.textContent={listening:'Listening',thinking:'Thinking',speaking:'Rose is speaking',ended:'Call ended'}[phase]||'Ready when you are';
      note.textContent=phase==='ended'?'Start another conversation anytime.':'Speak naturally. Interrupt anytime.';
      $('.wr-start-voice').style.display=phase==='ended'?'inline-block':'none';
      $('.wr-end-voice').style.display=phase==='ended'?'none':'inline-block';
    }
    const key=JSON.stringify(lines.map(line=>[line.who,line.text]));
    if(key!==transcriptKey){
      transcriptKey=key;const log=$('.wr-chat-log');log.replaceChildren();
      for(const line of lines){
        const bubble=document.createElement('div');bubble.className='wr-msg '+(line.who==='rose'?'bot':'user');bubble.textContent=line.text;
        if(line.who==='rose'){
          const row=document.createElement('div');row.className='wr-row';const avatar=document.createElement('div');avatar.className='wr-avatar';const img=document.createElement('img');img.src=cfg.logo;img.alt='';avatar.append(img);row.append(avatar,bubble);log.append(row);
        }else log.append(bubble);
      }
      log.parentElement.scrollTop=log.parentElement.scrollHeight;
    }
    orb.style.animationPlayState=paused?'paused':'running';status.style.animationPlayState=paused?'paused':'running';
  }};
})();

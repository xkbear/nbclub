/* Historical stories use public archives; teaching takeaways are our narration. */
(() => {
  window.renderDarwin = () => `<section class="native history-page darwin-page"><p class="kicker">好奇心 · 达尔文的研究之路</p>${window.feynmanTabs('darwin')}<h1>带着好奇出发，沿着证据走下去。</h1><p class="darwin-subtitle">1831—1859 · 从小猎犬号远航，到《物种起源》</p><button class="darwin-route" data-learning-zoom="assets/story/darwin-research-journey.svg" aria-label="放大达尔文从观察到物种起源的完整研究路线图"><img src="assets/story/darwin-research-journey.svg" alt="八个节点：出航观察、留意差异、返航比较、形成解释、写成草稿、积累与检验、共同发表、物种起源出版"></button><div class="darwin-ending"><strong>一个问题，值得用观察、比较与验证，一直追下去。</strong><button data-feynman-view="method">接着看：怎样学懂 →</button></div><span class="page-label">04</span></section>`;
  window.mountDarwin = () => {};
  const tabs = active => `<nav class="history-tabs" aria-label="意志力的故事">${[['edison','爱迪生'],['rocket','SpaceX']].map(([id,label])=>`<button data-inventor="${id}" class="${active===id?'selected':''}" aria-pressed="${active===id}">${label}</button>`).join('')}</nav>`;
  const experiments=[['灯丝容易烧断','换材料，重新测试。'],['1879 · 碳化棉线','一次试验，亮了至少 13 小时。'],['继续改进','寻找更好的灯丝，也完善供电系统。']];
  window.renderInventors = (view='edison') => {
    if(view==='rocket')return `<section class="native history-page rocket-page"><p class="kicker">意志力 · 马斯克与 SpaceX 团队</p>${tabs(view)}<h1>我们看见“烟花”，<br>工程师带回问题。</h1><div class="rocket-video" id="rocket-video"><img src="assets/story/spacex-trials.jpg" alt="SpaceX 官方发布的火箭回收失败影像"><button class="rocket-play" data-rocket-play><span>▶</span>播放 SpaceX 官方集锦</button></div><aside class="rocket-copy"><p class="rocket-attribution">特朗普 · 2026.10.08</p><blockquote>“当代爱迪生”</blockquote><p>真正值得学的，<br>是把试验、复盘、修改<br>持续做下去。</p><a href="https://www.youtube.com/watch?v=bvim4rsNHkQ" target="_blank" rel="noopener">打开官方原片 ↗</a></aside><p class="rocket-caption">How Not to Land an Orbital Rocket Booster · SpaceX · 2017</p><p class="history-bottom">失败本身不会让人进步，带着反馈再做一次才会。</p><span class="page-label">12</span></section>`;
    return `<section class="native history-page edison-page"><p class="kicker">意志力 · 爱迪生与他的实验团队</p>${tabs(view)}<h1>灯泡的背后，<br>是一版又一版。</h1><figure class="edison-object"><div class="edison-count"><b>数百次</b><span>竹丝灯问世前，已反复试验。</span></div><img src="assets/story/edison-lamp.jpg" alt="爱迪生早期灯泡的复制品，美国国家公园管理局图片"><figcaption>早期灯泡复制品 · NPS</figcaption></figure><div class="edison-work"><p class="history-eyebrow">怎样让灯，亮得更久？</p><div class="experiment-readout"><span id="experiment-label">${experiments[0][0]}</span><h2 id="experiment-result">${experiments[0][1]}</h2><svg viewBox="0 0 120 150" class="experiment-bulb" aria-label="灯泡示意图"><circle class="bulb-halo" cx="60" cy="55" r="51"/><path d="M36 101V91C8 72 15 21 60 20c45 1 52 52 24 71v10M37 106h46M39 117h42M46 128h28" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M49 97V68l-9-13 20 8 20-8-9 13v29" fill="none" stroke="currentColor" stroke-width="3"/></svg></div><nav class="experiment-steps" aria-label="灯泡试验的三个阶段">${experiments.map((s,i)=>`<button data-experiment="${i}" class="${i===0?'selected':''}" aria-pressed="${i===0}"><b>0${i+1}</b>${['发现问题','换一种试法','继续完善'][i]}</button>`).join('')}</nav><p class="edison-question">孩子卡住时，可以先问：<br><strong>“这一次，你发现哪里需要改？”</strong></p></div><p class="history-bottom">AI 可以帮助更快试错，孩子仍需要亲自调整。</p><span class="page-label">12</span></section>`;
  };
  window.mountInventors=(root,renderView)=>{
    root.querySelectorAll('[data-inventor]').forEach(b=>b.onclick=()=>renderView(b.dataset.inventor));
    root.querySelectorAll('[data-experiment]').forEach(b=>b.onclick=()=>{
      const i=Number(b.dataset.experiment),s=experiments[i];
      root.querySelector('#experiment-label').textContent=s[0];root.querySelector('#experiment-result').textContent=s[1];root.querySelector('.experiment-readout').dataset.step=i;
      root.querySelectorAll('[data-experiment]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
    });
    root.querySelector('[data-rocket-play]')?.addEventListener('click',()=>{
      root.querySelector('#rocket-video').innerHTML='<iframe title="SpaceX 官方：How Not to Land an Orbital Rocket Booster" src="https://www.youtube-nocookie.com/embed/bvim4rsNHkQ?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    });
  };

  const familyTabs = active => `<nav class="history-tabs" aria-label="亲缘感的故事"><button data-family="rose" class="${active==='rose'?'selected':''}">小王子</button><button data-family="slow" class="${active==='slow'?'selected':''}">孩子你慢慢来</button></nav>`;
  const slowMoments=[['一个总是松开的结','卖花的小男孩想绑好花束，\n手太小，绳结总是松开。'],['有人催促，有人愿意等','祖母着急了。\n龙应台却坐下来，愿意等他再试。'],['把从容，留一点给孩子','当孩子还没做好时，\n先别急着接管，陪他再试一次。']];
  const bouquet=`<svg viewBox="0 0 520 340" role="img" aria-label="花束与尚未扎好的绳结，故事示意"><ellipse cx="260" cy="305" rx="181" ry="14" fill="#e8e3db"/><path d="m131 125 127 166 122-166" fill="#ece6dc"/><path d="m145 127 114 157M376 127 259 284M213 114l44 173M309 110l-50 177" fill="none" stroke="#76927c" stroke-width="6"/><path d="M241 236c-60-1-91-32-89-48 25-7 75 7 92 38M275 237c36-43 69-48 85-38-2 24-37 46-86 38M255 238c-19 28-38 51-69 50M267 241c26 17 51 29 88 18" fill="none" stroke="#bb8358" stroke-width="7" stroke-linecap="round"/><circle cx="258" cy="236" r="12" fill="#c99470"/>${[[150,109,43],[207,79,41],[267,103,48],[329,72,40],[367,122,39]].map(([x,y,r])=>`<g><circle cx="${x}" cy="${y}" r="${r}" fill="#e9aa9c"/><path d="M${x-r*.5} ${y+5}c-7-38 48-37 42-6-4 20-35 20-32 2 3-13 22-12 21 0" fill="none" stroke="#c77e73" stroke-width="3" stroke-linecap="round"/></g>`).join('')}</svg>`;
  window.renderFamilyStory=(view='rose',roseHtml='',page=23)=>view==='rose'?roseHtml.replace('<section class="native rose-page">','<section class="native rose-page">'+familyTabs(view)):`<section class="native history-page family-slow"><p class="kicker">亲缘感 · 龙应台《孩子你慢慢来》</p>${familyTabs(view)}<h1>一个蝴蝶结，<br>值得等多久？</h1><figure class="family-bouquet">${bouquet}<figcaption>〈蝴蝶结〉 · 故事情境示意</figcaption></figure><div class="family-slow-copy"><p class="history-eyebrow">孩子还在试，我们已经急了。</p><h2 id="slow-title">${slowMoments[0][0]}</h2><p id="slow-detail">${slowMoments[0][1].replace(/\n/g,'<br>')}</p><nav class="slow-steps" aria-label="蝴蝶结的故事">${['孩子在试','大人愿意等','带回家'].map((x,i)=>`<button data-slow-step="${i}" class="${i===0?'selected':''}" aria-pressed="${i===0}"><span>0${i+1}</span>${x}</button>`).join('')}</nav><p class="slow-takeaway">AI 可以很快给出结果。<br>关系，长在愿意陪孩子经历的时间里。</p></div><p class="history-bottom">孩子需要的，有时是一个愿意等他的真人。</p><span class="page-label">${String(page).padStart(2,'0')}</span></section>`;
  window.mountFamilyStory=(root,renderView)=>{
    root.querySelectorAll('[data-family]').forEach(b=>b.onclick=()=>renderView(b.dataset.family));
    root.querySelectorAll('[data-slow-step]').forEach(b=>b.onclick=()=>{
      const s=slowMoments[Number(b.dataset.slowStep)];root.querySelector('#slow-title').textContent=s[0];root.querySelector('#slow-detail').innerHTML=s[1].replace(/\n/g,'<br>');root.querySelectorAll('[data-slow-step]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
    });
  };
})();

/* The second half of Zou Ji: hearing dissent requires making room for it. */
(() => {
  const robe = (x,y,king=false) => `<g transform="translate(${x} ${y})"><circle cx="0" cy="0" r="21" fill="${king?'#d4ad65':'#779bb1'}"/><path d="M-33 83-24 35Q0 20 24 35l9 48Z" fill="${king?'#e6d4ae':'#dbe8ed'}" stroke="${king?'#a58247':'#557989'}" stroke-width="3"/><path d="m-14 33 14 24 14-24M0 57v25" fill="none" stroke="${king?'#a58247':'#557989'}" stroke-width="3"/>${king?'<path d="m-23-17 3-20 20 8 20-8 3 20Z" fill="#a58247"/>':''}</g>`;
  const shell = content => `<svg viewBox="0 0 520 300" role="img" aria-label="故事示意">${content}</svg>`;
  const arrows='<path d="M168 151h157m-15-12 15 12-15 12" fill="none" stroke="#779bb1" stroke-width="3" stroke-linecap="round"/>';
  const art=[
    shell(`<ellipse cx="260" cy="267" rx="207" ry="14" fill="#e9edf0"/>${robe(112,144)}${robe(385,130,true)}${arrows}<path d="M174 47h151a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16h-97l-28 21v-21h-26a16 16 0 0 1-16-16V63a16 16 0 0 1 16-16Z" fill="#edf4f8"/><text x="250" y="96" text-anchor="middle" fill="#486c82" font-size="28">王之蔽甚矣</text><text x="112" y="290" text-anchor="middle" fill="#7b8790" font-size="17">邹忌进谏</text><text x="385" y="290" text-anchor="middle" fill="#7b8790" font-size="17">齐威王</text>`),
    shell(`<circle cx="365" cy="147" r="115" fill="#f5f0e7"/>${robe(365,116,true)}<text x="365" y="245" text-anchor="middle" fill="#927345" font-size="20">愿意听 · 奖励说</text>${[['当面批评','上赏'],['上书劝谏','中赏'],['公开议论','下赏']].map(([name,award],i)=>`<g transform="translate(18 ${20+i*95})"><rect width="207" height="72" rx="13" fill="#eef4f7"/><text x="17" y="43" fill="#486c82" font-size="22">${name}</text><text x="153" y="43" fill="#a58247" font-size="19">${award}</text><path d="M220 36h38m-10-8 10 8-10 8" stroke="#97afbd" stroke-width="2.5" fill="none"/></g>`).join('')}`),
    shell(`<path d="M145 64 260 11l115 53M165 69h190v148H165Z" fill="#f6f0e4" stroke="#b99c68" stroke-width="3" stroke-linejoin="round"/><path d="M210 211V88h100v123" fill="#fff" stroke="#b99c68" stroke-width="3"/><path d="m210 88-29 14v112l29-3m100-123 29 14v112l-29-3" fill="#e9d9bb" stroke="#b99c68" stroke-width="3"/><text x="260" y="149" text-anchor="middle" fill="#9d7d43" font-size="27">纳谏</text>${[85,155,225,295,365,435].map((x,i)=>`<g transform="translate(${x} ${i%2?225:245})"><circle r="13" fill="#779bb1"/><path d="M-18 40-13 19q13-9 26 0l5 21Z" fill="#dbe8ed" stroke="#779bb1" stroke-width="2"/></g>`).join('')}`),
    shell(`<ellipse cx="260" cy="268" rx="206" ry="13" fill="#e9edf0"/><path d="M91 243v-69q46-53 92 0v69M330 243v-51q35-40 70 0v51" fill="#dbe8ed" stroke="#779bb1" stroke-width="3"/><circle cx="137" cy="124" r="28" fill="#779bb1"/><circle cx="365" cy="151" r="23" fill="#d4ad65"/><path d="M190 22h253a14 14 0 0 1 14 14v53a14 14 0 0 1-14 14h-47l-22 20v-20H190a14 14 0 0 1-14-14V36a14 14 0 0 1 14-14Z" fill="#f6f0e4"/><text x="315" y="74" text-anchor="middle" fill="#94733f" font-size="27">我有不同的想法</text><path d="M181 171q75 42 144 8m-15-6 15 6-8 13" stroke="#779bb1" stroke-width="3" fill="none"/><text x="251" y="250" text-anchor="middle" fill="#486c82" font-size="22">先听他说完</text>`)
  ];
  const moments=[
    {tab:'邹忌进谏',title:'从自己的小事，看到君王的处境。',quote:'“王之蔽甚矣！”',detail:'邹忌入朝，把妻、妾、客的回答讲给齐王听。<br>身边的人偏爱您、畏惧您、有求于您，<br>您也可能因此听不到真话。'},
    {tab:'齐王纳谏',title:'一句“善”之后，是让人敢说的行动。',quote:'王曰：“善。”',detail:'齐王下令：当面指出过错，给上赏；<br>上书劝谏，给中赏；公开议论传到耳中，给下赏。<br><strong>他用奖赏，鼓励大家指出自己的问题。</strong>'},
    {tab:'门庭若市',title:'真话的门一开，意见就来了。',quote:'“群臣进谏，门庭若市。”',detail:'文中写道：进谏由多到少，一年后“无可进者”。<br>燕、赵、韩、魏闻讯来朝，<br>故事以“战胜于朝廷”收束。'},
    {tab:'带回家',title:'孩子说“我不同意”时，我们怎么接？',quote:'先问：“你看到了什么？”',detail:'让他说完，听懂他为什么这样想。<br>他说得有道理，就承认并调整。<br><strong>AI 帮我们找反例；真人之间，也要容得下不同意见。</strong>'}
  ];
  window.renderZoujiCourt = page => `<section class="native zouji-court"><p class="kicker">同理心 · 《邹忌讽齐王纳谏》</p><button class="zouji-back" data-comic-view="reflection">← 回看邹忌的反思</button><h1>故事的关键，<br>是齐王怎样纳谏。</h1><figure class="zouji-art" id="zouji-art">${art[0]}<figcaption>从听到赞美，到主动听取不同意见</figcaption></figure><article class="zouji-scene" aria-live="polite"><p id="zouji-chapter">01 · ${moments[0].tab}</p><h2 id="zouji-title">${moments[0].title}</h2><blockquote id="zouji-quote">${moments[0].quote}</blockquote><p id="zouji-detail">${moments[0].detail}</p></article><nav class="zouji-steps" aria-label="齐王纳谏的故事">${moments.map((x,i)=>`<button data-zouji-step="${i}" class="${i===0?'selected':''}" aria-pressed="${i===0}"><span>0${i+1}</span>${x.tab}</button>`).join('')}<button class="zouji-next" data-zouji-next>继续 →</button></nav><p class="zouji-bottom">能听见真话，要先让人敢说真话。</p><span class="page-label">${String(page).padStart(2,'0')} · 续</span></section>`;
  window.mountZoujiCourt = root => {
    if(!root.querySelector('.zouji-court'))return;
    let step=0;
    const show=i=>{
      step=i;const x=moments[i];
      root.querySelector('#zouji-chapter').textContent=`0${i+1} · ${x.tab}`;
      root.querySelector('#zouji-title').textContent=x.title;
      root.querySelector('#zouji-quote').textContent=x.quote;
      root.querySelector('#zouji-detail').innerHTML=x.detail;
      root.querySelector('#zouji-art').innerHTML=art[i]+'<figcaption>'+['从听到赞美，到主动听取不同意见','把不同意见，请进来','《战国策》中的纳谏故事','给孩子表达理由的空间'][i]+'</figcaption>';
      root.querySelectorAll('[data-zouji-step]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.zoujiStep)===i);b.setAttribute('aria-pressed',String(Number(b.dataset.zoujiStep)===i));});
      root.querySelector('[data-zouji-next]').textContent=i===3?'再看一遍 ↻':'继续 →';
    };
    root.querySelectorAll('[data-zouji-step]').forEach(b=>b.onclick=()=>show(Number(b.dataset.zoujiStep)));
    root.querySelector('[data-zouji-next]').onclick=()=>show((step+1)%moments.length);
  };
})();

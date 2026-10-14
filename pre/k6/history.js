/* Historical stories use public archives; teaching takeaways are our narration. */
(() => {
  const stages = [
    ['1831 · 出发','22 岁，登上小猎犬号。','他还没有自然选择理论。先去观察、采集、记录。'],
    ['1835 · 追问','相邻的岛，鸟为什么不同？','加拉帕戈斯的嘲鸫差异，成为他继续研究的线索。'],
    ['1859 · 成书','问题没有在返航时结束。','回到英国后继续研究，二十多年后出版《物种起源》。']
  ];
  window.renderDarwin = () => `<section class="native history-page darwin-page"><p class="kicker">好奇心 · 达尔文与小猎犬号</p>${window.feynmanTabs('darwin')}<h1>没有现成答案，<br>也可以先出发。</h1><figure class="darwin-ship"><img src="assets/story/darwin-beagle-plan.jpg" alt="1832 年小猎犬号的甲板与剖面图"><figcaption>小猎犬号 · 1832 年图稿 · Philip Gidley King</figcaption></figure><div class="darwin-moment"><span id="darwin-date">${stages[0][0]}</span><h2 id="darwin-event">${stages[0][1]}</h2><p id="darwin-detail">${stages[0][2]}</p></div><nav class="history-timeline" aria-label="达尔文的探索过程">${stages.map((s,i)=>`<button data-darwin-step="${i}" class="${i===0?'selected':''}" aria-pressed="${i===0}"><span>0${i+1}</span>${s[0]}</button>`).join('')}</nav><p class="history-bottom">伟大的发现，常从不放过一个问题开始。</p><span class="page-label">04</span></section>`;
  window.mountDarwin = root => root.querySelectorAll('[data-darwin-step]').forEach(b=>b.onclick=()=>{
    const i=Number(b.dataset.darwinStep),s=stages[i];
    root.querySelector('#darwin-date').textContent=s[0];root.querySelector('#darwin-event').textContent=s[1];root.querySelector('#darwin-detail').textContent=s[2];
    root.querySelectorAll('[data-darwin-step]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
  });
  const tabs = active => `<nav class="history-tabs" aria-label="意志力的故事">${[['edison','爱迪生'],['rocket','火箭试飞'],['dyson','戴森原型']].map(([id,label])=>`<button data-inventor="${id}" class="${active===id?'selected':''}" aria-pressed="${active===id}">${label}</button>`).join('')}</nav>`;
  const experiments=[['灯丝容易烧断','换材料，重新测试。'],['1879 · 碳化棉线','一次试验，亮了至少 13 小时。'],['继续改进','寻找更好的灯丝，也完善供电系统。']];
  window.renderInventors = (view='edison',dysonHtml='') => {
    if(view==='dyson')return dysonHtml.replace('<section class="native dyson-page">','<section class="native dyson-page">'+tabs(view));
    if(view==='rocket')return `<section class="native history-page rocket-page"><p class="kicker">意志力 · 马斯克与 SpaceX 团队</p>${tabs(view)}<h1>我们看见“烟花”，<br>工程师带回问题。</h1><div class="rocket-video" id="rocket-video"><img src="assets/story/spacex-trials.jpg" alt="SpaceX 官方发布的火箭回收失败影像"><button class="rocket-play" data-rocket-play><span>▶</span>播放 SpaceX 官方集锦</button></div><aside class="rocket-copy"><p class="rocket-attribution">特朗普 · 2026.10.08</p><blockquote>“当代爱迪生”</blockquote><p>真正值得学的，<br>是把试验、复盘、修改<br>持续做下去。</p><a href="https://www.youtube.com/watch?v=bvim4rsNHkQ" target="_blank" rel="noopener">打开官方原片 ↗</a></aside><p class="rocket-caption">How Not to Land an Orbital Rocket Booster · SpaceX · 2017</p><p class="history-bottom">失败本身不会让人进步，带着反馈再做一次才会。</p><span class="page-label">12</span></section>`;
    return `<section class="native history-page edison-page"><p class="kicker">意志力 · 爱迪生与他的实验团队</p>${tabs(view)}<h1>灯泡的背后，<br>是一版又一版。</h1><figure class="edison-object"><img src="assets/story/edison-lamp.jpg" alt="爱迪生早期灯泡的复制品，美国国家公园管理局图片"><figcaption>早期灯泡复制品 · NPS</figcaption></figure><div class="edison-work"><p class="history-eyebrow">怎样让灯，亮得更久？</p><div class="experiment-readout"><span id="experiment-label">${experiments[0][0]}</span><h2 id="experiment-result">${experiments[0][1]}</h2><svg viewBox="0 0 120 150" class="experiment-bulb" aria-label="灯泡示意图"><circle class="bulb-halo" cx="60" cy="55" r="51"/><path d="M36 101V91C8 72 15 21 60 20c45 1 52 52 24 71v10M37 106h46M39 117h42M46 128h28" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M49 97V68l-9-13 20 8 20-8-9 13v29" fill="none" stroke="currentColor" stroke-width="3"/></svg></div><nav class="experiment-steps" aria-label="灯泡试验的三个阶段">${experiments.map((s,i)=>`<button data-experiment="${i}" class="${i===0?'selected':''}" aria-pressed="${i===0}"><b>0${i+1}</b>${['发现问题','换一种试法','继续完善'][i]}</button>`).join('')}</nav><p class="edison-question">孩子卡住时，可以先问：<br><strong>“这一次，你发现哪里需要改？”</strong></p></div><p class="history-bottom">AI 可以帮助更快试错，孩子仍需要亲自调整。</p><span class="page-label">12</span></section>`;
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
  window.renderFamilyStory=(view='rose',roseHtml='')=>view==='rose'?roseHtml.replace('<section class="native rose-page">','<section class="native rose-page">'+familyTabs(view)):`<section class="native history-page family-slow"><p class="kicker">亲缘感 · 龙应台《孩子你慢慢来》</p>${familyTabs(view)}<h1>一个蝴蝶结，<br>值得等多久？</h1><figure class="family-bouquet">${bouquet}<figcaption>〈蝴蝶结〉 · 故事情境示意</figcaption></figure><div class="family-slow-copy"><p class="history-eyebrow">孩子还在试，我们已经急了。</p><h2 id="slow-title">${slowMoments[0][0]}</h2><p id="slow-detail">${slowMoments[0][1].replace(/\n/g,'<br>')}</p><nav class="slow-steps" aria-label="蝴蝶结的故事">${['孩子在试','大人愿意等','带回家'].map((x,i)=>`<button data-slow-step="${i}" class="${i===0?'selected':''}" aria-pressed="${i===0}"><span>0${i+1}</span>${x}</button>`).join('')}</nav><p class="slow-takeaway">AI 可以很快给出结果。<br>关系，长在愿意陪孩子经历的时间里。</p></div><p class="history-bottom">孩子需要的，有时是一个愿意等他的真人。</p><span class="page-label">23</span></section>`;
  window.mountFamilyStory=(root,renderView)=>{
    root.querySelectorAll('[data-family]').forEach(b=>b.onclick=()=>renderView(b.dataset.family));
    root.querySelectorAll('[data-slow-step]').forEach(b=>b.onclick=()=>{
      const s=slowMoments[Number(b.dataset.slowStep)];root.querySelector('#slow-title').textContent=s[0];root.querySelector('#slow-detail').innerHTML=s[1].replace(/\n/g,'<br>');root.querySelectorAll('[data-slow-step]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
    });
  };
})();

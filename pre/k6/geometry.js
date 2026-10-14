/* Page 7: understand the question, inspect the model, then return to the real exchange. */
(() => {
  const originalRender=window.renderStory, originalMount=window.mountStory;
  const nav=active=>`<nav class="geometry-tabs" aria-label="雨乔课堂故事">${[['question','原题图解'],['check','再想一步'],['dialogue','课堂讨论']].map(([id,label])=>`<button data-geometry-view="${id}" class="${active===id?'selected':''}" aria-pressed="${active===id}">${label}</button>`).join('')}</nav>`;
  const sun=(x,y)=>`<g transform="translate(${x} ${y})" fill="none" stroke="#eab15a" stroke-width="2.5"><circle r="20" fill="#fff3cf"/>${[0,45,90,135,180,225,270,315].map(a=>`<path transform="rotate(${a})" d="M0-27V-33"/>`).join('')}</g>`;
  const diagram=time=>{
    const morning=time==='morning',evening=time==='evening';
    const bright=morning?'#e9ad4d':evening?'#5797d5':'#d7b269';
    const beams=morning?[[625,230,415,230],[625,275,440,275],[625,320,466,320]]:evening?[[65,230,275,230],[65,275,249,275],[65,320,223,320]]:[];
    return `<svg class="house-diagram" viewBox="0 0 690 455" role="img" aria-label="${morning?'早晨：右侧太阳，光线斜着进入窗A':evening?'傍晚：左侧太阳，光线斜着进入相邻的窗B':'正午：太阳位于房屋上方，不是第三个方向同时照射'}"><defs><marker id="ray-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="${bright}" stroke-width="1.3"/></marker></defs><path d="M345 103L500 371H190Z" fill="#f3f6f9" stroke="#b7c6d6" stroke-width="3" stroke-linejoin="round"/><path d="${morning?'M345 103L500 371':evening?'M190 371L345 103':'M190 371H500'}" stroke="${bright}" stroke-width="5" fill="none"/><path d="M412 219L435 259" stroke="white" stroke-width="10"/><path d="M255 259L278 219" stroke="white" stroke-width="10"/><path d="M322 371H368" stroke="white" stroke-width="10"/><path d="M412 219L435 259M255 259L278 219M322 371H368" stroke="#91aac2" stroke-width="3" fill="none"/><text x="452" y="213" font-size="20" fill="#64788e">窗 A</text><text x="190" y="213" font-size="20" fill="#64788e">窗 B</text><text x="345" y="405" text-anchor="middle" font-size="19" fill="#8492a2">窗 C · 与水平光线平行</text>${beams.map(([x1,y1,x2,y2])=>`<path d="M${x1} ${y1}H${x2}" fill="none" stroke="${bright}" stroke-width="2.6" marker-end="url(#ray-arrow)"/>`).join('')}${sun(morning?625:evening?65:345,morning||evening?157:282)}${time==='noon'?'<circle cx="345" cy="282" r="55" fill="none" stroke="#e4c68a" stroke-width="1.5" stroke-dasharray="5 6"/><text x="345" y="348" text-anchor="middle" fill="#977840" font-size="18">太阳在房屋上方</text>':'<text x="345" y="307" text-anchor="middle" fill="#617b96" font-size="18">房屋俯视图</text>'}<text x="345" y="40" text-anchor="middle" font-size="19" fill="#60758b">雨乔画出的候选：等边三角形</text></svg>`;
  };
  const counterexample=()=>`<svg viewBox="0 0 370 224" role="img" aria-label="正方形反例：北窗与西窗有外遮板；早晨东北来光照进东窗，傍晚西南来光照进南窗。"><rect x="136" y="57" width="116" height="116" rx="2" fill="#f7f8fa" stroke="#9cb0c5" stroke-width="2.5"/><path d="M173 57H215M136 94V136" stroke="#425974" stroke-width="8"/><path d="M173 173H215M252 94V136" stroke="white" stroke-width="9"/><path d="M173 173H215M252 94V136" stroke="#7ca6d0" stroke-width="3"/>${sun(307,29)}${sun(79,193)}<path d="M299 64L254 109M306 75L254 127" stroke="#d8a14b" stroke-width="2.4"/><path d="M145 216L186 175M159 216L200 175" stroke="#6297c8" stroke-width="2.4" stroke-dasharray="5 4"/><text x="193" y="35" text-anchor="middle" font-size="14" fill="#526b84">北窗有遮板</text><text x="119" y="104" text-anchor="end" font-size="14" fill="#526b84">西窗</text><text x="119" y="123" text-anchor="end" font-size="14" fill="#526b84">有遮板</text><text x="269" y="123" font-size="15" fill="#ae792e">东窗</text><text x="194" y="199" text-anchor="middle" font-size="15" fill="#417eb6">南窗</text><text x="322" y="77" font-size="14" fill="#ae792e">早</text><text x="43" y="173" font-size="14" fill="#417eb6">晚</text></svg>`;
  const footer='<p class="credit">图解和几何核查为本次补充分析；原题、原帧、推导及课堂记录可按 N 查看。不是原课堂已完成的证明。</p><span class="page-label">07</span>';
  function render(d,view='question',time='morning'){
    if(view==='dialogue')return originalRender(d).replace('<p class="kicker">',nav('dialogue')+'<p class="kicker">');
    if(view==='check')return `<section class="native geometry-page geometry-check"><p class="kicker">雨乔的挑战 · 也检查自己的假设</p>${nav('check')}<h1>他的思路能成立，原题还要补条件。</h1><div class="geometry-proof"><p class="geometry-panel-label">补齐理想模型后</p><h2>可以推出等边三角形。</h2><p class="geometry-assumptions">凸多边形 · 竖直平墙 · 无遮挡的理想窗户<br>早晚平行光的水平投影相反 · 各边等长</p><ol><li><b>只留两面入光</b><span>其余墙面都必须与水平光线平行。</span></li><li><b>最多四面墙</b><span>凸多边形同向平行边最多两条。</span></li><li><b>四面等长会是菱形</b><span>早晚入光面相对，不相邻。剩下三边等长。</span></li></ol></div><div class="geometry-counter"><p class="geometry-panel-label">原题没有排除遮挡</p><h2>正方形，也能成为反例。</h2>${counterexample()}<p>北窗、西窗加上外遮板，<br>早晚就只照进<strong>东窗、南窗</strong>，它们也相邻。</p></div><div class="geometry-bottom"><strong>出题挑战 AI，也让题目接受检查。</strong><button data-geometry-view="dialogue">回到当时的课堂 →</button></div>${footer}</section>`;
    return `<section class="native geometry-page geometry-question"><p class="kicker">2025 年课堂 · 从“出一道题挑战 AI”开始</p>${nav('question')}<h1>早晚照进相邻的窗，房子是什么形状？</h1><div class="geometry-drawing"><div id="house-scene">${diagram(time)}</div><div class="sun-times" aria-label="切换太阳位置">${[['morning','早晨'],['noon','正午'],['evening','傍晚']].map(([id,label])=>`<button data-sun-time="${id}" class="${id===time?'selected':''}" aria-pressed="${id===time}">${label}</button>`).join('')}</div></div><aside class="geometry-conditions"><div><b>01</b><p>每面墙一样长，<br>每面墙都有一扇窗。</p></div><div><b>02</b><p>早晨只照进一扇窗；<br>傍晚照进<strong>相邻的另一扇</strong>。</p></div><div><b>03</b><p>中午，太阳位于房屋上方。<small>图按太阳在竖直平面内运行来解释。</small></p></div><p class="geometry-key">关键：<strong>斜着照，也能进窗。</strong><br>不用正对着墙面。</p><button class="text-button" data-story-zoom="${d.visual}">题目与手绘图 ↗</button></aside><div class="geometry-bottom"><p>这是一个能成立的方案。<strong>原题是否足以保证唯一？</strong></p><button data-geometry-view="check">这个答案是唯一的吗？ →</button></div>${footer}</section>`;
  }
  window.renderStory=d=>d.id==='case-yuqiao'?render(d):originalRender(d);
  window.mountStory=(d,openZoom)=>{
    originalMount(d,openZoom);
    if(d.id!=='case-yuqiao')return;
    const root=document.querySelector('#stage');
    root.querySelectorAll('[data-geometry-view]').forEach(b=>b.onclick=()=>{
      window.stopStory();const view=b.dataset.geometryView;
      root.innerHTML=render(d,view);window.prepareAudience(root,d);window.mountStory(d,openZoom);
      root.querySelector(`[data-geometry-view="${view}"]`)?.focus({preventScroll:true});
      document.querySelector('#status').textContent=`第7页，${view==='question'?'雨乔原题图解':view==='check'?'几何条件核查':'真实课堂讨论'}`;
    });
    root.querySelectorAll('[data-sun-time]').forEach(b=>b.onclick=()=>{
      root.querySelector('#house-scene').innerHTML=diagram(b.dataset.sunTime);
      root.querySelectorAll('[data-sun-time]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
    });
  };
})();

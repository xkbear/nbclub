/* Projection copy and speaker annotations are separate views of the same evidence. */
(() => {
  const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const patchMarkup=d=>(d.audiencePatches||[]).map(p=>`<span class="audience-patch" style="left:${(p.left-3)/12.8}%;top:${(p.top-2)/7.2}%;width:${(p.width+6)/12.8}%;height:${(p.height+4)/7.2}%;background:${E(d.background||'#fff')};--patch-size:${p.fontSize/12.8}cqw;color:${E(p.color)};font-weight:${p.bold?650:400}" data-audience-patch>${E(p.text).replace(/\n/g,'<br>')}</span>`).join('');
  window.audienceComposition=(d,zoom=false)=>`<div class="audience-composition${zoom?' audience-zoom':''}"><img ${zoom?'id="zoom-image"':''} src="${E(d.image)}" alt="${E(d.title)}" loading="${zoom?'eager':'lazy'}">${patchMarkup(d)}</div>`;
  window.prepareAudience=(root,d)=>{
    const remember=()=>{};
    root.querySelectorAll('.credit').forEach(el=>{remember(el.textContent.trim());el.remove();});
    root.querySelectorAll('.dialogue-exchange time').forEach(el=>{remember(el.textContent.trim());el.remove();});
    const edit=(selector,text)=>{const el=root.querySelector(selector);if(el){remember(el.textContent.trim());if(text===null)el.remove();else el.textContent=text;}};
    edit('.comic-aside .small-note','故事插画');
    edit('.dyson-photo-note','Dyson · 现代产品测试');
    edit('.journey-caption','雨乔与制作人 Chris Craker');
    edit('.journey-path .text-button','他的学习经历 ↗');
    edit('.website-status','开放候补登记');
    edit('.website-copy>a','访问 Cobble ↗');
    edit('.debate-question span','省下时间，还是保留控制？');
    edit('.process-waiting>span:last-child',null);
    edit('.clip-copy .media-fallback',null);
    edit('.video-meta>span','Richard Feynman · BBC Horizon, 1981');
    edit('.video-meta>a','完整访谈 ↗');
    edit('.video-status','');
    if(d.audiencePatches?.length&&root.querySelector('.slide-image')){
      const layer=document.createElement('div');layer.className='audience-patch-layer';layer.innerHTML=patchMarkup(d);root.append(layer);
    }
  };
})();

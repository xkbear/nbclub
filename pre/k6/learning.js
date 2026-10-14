/* An evidence-labelled teaching interlude within page 4; no extra slide numbers. */
(() => {
  const tabs = active => `<nav class="feynman-tabs" aria-label="费曼章节画面">${[['video','原访谈'],['darwin','达尔文'],['method','学习法'],['pyramid','金字塔']].map(([id,label]) => `<button data-feynman-view="${id}" class="${active===id?'selected':''}" aria-pressed="${active===id}">${label}</button>`).join('')}</nav>`;
  window.feynmanTabs = tabs;
  const icon = (paths) => `<svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const icons = [
    icon('<path d="M24 21h52v46H54L39 80V67H24Z"/><path d="M43 39a8 8 0 0 1 16 0c0 7-9 7-9 13"/><path d="M50 59v1"/>'),
    icon('<circle cx="32" cy="33" r="12"/><path d="M11 78V64a21 21 0 0 1 42 0v14M62 23h25v28H72l-9 8v-8h-6M66 32h13M66 41h9"/>'),
    icon('<path d="M19 17h43v64H19ZM28 29h24M28 39h18"/><circle cx="62" cy="59" r="17"/><path d="m74 72 15 15M56 58l5 5 9-10"/>'),
    icon('<path d="M23 39a30 30 0 0 1 52-11M75 15v15H60M77 62a30 30 0 0 1-52 10M25 85V70h15M38 50l9 10 17-21"/>')
  ];
  const steps = [
    ['选一个小问题','从“我想弄懂什么”开始。','比如：阳光照进窗户，\n一定要垂直吗？'],
    ['合上答案，自己讲','用自己的话解释，画出来也行。','不照着 AI 念；\n讲给没学过的人听。'],
    ['卡住的地方，去查','哪里说不清，就回到依据。','找原始资料，或动手验证；\nAI 可以帮助找线索。'],
    ['换个例子，再讲一次','看看理解能否用到新情境。','允许别人追问，\n也允许自己改判断。']
  ];
  const pyramid = () => {
    const rows = [['听讲','5%'],['阅读','10%'],['视听','20%'],['演示','30%'],['小组讨论','50%'],['实践练习','75%'],['教别人 / 立即应用','90%']];
    const fills = ['#e5e8f0','#dae4f0','#cbdff2','#b7d8f3','#9bc8f4','#77b2ee','#4a91df'];
    return `<svg class="learning-pyramid" viewBox="0 0 690 445" role="img" aria-labelledby="pyramid-title pyramid-desc"><title id="pyramid-title">学习金字塔的常见流传版本，百分比并非可靠实证结果</title><desc id="pyramid-desc">听讲5%，阅读10%，视听20%，演示30%，小组讨论50%，实践练习75%，教别人或立即应用90%。这些数字仅用于辨析流传说法，不是两周后保持率，也不是费曼研究结果。</desc>${rows.map(([name,pct],i)=>{
      const top=i*62, bottom=top+56, half=95+i*29, prev=half-26;
      const points=i===0?`286,0 ${286+half},${bottom} ${286-half},${bottom}`:`${286-prev},${top} ${286+prev},${top} ${286+half},${bottom} ${286-half},${bottom}`;
      const baseline=i===0?44:top+36;
      return `<g><polygon points="${points}" fill="${fills[i]}"/><text x="286" y="${baseline}" text-anchor="middle" fill="${i===6?'#fff':'#213a57'}" font-size="${i===6?22:23}" font-weight="550">${name}</text><path d="M${286+half+12} ${top+31}H574" stroke="#d2dae4" stroke-width="1.4"/><text x="670" y="${top+43}" text-anchor="end" fill="${i>=4?'#1767bb':'#52667d'}" font-size="41" font-weight="650">${pct}</text></g>`;
    }).join('')}</svg>`;
  };
  window.renderFeynmanLearning = view => view==='darwin' ? window.renderDarwin() : view==='method' ? `<section class="native learning-page method-page"><p class="kicker">好奇心 · 从知道答案，到自己讲明白</p>${tabs('method')}<h1>把答案合上，讲给另一个人听。</h1><p class="learning-subtitle">费曼学习法：讲给别人听，发现自己还没弄懂的地方。</p><div class="learning-steps">${steps.map((s,i)=>`<article class="learning-step"><div class="learning-step-top"><span>0${i+1}</span>${icons[i]}</div><h2>${s[0]}</h2><p>${s[1]}</p><small>${s[2].replace(/\n/g,'<br>')}</small>${i<3?'<span class="learning-arrow" aria-hidden="true">→</span>':''}</article>`).join('')}</div><div class="learning-takeaway"><span>家长可以这样接一句</span><strong>“你先讲，我来听；讲不清的地方，我们再一起找。”</strong></div><button class="learning-next" data-feynman-view="pyramid">那张 5%—90% 的金字塔，可信吗？ <span>→</span></button><p class="credit">四步为本次家庭练习建议，非费曼逐字原话；研究支持特定条件下的提取练习，不保证固定记忆百分比。</p><span class="page-label">04</span></section>` : `<section class="native learning-page pyramid-page"><p class="kicker">好奇心 · 连一张漂亮的图，也值得追问</p>${tabs('pyramid')}<h1>教别人，就能记住 90%？</h1><p class="pyramid-label">常见流传版本 <span>· 百分比缺乏可靠研究依据</span></p><div class="pyramid-chart">${pyramid()}</div><aside class="pyramid-reading"><p class="pyramid-eyebrow">数字越精确，越要问依据。</p><h2>谁测的？<br>怎么测？<br>对谁成立？</h2><p class="pyramid-finding">2007 年的文献核查，<br>没有找到支持这套金字塔的<br>具体、可信研究。</p><p class="pyramid-meaning">可以练习“讲给别人听”；<br>不要许诺“必定记住 90%”。</p></aside><div class="pyramid-bottom"><p>这些数字是<strong>待辨析的说法</strong>，不是“两周后保持率”，也不能归于费曼。</p><button data-feynman-view="method">回到可以练习的方法 →</button></div><p class="credit">依据：Lalley & Miller（2007）文献核查；Koh 等（2018）特定实验。按 N 查看来源与证据边界。</p><span class="page-label">04</span></section>`;
})();

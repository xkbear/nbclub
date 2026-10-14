/* Three-step teaching reveal within page 4; no extra slide numbers. */
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
    return `<svg class="learning-pyramid" viewBox="0 0 690 445" role="img" aria-labelledby="pyramid-title pyramid-desc"><title id="pyramid-title">学习金字塔：一组流传很广的百分比</title><desc id="pyramid-desc">听讲5%，阅读10%，视听20%，演示30%，小组讨论50%，实践练习75%，教别人或立即应用90%。这是常见流传版本。继续本页的三步讲述，检查这套说法。</desc>${rows.map(([name,pct],i)=>{
      const top=i*62, bottom=top+56, half=95+i*29, prev=half-26;
      const points=i===0?`286,0 ${286+half},${bottom} ${286-half},${bottom}`:`${286-prev},${top} ${286+prev},${top} ${286+half},${bottom} ${286-half},${bottom}`;
      const baseline=i===0?44:top+36;
      return `<g class="pyramid-row ${i>=4?'active-method':'input-method'}"><polygon points="${points}" fill="${fills[i]}"/><text x="286" y="${baseline}" text-anchor="middle" fill="${i===6?'#fff':'#213a57'}" font-size="${i===6?22:23}" font-weight="550">${name}</text><path d="M${286+half+12} ${top+31}H574" stroke="#d2dae4" stroke-width="1.4"/><text class="pyramid-percent" x="670" y="${top+43}" text-anchor="end" fill="${i>=4?'#1767bb':'#52667d'}" font-size="41" font-weight="650">${pct}</text><path class="pyramid-strike" d="M578 ${top+25}H677"/></g>`;
    }).join('')}</svg>`;
  };
  const pyramidScenes = [
    {
      title:'同样的内容，能记住多少？', label:'学习金字塔 · 常见流传版本',
      eyebrow:'听一遍，还是讲一遍？', heading:'你觉得，<br>哪一层最有效？',
      finding:'从听讲到教别人，<br>数字一层层升高。', meaning:'这和你的学习经验，<br>是不是很像？',
      bottom:'先看这张图，你会得到什么结论？', next:'看看它给我们的启发 →'
    },
    {
      title:'学习，不能只停在“听懂”。', label:'从接收信息，走向主动参与',
      eyebrow:'我们很容易认同这个方向', heading:'多讨论。<br>多实践。<br>多输出。',
      finding:'自己讲一遍、做一遍，<br>看看哪些地方还没有弄懂。', meaning:'',
      bottom:'从“我听懂了”，走到“我能做、我能讲清”。', next:'但先等一下 →'
    },
    {
      title:'看起来很科学，却没有可靠依据。', label:'这套精确的百分比，站不住。',
      eyebrow:'谁测的？怎么测？对谁成立？', heading:'给直觉套上数字，<br>就是科学了吗？',
      finding:'2007 年的文献核查，<br>未找到支持这套比例的可信研究。', meaning:'把它当成科学定律，<br>就是“伪科学”包装。',
      bottom:'借鉴主动学习：多讨论、多实践、多输出。<br>不用这些百分比做学习规划或效果承诺。', next:''
    }
  ];
  window.renderLearningPyramid = (step=0) => {
    const s=pyramidScenes[step];
    return `<section class="native learning-page pyramid-page" data-pyramid-step="${step}"><p class="kicker">好奇心 · 学习金字塔</p>${tabs('pyramid')}<h1>${s.title}</h1><p class="pyramid-label">${s.label}</p><div class="pyramid-chart">${pyramid()}</div><aside class="pyramid-reading" aria-live="polite"><p class="pyramid-eyebrow">${s.eyebrow}</p><h2>${s.heading}</h2><p class="pyramid-finding">${s.finding}</p>${s.meaning?`<p class="pyramid-meaning">${s.meaning}</p>`:''}</aside><div class="pyramid-bottom"><p>${s.bottom}</p><div class="pyramid-controls">${step>0?`<button class="pyramid-back" data-pyramid-to="${step-1}" aria-label="返回金字塔上一步">←</button>`:''}${s.next?`<button class="primary pyramid-next" data-pyramid-to="${step+1}">${s.next}</button>`:'<button class="primary pyramid-next" data-feynman-view="method">回到可以练习的方法 →</button>'}</div></div><span class="page-label">04 · ${step+1}/3</span></section>`;
  };
  window.renderFeynmanLearning = view => view==='darwin' ? window.renderDarwin() : view==='method' ? `<section class="native learning-page method-page"><p class="kicker">好奇心 · 从知道答案，到自己讲明白</p>${tabs('method')}<h1>把答案合上，讲给另一个人听。</h1><p class="learning-subtitle">费曼学习法：讲给别人听，发现自己还没弄懂的地方。</p><div class="learning-steps">${steps.map((s,i)=>`<article class="learning-step"><div class="learning-step-top"><span>0${i+1}</span>${icons[i]}</div><h2>${s[0]}</h2><p>${s[1]}</p><small>${s[2].replace(/\n/g,'<br>')}</small>${i<3?'<span class="learning-arrow" aria-hidden="true">→</span>':''}</article>`).join('')}</div><div class="learning-takeaway"><span>家长可以这样接一句</span><strong>“你先讲，我来听；讲不清的地方，我们再一起找。”</strong></div><button class="learning-next" data-feynman-view="pyramid">再看一张熟悉的学习金字塔 <span>→</span></button><p class="credit">四步为本次家庭练习建议，非费曼逐字原话；研究支持特定条件下的提取练习，不保证固定记忆百分比。</p><span class="page-label">04</span></section>` : window.renderLearningPyramid();
})();

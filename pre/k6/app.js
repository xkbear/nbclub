/* No build step or framework; slides and evidence remain available offline. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const escape = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const E = escape;
  const paragraphs = s => E(s).replace(/\n/g,'<br>');
  const stage=$('#stage'), total=SLIDES.length;
  let current=0, noteTab='script', player=null, playerTimer=null, toastTimer=null, controlTimer=null, touchX=null, touchY=null, renderId=0;
  const questions=new Set([3,7,11,16,19]);
  const expanded = {4:'assets/story/feynman-poster.jpg',8:'assets/story/zouji-comic.png',12:'assets/story/edison-lamp.jpg',17:'assets/story/monet.jpg',20:'assets/story/rose-triptych.png',29:'assets/story/silvia-fridge-interior.jpg'};
  const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3 21 12 7 21Z"/></svg>';
  const pageNo=n=>`<span class="page-label">${String(current+1).padStart(2,'0')}</span>`;
  function cover(){return `<section class="native cover poster-cover"><img class="cover-child" src="assets/story/poster-child-cutout.png" alt="海报中的水彩孩子仰望，蓝色像素向外延伸"><div class="cover-wash"></div><p class="kicker">NewBee AI Club · 先蜂 AI 俱乐部 <span>K6 · 线下分享</span></p><div class="cover-copy"><h1><span>AI 时代的</span><br>新德智体美劳</h1><p class="cover-question">当 AI 越来越会回答，<br>孩子是否还愿意主动提问、<br>独立思考、理解他人？</p><p class="cover-dimensions">好奇心 · 同理心 · 意志力 · 审美力 · 亲缘感</p><p class="cover-promise">AI 可以加速得到结果，<br>成长仍需要孩子亲自经历过程。</p></div><footer class="cover-footer"><span><b>周品（品哥）</b> · 主讲</span><span>2026.10.15 · 60 分钟分享＋20 分钟交流</span></footer></section>`;}
  function feynman(view='video'){if(view!=='video')return window.renderFeynmanLearning(view);return `<section class="native feynman-page">${window.feynmanTabs('video')}<p class="kicker">好奇心 · 费曼父亲与鸟的名字</p><div class="feynman-copy"><h1>知道名字，<br>然后呢？</h1><p class="lead">父亲教给他的，<br>是继续观察一只鸟。</p><p class="takeaway">拿到解释后，<br>我们还能观察什么？</p></div><div class="video-wrap"><div class="video-box" id="video-box"><img src="${E(FEYNMAN_VIDEO.poster)}" alt="Richard Feynman 本人访谈画面"><button class="play-video" id="play-video" aria-label="播放费曼本人访谈节选，约48秒">${playIcon}<span>播放原访谈节选 · 48 秒</span></button></div><div class="video-meta"><span>费曼本人影像 · Heureka Labs 转载节选</span><a href="${E(FEYNMAN_VIDEO.original)}" target="_blank" rel="noopener">导演上传的完整原片 ↗</a></div><div class="video-message"><strong>同伴问鸟名</strong><span>→</span><strong>父亲换了问题</strong><span>→</span><strong>回到观察</strong></div><p class="video-status" id="video-status">点击后加载在线视频；无法播放时可打开原片 06:22–07:20。</p></div><button class="feynman-continue" data-feynman-view="darwin">继续：带着问题出发 →</button><p class="credit">BBC Horizon · The Pleasure of Finding Things Out（1981）· 本页中文为转述，非逐字字幕。</p>${pageNo(4)}</section>`;}
  const comicCaptions=['三次发问：谁更美？','妾与客，也给了赞美','见到徐公，再照镜比较','夜里，他开始想：为什么？'];
  const positions=['0% 0%','100% 0%','0% 100%','100% 100%'];
  function comic(view='reflection'){if(view==='court')return window.renderZoujiCourt(current+1);return `<section class="native comic-page"><p class="kicker">同理心 · 《战国策·齐策一》</p><h1 class="page-title">三个回答一样，三个理由不同。</h1><div class="comic-grid">${comicCaptions.map((c,i)=>`<button class="comic-panel" data-comic="${i}" aria-label="放大第${i+1}格：${c}"><span class="panel-art" style="background-position:${positions[i]}" role="img" aria-label="${c}"></span><span class="panel-caption"><b>0${i+1}</b><span>${c}</span></span></button>`).join('')}</div><aside class="comic-aside"><h2>听见赞美，<br>也要看见处境。</h2><div class="motives"><div class="motive"><strong>妻</strong><span>偏爱自己</span></div><div class="motive"><strong>妾</strong><span>有所畏惧</span></div><div class="motive"><strong>客</strong><span>有求于他</span></div></div><p class="lesson">当 AI 顺着我说时，<br>我还愿意听见<br>真实人的不同意见吗？</p><p class="small-note">点任一格可放大。第 2 格合绘两次问答。<br>古典叙事与 AI 的关联，是讲者的类比。</p></aside><button class="primary comic-continue" data-comic-view="court">接着看：齐王怎样纳谏 →</button><p class="credit">据《邹忌讽齐王纳谏》改编 · AI 生成漫画 · 正文顺序：见徐公 → 照镜比较 → 暮寝而思。</p>${pageNo(8)}</section>`;}
  function monet(){return `<section class="native monet-page" data-step="0"><p class="kicker">审美 · 先有自己的观察</p><div class="monet-copy"><h1 id="monet-heading">先看画，<br>猜猜是谁？</h1><p id="monet-info">你先注意到什么？<br>你觉得，这是谁的作品？</p><button class="primary" id="monet-reveal-button">揭晓作品</button><p class="monet-reveal" id="monet-reveal" hidden>勒鲁瓦讥讽这幅海景：<br>连初步的壁纸图样，<br>都比它完整。<small>路易·勒鲁瓦 · 1874 年评论</small></p></div><img class="monet-art" data-zoom src="assets/story/monet.jpg" alt="港口日出油画"><p class="monet-art-label" hidden>Claude Monet · Impression, soleil levant · 1872 · Musée Marmottan Monet</p>${pageNo(17)}</section>`;}
  function bindMonet(){const b=$('#monet-reveal-button');if(!b)return;b.onclick=()=>{const page=$('.monet-page'),step=(Number(page.dataset.step)+1)%3;page.dataset.step=step;$('#monet-heading').innerHTML=step?'莫奈。':'先看画，<br>猜猜是谁？';$('#monet-info').innerHTML=step?'《印象·日出》<br>1872 年 · 油画':'你先注意到什么？<br>你觉得，这是谁的作品？';$('.monet-art-label').hidden=step===0;$('#monet-reveal').hidden=step!==2;$('.monet-art').alt=step?'莫奈《印象·日出》，1872年':'港口日出油画';b.textContent=['揭晓作品','再看当年的评论','重新看画'][step];};}
  function rose(){return `<section class="native rose-page"><p class="kicker">亲缘感 · 《小王子》与他的玫瑰</p><h1 class="page-title">关系，藏在那些看似低效的小事里。</h1><img class="rose-strip" data-zoom src="assets/story/rose-triptych.png" alt="AI 改编三联图：为玫瑰浇水、挡风、耐心陪伴"><div class="rose-labels"><div><strong>为她浇水</strong><span>花时间照料</span></div><div><strong>为她挡风</strong><span>回应需要</span></div><div><strong>听她说话</strong><span>共同经历</span></div></div><p class="credit">《小王子》第 21 章，中文转述 · AI 生成文学改编，非原书插图 · 关系的价值不以效率衡量。</p>${pageNo(20)}</section>`;}
  function ending(){return `<section class="native ending"><p class="closing-thesis">文明不是一直做对。<br>是在出错之后，仍能理解、修正、合作。</p><h1>越用 AI，越爱人类。</h1><p class="end-question">你最想保留的，<br>是哪一种成长经历？</p><p class="end-detail">现场交流 20 分钟 · 从一个真实的家庭场景开始</p><p class="credit">周品（品哥） · 先蜂 AI 俱乐部</p>${pageNo(40)}</section>`;}
  function stopPlayer(){clearTimeout(playerTimer);playerTimer=null;if(player){try{player.destroy();}catch(_){}player=null;}window.__videoState=null;}
  function render(){
    stopPlayer();window.stopStory?.();renderId++;
    const d=SLIDES[current],n=d.sourcePage;
    let html;
    if(d.kind)html=window.renderStory(d);
    else if(n===1)html=cover();
    else if(questions.has(n))html=`<section class="native question"><h1>${paragraphs(d.text)}</h1></section>`;
    else if(n===4)html=feynman();
    else if(n===8)html=comic();
    else if(n===12)html=window.renderInventors();
    else if(n===17)html=monet();
    else if(n===20)html=window.renderFamilyStory('rose',rose(),current+1);
    else if(n===40)html=ending();
    else html=`<img class="slide-image zoomable" src="${d.image}" alt="${E(d.title)}；点击放大原页" data-zoom><div class="sr-only">${paragraphs(d.text)}</div><span class="raster-number" style="background:${E(d.background||'#fff')}">${String(current+1).padStart(2,'0')}</span>`;
    stage.innerHTML=html;
    window.prepareAudience(stage,d);
    stage.setAttribute('aria-label',`第 ${current+1} 页，共 ${total} 页：${d.title}`);
    $('#counter').textContent=String(current+1).padStart(2,'0');$('#progress').style.width=`${(current+1)/total*100}%`;
    $('#prev').disabled=current===0;$('#next').disabled=current===total-1;
    $('#status').textContent=`第${current+1}页，${d.title}`;
    document.title=`${String(current+1).padStart(2,'0')} · ${d.title}｜青少年的新德智体美劳`;
    if($('#notes').open)renderNote();
    $$('[data-comic]').forEach(b=>b.onclick=()=>openZoom(Number(b.dataset.comic)));
    $$('[data-zoom]').forEach(b=>b.onclick=()=>openZoom());
    bindFeynman();
    if(n===8)bindComic();
    bindMonet();
    if(n===12)bindInventors();
    if(n===20)bindFamilyStory();
    [current-1,current+1].filter(x=>x>=0&&x<total).forEach(x=>{const im=new Image();im.src=SLIDES[x].image;});
    if(d.kind)window.mountStory(d,openZoom);
    window.mountTheme?.(d,openZoom);
    resize();showControls();
  }
  function bindFeynman(){
    $$('[data-pyramid-to]').forEach(b=>b.onclick=()=>{
      const step=Number(b.dataset.pyramidTo);
      stage.innerHTML=window.renderLearningPyramid(step);
      window.prepareAudience(stage,SLIDES[current]);
      bindFeynman();
      const title=stage.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});
      $('#status').textContent=`第4页，学习金字塔，第${step+1}步，共3步`;
      resize();showControls();
    });
    if($('#play-video'))$('#play-video').onclick=startVideo;
    $$('[data-feynman-view]').forEach(b=>b.onclick=()=>{
      const view=b.dataset.feynmanView;
      stopPlayer();renderId++;
      stage.innerHTML=feynman(view);
      window.prepareAudience(stage,SLIDES[current]);
      bindFeynman();
      window.mountDarwin(stage);
      const selected=stage.querySelector(`[data-feynman-view="${view}"]`);
      selected?.focus({preventScroll:true});
      $('#status').textContent=`第4页，${view==='video'?'费曼本人访谈':view==='method'?'费曼学习法练习':view==='darwin'?'达尔文带着好奇出发':'学习金字塔流传说法辨析'}`;
      resize();showControls();
    });
  }
  function bindComic(){
    $$('[data-comic-view]').forEach(b=>b.onclick=()=>{
      const view=b.dataset.comicView;
      stage.innerHTML=comic(view);
      window.prepareAudience(stage,SLIDES[current]);
      bindComic();
      $$('[data-comic]').forEach(x=>x.onclick=()=>openZoom(Number(x.dataset.comic)));
      window.mountZoujiCourt(stage);
      const title=stage.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});
      $('#status').textContent=view==='court'?'第9页续：邹忌进谏，齐王纳谏':'第9页：邹忌的三个回答';
      resize();showControls();
    });
  }
  function bindInventors(){
    const renderView=view=>{stopPlayer();stage.innerHTML=window.renderInventors(view);window.prepareAudience(stage,SLIDES[current]);bindInventors();resize();showControls();};
    window.mountInventors(stage,renderView);
    $$('[data-zoom]').forEach(b=>b.onclick=()=>openZoom());
  }
  function bindFamilyStory(){window.mountFamilyStory(stage,view=>{stage.innerHTML=window.renderFamilyStory(view,rose(),current+1);window.prepareAudience(stage,SLIDES[current]);bindFamilyStory();$$('[data-zoom]').forEach(b=>b.onclick=()=>openZoom());resize();showControls();});}
  function go(n){n=Math.max(1,Math.min(total,Math.trunc(Number(n)||1)));if(n===current+1&&stage.children.length)return;if(location.hash!==`#${n}`)location.hash=String(n);else {current=n-1;render();}}
  function resize(){const r=$('#viewport').getBoundingClientRect();const scale=Math.min(r.width/1280,r.height/720);$('#frame').style.width=`${1280*scale}px`;$('#frame').style.height=`${720*scale}px`;stage.style.transform=`scale(${scale})`;}
  window.addEventListener('resize',resize);
  window.addEventListener('hashchange',()=>{current=Math.max(0,Math.min(total-1,(parseInt(location.hash.slice(1))||1)-1));render();});
  function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
  function showControls(){document.body.classList.add('controls-visible');clearTimeout(controlTimer);controlTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2600);}
  window.addEventListener('mousemove',showControls,{passive:true});
  function showDialog(id){$$("dialog[open]").forEach(d=>d.close());$(id).showModal();}
  function openOverview(){
    $('#overview-grid').innerHTML=SLIDES.map((d,i)=>`<button class="overview-item ${i===current?'active':''}" data-page="${i+1}">${["risk","practice","framework","taste"].includes(d.kind)?`<div class="overview-concept"><b>${E(d.kicker)}</b><small>${E(d.title)}</small></div>`:(d.audiencePatches?.length?window.audienceComposition(d):`<img src="${d.sourcePage===1?'assets/story/poster-child-cutout.png':expanded[d.sourcePage]||d.image}" loading="lazy" alt="第 ${i+1} 页预览">`)}<p><b>${String(i+1).padStart(2,'0')}</b><span>${E(d.title)}</span></p></button>`).join('');
    $$('[data-page]').forEach(b=>b.onclick=()=>{$('#overview').close();go(b.dataset.page);});
    showDialog('#overview');setTimeout(()=>$('#overview .active')?.scrollIntoView({block:'center'}),30);
  }
  function renderNote(){
    const d=SLIDES[current];$('#note-title').textContent=`${d.page}. ${d.title}`;
    $('#note-time').textContent='K6 · 周品（品哥） · 2026.10.15';
    const urls=d.urls||[];
    $('#note-content').innerHTML=urls.length?urls.map(u=>`<a class="source-link" href="${E(u)}" target="_blank" rel="noopener">${E(u)} ↗</a>`).join(''):'<p>本页为讲者的家庭案例、课堂记录或活动建议。</p>';
  }
  function openNotes(){renderNote();showDialog('#notes');}
  function openZoom(panel,src){
    const r=$('#zoom-scroll');r.innerHTML='<img id="zoom-image" alt="本页原图">';
    const im=$('#zoom-image');$('#zoom-toggle').hidden=false;$('#zoom-toggle').textContent='放大 2 倍';
    if(Number.isInteger(panel)){
      im.hidden=true;$('#zoom-toggle').hidden=true;
      const f=document.createElement('div');f.id='focus-panel';f.style.backgroundImage="url('assets/story/zouji-comic.png')";f.style.backgroundPosition=positions[panel];f.setAttribute('role','img');f.setAttribute('aria-label',comicCaptions[panel]);r.appendChild(f);
    }else if(!src&&SLIDES[current].audiencePatches?.length){r.innerHTML=window.audienceComposition(SLIDES[current],true);r.querySelector('.audience-composition').onclick=toggleZoom;}else{im.src=src||SLIDES[current].zoom||expanded[SLIDES[current].sourcePage]||SLIDES[current].image;im.alt=SLIDES[current].title;im.onclick=toggleZoom;}
    showDialog('#zoom');r.scrollTop=0;r.scrollLeft=0;
  }
  function toggleZoom(){const composition=$('#zoom-scroll .audience-composition');if(composition){composition.classList.toggle('large');$('#zoom-toggle').textContent=composition.classList.contains('large')?'适应屏幕':'放大 2 倍';return;}const im=$('#zoom-image');if(!im||im.hidden)return;im.classList.toggle('large');$('#zoom-toggle').textContent=im.classList.contains('large')?'适应屏幕':'放大 2 倍';}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('此浏览器不支持网页全屏；可使用浏览器的全屏菜单。');}catch(_){toast('请使用浏览器菜单进入全屏。');}}
  document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('fullscreen',Boolean(document.fullscreenElement));resize();showControls();});
  function videoFallback(msg){const box=$('#video-box');if(!box||$('#video-error'))return;const el=document.createElement('div');el.id='video-error';el.className='video-error';el.innerHTML=`${E(msg)} <a href="${E(FEYNMAN_VIDEO.url)}" target="_blank" rel="noopener">在 YouTube 打开 ↗</a> · <a href="${E(FEYNMAN_VIDEO.original)}" target="_blank" rel="noopener">完整原片 ↗</a>`;box.appendChild(el);}
  function loadYouTube(){return new Promise((resolve,reject)=>{if(window.YT?.Player)return resolve();let done=false;const prior=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{prior?.();done=true;resolve();};if(!document.querySelector('script[data-youtube]')){const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.dataset.youtube='true';s.onerror=()=>reject(Error('network'));document.head.appendChild(s);}setTimeout(()=>{if(!done&&!window.YT?.Player)reject(Error('timeout'));},12000);});}
  async function startVideo(){
    const token=renderId;const b=$('#play-video');if(!b)return;b.disabled=true;b.querySelector('span').textContent='正在加载原访谈…';$('#video-status').textContent='原视频约 48 秒；翻页会自动停止。';
    if(location.protocol==='file:'){b.disabled=false;b.querySelector('span').textContent='播放原访谈节选 · 48 秒';videoFallback('双击文件可看整套图文；嵌入视频请通过“启动讲座.command”打开。');return;}
    try{
      await loadYouTube();if(token!==renderId)return;
      $('#video-box').innerHTML='<div id="youtube-player"></div>';
      player=new YT.Player('youtube-player',{width:759,height:427,videoId:FEYNMAN_VIDEO.id,playerVars:{autoplay:1,rel:0,playsinline:1,origin:location.origin,enablejsapi:1,cc_load_policy:1},events:{onReady:e=>{e.target.getIframe().setAttribute('referrerpolicy','strict-origin-when-cross-origin');e.target.playVideo();},onStateChange:e=>{window.__videoState=e.data;if(e.data===1){clearTimeout(playerTimer);$('#video-error')?.remove();if($('#video-status'))$('#video-status').textContent='正在播放费曼本人访谈节选 · 如需停顿，可点击播放器暂停。';}if(e.data===0&&$('#video-status'))$('#video-status').textContent='片段结束。现在问：知道名字以后，我们还能观察什么？';},onError:e=>videoFallback(`播放器未能加载（${e.data}）。`)} });
      window.__lecturePlayer=()=>player;
      playerTimer=setTimeout(()=>{if(window.__videoState!==1&&window.__videoState!==2&&window.__videoState!==0)videoFallback('视频加载较慢；也可直接打开来源。');},15000);
    }catch(_){if(token===renderId)videoFallback('当前网络未能加载视频。');}
  }
  $('#prev').onclick=()=>go(current);$('#next').onclick=()=>go(current+2);$('#overview-button').onclick=openOverview;$('#notes-button').onclick=openNotes;$('#zoom-button').onclick=()=>openZoom();$('#zoom-toggle').onclick=toggleZoom;$('#fullscreen-button').onclick=fullscreen;$('#help-button').onclick=()=>showDialog('#help');
  $$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  $$('[data-goto]').forEach(b=>b.onclick=()=>{$('#overview').close();go(b.dataset.goto);});
  $$('[data-tab]').forEach(b=>b.onclick=()=>{noteTab=b.dataset.tab;renderNote();});
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#page-button').onclick=()=>{$('#jump-input').value=current+1;showDialog('#jump');$('#jump-input').select();};
  $('#jump').addEventListener('close',()=>{if($('#jump').returnValue==='go')go($('#jump-input').value);});
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$('dialog[open]'))return;
    if((e.key===' '||e.key==='Enter')&&e.target.closest('button,a'))return;
    const k=e.key.toLowerCase();if(['arrowright','arrowdown','pagedown',' '].includes(k)){e.preventDefault();go(current+2);}else if(['arrowleft','arrowup','pageup'].includes(k)){e.preventDefault();go(current);}else if(k==='home'){e.preventDefault();go(1);}else if(k==='end'){e.preventDefault();go(total);}else if(k==='f'){e.preventDefault();fullscreen();}else if(k==='n')openNotes();else if(k==='o')openOverview();else if(k==='z')openZoom();else if(k==='?')showDialog('#help');
  });
  stage.addEventListener('touchstart',e=>{if(e.target.closest('button,a,iframe'))return;touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
  stage.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;touchX=null;touchY=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?2:0));},{passive:true});
  current=Math.max(0,Math.min(total-1,(parseInt(location.hash.slice(1))||1)-1));render();
  window.lecture={go:go,get page(){return current+1;},get count(){return total;}};
})();

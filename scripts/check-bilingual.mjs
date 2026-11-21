import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const pairs = [
  ['events.html', 'events-en.html'],
  ['support.html', 'support-en.html'],
  ['event-2026-11-15-nxt.html', 'event-2026-11-15-nxt-en.html']
];
const pages = [...read('sitemap.xml').matchAll(/<loc>https:\/\/new-bee.club\/([^<]*)<\/loc>/g)].map(m=>m[1] || 'index.html');
for (const file of pages) {
  const html = read(file), english = html.includes('<html lang="en-NZ"');
  const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
  for (const type of ['desktop-nav', 'mobile-nav']) {
    const nav = header.match(new RegExp('<nav class="' + type + '"[^>]*>[\\s\\S]*?<\\/nav>'))[0];
    assert(nav.includes('href="' + (english ? 'support-en.html' : 'support.html') + '"'), file + ': ' + type);
  }
}
for (const [zh, en] of pairs) {
  for (const [file, other, lang] of [[zh,en,'zh-CN'],[en,zh,'en-NZ']]) {
    const html = read(file);
    assert(html.includes('<html lang="' + lang + '"'));
    assert(html.includes('rel="canonical" href="https://new-bee.club/' + file + '"'));
    assert(html.includes('class="language-link" href="' + other + '"'));
    for(const [target,locale] of [[zh,'zh-CN'],[en,'en-NZ']]) assert(html.includes('hreflang="' + locale + '" href="https://new-bee.club/' + target + '"'));
  }
}
const archive = read('events-en.html');
for(const [type,count] of Object.entries({keynote:7,workshop:4,member:1,support:1,founding:1})) {
  assert.equal([...archive.matchAll(new RegExp('data-category="' + type + '"','g'))].length,count,type);
}
for(const card of archive.match(/<article class="story-card" data-category="keynote">[\s\S]*?<\/article>/g)) assert(card.includes('class="story-speaker">Speaker:'));
assert(archive.includes('Read recap (Chinese)'));
assert(archive.includes('event-2026-11-15-nxt-en.html'));
const detail=read('event-2026-11-15-nxt-en.html');
for(const phrase of ['55:52','NZ$300','NZ$325','NZ$700','has not verified individual payments','original English audio','Chinese PDF','replay.m3u8']) assert(detail.includes(phrase),phrase);
for(const project of ['Battle Towear','BLOCKED','Kata AI','SocialMaxing','Squadup','TakTic','Infinite Library','Backpack']) assert(detail.includes(project));
assert(!detail.includes('hls/index.m3u8'));
const schemas=[...detail.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
assert.equal(schemas.find(s=>s['@type']==='Event').organizer.name,'NXT');
assert.equal(schemas.find(s=>s['@type']==='VideoObject').duration,'PT55M52S');
assert(read('assets/support-video.js').includes('Retry playback'));
assert(read('assets/site.js').includes("' events'"));
for (const lang of ['en-NZ', 'zh-CN']) {
  const handlers = {}, button = {addEventListener:()=>{}}, status = {};
  const video = {addEventListener:(type, callback)=>{handlers[type]=callback}};
  const document = {
    documentElement:{lang},
    querySelector:selector=>selector.startsWith('video') ? video : button,
    getElementById:()=>status
  };
  runInNewContext(read('assets/support-video.js'), {document, window:{addEventListener:()=>{}}});
  handlers.error();
  assert.equal(button.textContent, lang==='en-NZ' ? '↻ Retry playback' : '↻ 重试播放');
  assert(status.textContent.includes(lang==='en-NZ' ? 'Playback failed' : '播放遇到问题'));
}
console.log('BILINGUAL CHECK PASSED: 30 public navigation routes, reciprocal language pairs, 14 summaries, speaker credits, complete S01 content and safe shared video.');

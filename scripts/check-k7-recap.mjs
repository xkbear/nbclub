import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const page = 'event-2026-11-14-k7.html';
const html = read(page), home = read('index.html'), events = read('events.html');
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(x => JSON.parse(x[1]));
const event = blocks.find(x => x['@type'] === 'Event');
assert.equal(event.performer.name, '黄一孟（Dash）');
assert.equal(event.startDate, '2026-11-14T10:30:00+13:00');
assert.equal(event.location.name, 'NEXT Park, Albany');
assert(!event.offers && !event.eventStatus, 'Completed recap must not retain a ticket offer or scheduled status');
const video = html.match(/<video\b[^>]+>/)[0];
for (const attr of ['width="544"', 'height="960"', 'controls', 'controlslist="nodownload"', 'playsinline', 'preload="none"']) assert(video.includes(attr), attr);
assert(!video.includes('autoplay'));
assert(!/<a[^>]+href="[^"]+\.mp4/.test(html), 'No direct download link');
for (const name of ['recap-video.mp4','recap-video-poster.webp','recap-cover.webp','recap-poster.webp']) assert(existsSync(new URL('assets/events/2026-11-14-k7/'+name,root)));
assert(home.includes('class="hero-photo is-recap is-k7-recap"'));
assert(home.includes('<strong>7</strong><span>场已举办主题讲座'));
assert(home.includes('场会员活动日 · E0'));
assert(home.split('id="activity-rail"')[1].match(/<article[\s\S]*?<\/article>/)[0].includes(page));
assert(events.includes(`id="latest-recap" href="${page}"`));
assert(events.includes('13 场活动回顾'));
for (const name of ['index.html','events.html',page,'feed.xml','llms.txt','llms-full.txt']) {
  assert(!/tempkey=|sharer_shareinfo=|data-k7-register|k7-preview\.(css|js)|K7 活动预告|Upcoming K7|Upcoming event — K7/.test(read(name)), name+' has stale preview or temporary credentials');
}
if (process.argv.includes('--publish')) {
  const original = blocks.find(x => x['@type'] === 'BlogPosting').isBasedOn;
  assert(original?.startsWith('https://mp.weixin.qq.com/s'), 'Publishing requires the verified formal WeChat original');
  assert(!/tempkey=|正式链接待补/.test(html), 'Do not publish a temporary source or pending placeholder');
  assert(html.includes('阅读公众号原文'));
}
console.log('K7 recap checks passed'+(process.argv.includes('--publish')?' (publish gate included)':' (local; original-link publish gate is separate)')+'.');

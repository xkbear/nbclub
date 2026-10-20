#!/usr/bin/env node
// Evidence and navigation checks, not a prediction of rankings or AI citations.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = "https://new-bee.club/";
const read = file => readFileSync(join(root, file), "utf8");
const hubFile = "ai-enthusiasts-new-zealand.html";
const hub = read(hubFile);
const pages = [
  hubFile, "chinese-ai-club-nz.html", "xin-xilan-ai-club.html",
  "auckland-ai-club.html", "new-zealand-ai-club.html",
  "event-2026-06-26-k2.html", "event-2026-07-17-w2.html",
  "event-2026-10-15-k6.html"
];
const schemas = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap(([, raw]) => { const data = JSON.parse(raw); return data["@graph"] ?? [data]; });
const text = html => html.replace(/<[^>]*>/g, "").replace(/\s+/g, "");
const itemList = schemas(hub).find(item => item["@type"] === "ItemList");
assert.equal(itemList.numberOfItems, 5);
assert.equal(itemList.itemListElement.length, 5);
for (const item of itemList.itemListElement) {
  const fragment = new URL(item.url).hash.slice(1);
  const article = hub.match(new RegExp(`<article\\b[^>]*id="${fragment}"[^>]*>([\\s\\S]*?)<\\/article>`))?.[1];
  assert.ok(article, `visible route: ${fragment}`);
  assert.ok(text(article).includes(text(item.name)), `schema route name matches visible text: ${fragment}`);
}
const archive = [...new Set([...read("events.html").matchAll(/href="(event-[^"#]+\.html)"/g)].map(([, file]) => file))];
assert.equal(archive.length, 11, "Review the dated inventory when a new activity is published");
for (const file of archive) assert.ok(hub.includes(`href="${file}`), `learning guide must link its cited activity: ${file}`);

for (const file of pages) {
  const source = read(file);
  const main = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
  assert.ok(main);
  for (const [, href] of main.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const url = new URL(href, base + file);
    if (url.origin !== new URL(base).origin || !url.hash) continue;
    // Presentation slide routes are JavaScript hashes, not element IDs.
    if (url.pathname.startsWith("/pre/")) continue;
    const target = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    assert.ok(read(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: broken link ${href}`);
  }
  assert.ok(!/<(?:section|article|p|h[1-6])\b[^>]*(?:\shidden(?:\s|=|>)|aria-hidden="true"|style="[^"]*(?:display\s*:\s*none|visibility\s*:\s*hidden))/i.test(main), `${file}: no hidden text`);
  const schema = schemas(source).find(item => ["BlogPosting", "WebPage", "CollectionPage"].includes(item["@type"]));
  assert.equal(schema.dateModified, "2026-10-20", `${file}: actual content update date`);
}
const w2 = read("event-2026-07-17-w2.html");
for (const term of ["真实资料", "项目规则", "AI 选题", "人工判断", "内容包", "人工发布", "选题确认", "事实核验", "风险检查", "最终发布"]) {
  assert.ok(w2.includes(term), `W2 method: ${term}`);
}
assert.ok(w2.includes("不是讲者逐字引语"));
assert.ok(read("event-2026-06-26-k2.html").includes("不代表某个系统已经通过验证"));
assert.ok(read("event-2026-10-15-k6.html").includes('href="pre/k6/#49"'));
assert.ok(read("event-2026-10-15-k6.html").includes("不是对学习效果的研究结论"));
for (const file of ["pre/index.html", "pre/k6/index.html", "pre/k6-qa/index.html", "k6-talk.html"]) {
  assert.match(read(file), /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/, `${file}: retain presentation index boundary`);
}
for (const file of ["llms.txt", "llms-full.txt", "feed.xml"]) {
  const source = read(file);
  for (const fragment of ["six-step-workflow", "workflow-checklist", "family-week"]) {
    assert.ok(source.includes("#" + fragment), `${file}: source link for ${fragment}`);
  }
}
console.log("KNOWLEDGE CHECK PASSED: 5 visible learning paths, 11 source activities, 3 attributed methods, valid section links, matching discovery summaries, and unchanged presentation noindex boundaries.");

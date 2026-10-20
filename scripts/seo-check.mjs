#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCommunityGuides } from "./check-community-guides.mjs";
import { checkSiteNavigation } from "./check-site-navigation.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = "https://new-bee.club/";
const pages = [
  "index.html",
  "whitepaper.html",
  "apply.html",
  "anthem.html",
  "events.html",
  "new-zealand-ai-club.html",
  "xin-xilan-ai-club.html",
  "auckland-ai-club.html",
  "chinese-ai-club-nz.html",
  "ai-enthusiasts-new-zealand.html",
  "new-zealand-ai-association.html",
  "event-2026-05-04.html",
  "event-2026-05-15-k1.html",
  "event-2026-06-05-w1.html",
  "event-2026-06-26-k2.html",
  "event-2026-07-17-w2.html",
  "event-2026-08-01-k3.html",
  "event-2026-08-15-k4.html",
  "event-2026-08-27-member-day.html",
  "event-2026-09-04-w3.html",
  "event-2026-09-25-k5.html",
  "event-2026-10-15-k6.html"
];

const failures = [];
const warnings = [];
const schemaTypes = new Set();
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

function warn(file, message) {
  warnings.push(`${file}: ${message}`);
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])([\\s\\S]*?)\\1`, "i"));
  return match?.[2] ?? "";
}

function hasMeta(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return tags.some((tag) => attr(tag, key) === value && attr(tag, "content"));
}

function collectSchemaTypes(value) {
  if (Array.isArray(value)) {
    for (const item of value) collectSchemaTypes(item);
    return;
  }
  if (!value || typeof value !== "object") return;
  const type = value["@type"];
  if (Array.isArray(type)) type.forEach((item) => schemaTypes.add(item));
  else if (typeof type === "string") schemaTypes.add(type);
  for (const nested of Object.values(value)) collectSchemaTypes(nested);
}

for (const file of pages) {
  const path = join(root, file);
  if (!existsSync(path)) {
    fail(file, "page is missing");
    continue;
  }

  const html = readFileSync(path, "utf8");
  const body = html.split(/<body\b[^>]*>/i)[1] ?? "";
  if ((body.match(/<main\b/gi) ?? []).length !== 1) fail(file, "expected one main landmark");
  if ((body.match(/<h1\b/gi) ?? []).length !== 1) fail(file, "expected one page h1");
  if (!body.includes('class="site-header"') || !body.includes('class="site-footer"')) fail(file, "missing shared navigation or footer");
  if (/class=["'][^"']*\b(?:footer-topics|intent-nav)\b/.test(body)) fail(file, "keyword-only navigation must not return");
  const footer = body.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0] ?? "";
  for (const target of ["events.html", "whitepaper.html", "anthem.html", "apply.html", "mailto:office@new-bee.club", "feed.xml"]) {
    if (!footer.includes('href="' + target + '"')) fail(file, `missing useful footer link (${target})`);
  }
  for (const shared of ["assets/theme.js", "assets/site.css", "assets/site.js", "assets/analytics.js"]) {
    if (!html.includes(shared)) fail(file, `missing shared design resource (${shared})`);
  }
  if (!body.includes('data-theme-toggle')) fail(file, "missing appearance control");
  if (html.indexOf('assets/theme.js') > html.indexOf('assets/site.css')) fail(file, "theme bootstrap must precede styles to avoid an appearance flash");
  const ids = [...body.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) fail(file, "duplicate element IDs");
  const expectedCanonical = file === "index.html" ? base : `${base}${file}`;
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1].trim() ?? "";
  const descriptionTag = (html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i) ?? [""])[0];
  const canonicalTag = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) ?? [""])[0];

  if (!title) fail(file, "missing title");
  if (!attr(descriptionTag, "content")) fail(file, "missing meta description");
  if (attr(canonicalTag, "href") !== expectedCanonical) fail(file, `canonical should be ${expectedCanonical}`);
  if (!hasMeta(html, "name", "robots")) fail(file, "missing robots meta");
  const robotsTags = (html.match(/<meta\b[^>]*>/gi) ?? []).filter(tag => ["robots", "googlebot"].includes(attr(tag, "name").toLowerCase()));
  if (robotsTags.some(tag => /\b(?:noindex|none)\b/i.test(attr(tag, "content")))) fail(file, "indexable page must not contain noindex");
  if (/<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)) fail(file, "indexable page must not immediately redirect");
  if (!hasMeta(html, "http-equiv", "Content-Security-Policy")) fail(file, "missing document-level CSP");
  if (!hasMeta(html, "name", "referrer")) fail(file, "missing referrer policy meta");

  const analyticsTags = (html.match(/<script\b[^>]*>/gi) ?? []).filter(tag => /^assets\/analytics\.js(?:\?|$)/.test(attr(tag, "src")));
  if (analyticsTags.length !== 1 || !/\bdefer\b/.test(analyticsTags[0])) fail(file, "expected exactly one deferred shared analytics loader");
  const cspTag = (html.match(/<meta\b[^>]*>/gi) ?? []).find(tag => attr(tag, "http-equiv") === "Content-Security-Policy") ?? "";
  const csp = attr(cspTag, "content");
  if (!/script-src\s[^;]*https:\/\/static\.cloudflareinsights\.com(?:\s|;|$)/.test(csp) || !/connect-src\s[^;]*https:\/\/cloudflareinsights\.com(?:\s|;|$)/.test(csp)) fail(file, "CSP must allow the Cloudflare beacon and reporting endpoint");
  if (/data-cf-beacon\s*=/.test(html)) fail(file, "keep the beacon in the production-only shared loader, not inline HTML");

  for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
    if (!hasMeta(html, "property", property)) fail(file, `missing ${property}`);
  }
  for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    if (!hasMeta(html, "name", name)) fail(file, `missing ${name}`);
  }

  if (!/<link\b[^>]*rel=["']alternate["'][^>]*type=["']application\/rss\+xml["'][^>]*href=["']https:\/\/new-bee\.club\/feed\.xml["'][^>]*>/i.test(html) &&
      !/<link\b[^>]*type=["']application\/rss\+xml["'][^>]*rel=["']alternate["'][^>]*href=["']https:\/\/new-bee\.club\/feed\.xml["'][^>]*>/i.test(html)) {
    fail(file, "missing RSS discovery link");
  }

  const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!jsonLdBlocks.length) fail(file, "missing JSON-LD");
  const schemas = [];
  for (const [, source] of jsonLdBlocks) {
    try {
      const schema = JSON.parse(source);
      schemas.push(...(schema["@graph"] ?? (Array.isArray(schema) ? schema : [schema])));
      collectSchemaTypes(schema);
    } catch (error) {
      fail(file, `invalid JSON-LD (${error.message})`);
    }
  }

  if (/^event-.*-k\d+\.html$/.test(file)) {
    const event = schemas.find(schema => [schema["@type"]].flat().includes("Event"));
    const speakers = [event?.performer ?? []].flat();
    const header = body.match(/<header\b[^>]*class="article-head"[^>]*>[\s\S]*?<\/header>/i)?.[0] ?? "";
    const visibleHeader = header.replace(/<[^>]+>/g, " ").replace(/\s+/g, "");
    if (!speakers.length) fail(file, "keynote must include an Event performer");
    for (const speaker of speakers) {
      const name = speaker?.name?.trim() ?? "";
      if (!name || speaker["@type"] !== "Person") {
        fail(file, "keynote performer must be a named Person");
        continue;
      }
      // Bilingual schema names may use English in addition to the visible Chinese name.
      const visibleName = (name.match(/[\u3400-\u9fff]+/g) ?? [name]).join("").replace(/\s+/g, "");
      if (!visibleHeader.includes(visibleName)) fail(file, `speaker must appear in the article header (${name})`);
    }
  }

  if (["index.html", "events.html"].includes(file)) {
    const cards = body.match(/<article\b[^>]*data-category="keynote"[^>]*>[\s\S]*?<\/article>/gi) ?? [];
    for (const card of cards) {
      const target = attr(card.match(/<a\b[^>]*>/i)?.[0] ?? "", "href");
      const speakerLine = card.match(/<p\b[^>]*class="story-speaker"[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "";
      if (!/主讲[：:]\s*[^<\s]/.test(speakerLine)) fail(file, `keynote card must include a visible speaker line (${target})`);
    }
  }

  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const tag of images) {
    const src = attr(tag, "src");
    if (!attr(tag, "alt")) fail(file, `image is missing alt text (${src || "unknown source"})`);
    if (!(Number(attr(tag, "width")) > 0) || !(Number(attr(tag, "height")) > 0)) fail(file, `image is missing intrinsic dimensions (${src})`);
    for (const candidate of attr(tag, "srcset").split(",").filter(Boolean)) {
      const imagePath = candidate.trim().split(/\s+/)[0];
      if (!/^(https?:|data:)/.test(imagePath) && !existsSync(join(root, imagePath))) fail(file, `responsive image does not exist (${imagePath})`);
    }
    if (!/^(lazy|eager)$/.test(attr(tag, "loading"))) fail(file, `image is missing explicit loading mode (${src})`);
    if (attr(tag, "decoding") !== "async") warn(file, `image does not use async decoding (${src})`);
    if (!src || /^(https?:|data:)/.test(src)) continue;
    if (extname(src).toLowerCase() !== ".webp") fail(file, `non-modern inline image source (${src})`);
    if (!existsSync(join(root, src))) fail(file, `image file does not exist (${src})`);
  }

  const hrefTags = html.match(/<(?:a|link)\b[^>]*>/gi) ?? [];
  for (const tag of hrefTags) {
    const href = attr(tag, "href");
    if (!href || href.startsWith("#") || /^(?:mailto:|tel:|javascript:)/i.test(href)) continue;
    let url;
    try {
      url = new URL(href, expectedCanonical);
    } catch {
      fail(file, `invalid link (${href})`);
      continue;
    }
    if (url.origin !== new URL(base).origin) continue;
    let localPath = decodeURIComponent(url.pathname).replace(/^\//, "");
    if (!localPath || localPath.endsWith("/")) localPath += "index.html";
    if (!existsSync(join(root, localPath))) fail(file, `internal link target does not exist (${href})`);
  }

  if (!sitemap.includes(`<loc>${expectedCanonical}</loc>`)) fail(file, "canonical URL is absent from sitemap.xml");
}

for (const requiredType of ["Organization", "Service", "FAQPage", "BlogPosting"]) {
  if (!schemaTypes.has(requiredType)) fail("schema", `site does not expose ${requiredType}`);
}

const anthem = readFileSync(join(root, "anthem.html"), "utf8");
const anthemVideo = anthem.match(/<video\b[^>]*>/i)?.[0] ?? "";
if (anthem.includes("anthem-lyrics") || !anthem.includes('src="assets/anthem.mp4"')) fail("anthem.html", "anthem must use the complete original video, not the cropped lyrics version");
if (attr(anthemVideo, "width") !== "1080" || attr(anthemVideo, "height") !== "1080" || attr(anthemVideo, "poster") !== "assets/anthem-poster.webp") fail("anthem.html", "complete anthem must retain its square dimensions and full-frame poster");
if (!sitemap.includes("<video:content_loc>https://new-bee.club/assets/anthem.mp4</video:content_loc>")) fail("sitemap.xml", "video sitemap must reference the complete anthem");
const k5 = readFileSync(join(root, "event-2026-09-25-k5.html"), "utf8");
const k5Video = k5.match(/<video\b[^>]*>/i)?.[0] ?? "";
if (attr(k5Video, "width") !== "544" || attr(k5Video, "height") !== "960") fail("event-2026-09-25-k5.html", "K5 video must retain its original portrait dimensions");
if (!/\bcontrols\b/.test(k5Video) || !/\bplaysinline\b/.test(k5Video) || /\bautoplay\b/.test(k5Video) || attr(k5Video, "preload") !== "none") fail("event-2026-09-25-k5.html", "K5 video must use click-to-play controls without automatic downloading or playback");
if (!/\bnodownload\b/.test(attr(k5Video, "controlslist")) || attr(k5Video, "oncontextmenu") !== "return false") fail("event-2026-09-25-k5.html", "K5 video must hide browser download and video context-menu entries");
if (/<a\b[^>]*href=["'][^"']*\.mp4(?:[?#][^"']*)?["'][^>]*>/i.test(k5)) fail("event-2026-09-25-k5.html", "K5 must not expose a direct video download or new-window link");
for (const media of ["assets/events/2026-09-25-k5/recap-video.mp4", "assets/events/2026-09-25-k5/recap-video-poster.webp"]) {
  if (!existsSync(join(root, media)) || !k5.includes(media) || !sitemap.includes(media)) fail("event-2026-09-25-k5.html", `K5 video media or discovery entry is missing (${media})`);
}
const k6 = readFileSync(join(root, "event-2026-10-15-k6.html"), "utf8");
const homepage = readFileSync(join(root, "index.html"), "utf8");
// The recap rail contains held events only; upcoming dates must never take over
// the main recap until the corresponding event has actually been archived.
const recapRail = homepage.split('id="activity-rail"')[1]?.split('</section>')[0] ?? "";
const recaps = [...recapRail.matchAll(/<article\b[^>]*class="story-card"[^>]*>[\s\S]*?<\/article>/g)]
  .map(([html]) => ({
    html,
    href: html.match(/<a\b[^>]*href="([^"]+)"/)?.[1],
    date: html.match(/<time\b[^>]*datetime="(\d{4}-\d{2}-\d{2})"/)?.[1]
  }))
  .filter(({ href, date }) => href && date)
  .sort((a, b) => b.date.localeCompare(a.date));
const latestRecap = recaps[0];
const mainRecap = homepage.match(/<figure\b[^>]*class="hero-photo\b[^"\n]*"[^>]*>[\s\S]*?<\/figure>/)?.[0] ?? "";
if (!latestRecap || !mainRecap) {
  fail("index.html", "latest completed event and main recap must both exist");
} else {
  const mainLinks = [...mainRecap.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1]);
  if (mainLinks.length < 2 || mainLinks.some((href) => href !== latestRecap.href) || !mainRecap.includes(`datetime="${latestRecap.date}"`)) {
    fail("index.html", `main recap must feature the latest completed event (${latestRecap.href}), not an older recap or upcoming event`);
  }
  const mainImage = mainRecap.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
  if (!mainImage || !latestRecap.html.includes(mainImage)) fail("index.html", "main recap must use the latest completed event's cover");
  const speaker = latestRecap.html.match(/<p class="story-speaker">([\s\S]*?)<\/p>/)?.[1];
  if (speaker && speaker.split(/<br\s*\/?\s*>| · /).some((part) => !mainRecap.includes(part))) fail("index.html", "main recap must retain the latest keynote's speaker roles");
}
const k6Signup = "https://events.new-bee.club/events/2026-10-15-k6-ai-childhood/register";
const k6Source = "https://mp.weixin.qq.com/s/coZNN4iDENlnRnyYuW9faw";
for (const file of ["index.html", "events.html", "event-2026-10-15-k6.html", "feed.xml", "llms.txt", "llms-full.txt"]) {
  const html = readFileSync(join(root, file), "utf8");
  if (html.includes(k6Signup) || /upcoming-event is-k6|下一场 · K6|K6 活动预告|Upcoming event: K6|Status: upcoming/.test(html)) fail(file, "completed K6 must not retain an invitation or registration link");
}
if (!k6.includes('2026-10-15T10:30:00+13:00') || !k6.includes(k6Source) || !k6.includes("阅读公众号原文") || !k6.includes("Ally 张彤")) fail("K6", "recap must retain the event date, verified source and dialogue guests");
if (k6.includes('"offers"') || k6.includes("preview.mp4") || k6.includes("EventScheduled")) fail("K6", "recap must not present preview media or ticket offers as current");
if ((k6.match(/class="recap-video-card"/g) ?? []).length !== 4 || !k6.includes("未转存视频文件")) fail("K6", "four source-only video previews must be clearly labelled");
const k6EventList = readFileSync(join(root, "events.html"), "utf8");
const keynoteCount = (homepage.match(/<article class="story-card" data-category="keynote">/g) ?? []).length;
if (keynoteCount !== 6 || !homepage.includes(`<strong>${keynoteCount}</strong><span>场已举办主题讲座`)) fail("index.html", "completed keynote count must match the archive");
if (!k6EventList.includes('id="latest-recap" href="event-2026-10-15-k6.html"') || !k6EventList.includes("11 场活动回顾")) fail("events.html", "K6 must lead the updated eleven-event archive");
for (const asset of ["recap-cover-640.webp", "recap-cover-1080.webp", ...Array.from({length:13}, (_,i)=>`recap-${String(i+2).padStart(2,"0")}.webp`)]) {
  if (!existsSync(join(root, "assets/events/2026-10-15-k6", asset))) fail("K6", `missing recap media ${asset}`);
}
const queryTargets = new Map([
  ["新西兰AI俱乐部", "xin-xilan-ai-club.html"],
  ["奥克兰AI俱乐部", "auckland-ai-club.html"],
  ["华人AI俱乐部 NZ", "chinese-ai-club-nz.html"],
  ["新西兰 AI聚会", "events.html"],
  ["新西兰AI爱好者", "ai-enthusiasts-new-zealand.html"],
  ["新西兰AI协会", "new-zealand-ai-association.html"]
]);
for (const file of [
  "xin-xilan-ai-club.html",
  "auckland-ai-club.html",
  "chinese-ai-club-nz.html",
  "ai-enthusiasts-new-zealand.html",
  "new-zealand-ai-association.html",
  "new-zealand-ai-club.html",
  "events.html"
]) {
  const html = readFileSync(join(root, file), "utf8");
  const questionHeadings = html.match(/<h[23]\b[^>]*>[^<]*(?:\?|？)[^<]*<\/h[23]>/gi) ?? [];
  if (questionHeadings.length < 3) fail(file, "fewer than three visible question-style FAQ headings");
}

for (const required of ["feed.xml", "llms.txt", "llms-full.txt", "robots.txt", "sitemap.xml", "sitemap.txt"]) {
  if (!existsSync(join(root, required))) fail(required, "file is missing");
}

if (existsSync(join(root, "sitemap.txt"))) {
  const textUrls = readFileSync(join(root, "sitemap.txt"), "utf8").trim().split(/\r?\n/);
  const xmlUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  if (JSON.stringify([...textUrls].sort()) !== JSON.stringify([...xmlUrls].sort())) fail("sitemap.txt", "plain-text sitemap must contain the same canonical URLs as sitemap.xml");
  if (!readFileSync(join(root, "robots.txt"), "utf8").includes(`Sitemap: ${base}sitemap.txt`)) fail("robots.txt", "plain-text sitemap discovery is missing");
}

const feed = readFileSync(join(root, "feed.xml"), "utf8");
if (!/<rss\b/.test(feed) || !/<atom:link\b[^>]*rel="self"/.test(feed)) fail("feed.xml", "RSS or Atom self-discovery markup is invalid");
if ((feed.match(/<item>/g) ?? []).length < 9) fail("feed.xml", "expected at least nine activity items");

const llmsFull = readFileSync(join(root, "llms-full.txt"), "utf8");
for (const target of queryTargets.values()) {
  if (!llmsFull.includes(`${base}${target}`)) fail("llms-full.txt", `missing landing page ${target}`);
}

if (warnings.length) {
  console.log(`WARNINGS (${warnings.length})`);
  warnings.forEach((message) => console.log(`- ${message}`));
}

// Cover every public sitemap page, not just the three original core guides.
// This is a navigation check, not proof of Google discovery or indexing.
checkSiteNavigation(root, fail);
checkCommunityGuides(root, fail);

if (failures.length) {
  console.error(`SEO CHECK FAILED (${failures.length})`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`LOCAL SEO CHECK PASSED: ${pages.length} pages checked, ${schemaTypes.size} schema types, all sitemap pages reachable with return routes and no orphans, RSS and LLM discovery files. Google indexing and rankings require separate Search Console verification.`);

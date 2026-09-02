#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = "https://new-bee.club/";
const pages = [
  "index.html",
  "apply.html",
  "anthem.html",
  "events.html",
  "new-zealand-ai-club.html",
  "xin-xilan-ai-club.html",
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
  "event-2026-09-04-w3.html"
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
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return match?.[1] ?? "";
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
  const expectedCanonical = file === "index.html" ? base : `${base}${file}`;
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1].trim() ?? "";
  const descriptionTag = (html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i) ?? [""])[0];
  const canonicalTag = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) ?? [""])[0];

  if (!title) fail(file, "missing title");
  if (!attr(descriptionTag, "content")) fail(file, "missing meta description");
  if (attr(canonicalTag, "href") !== expectedCanonical) fail(file, `canonical should be ${expectedCanonical}`);
  if (!hasMeta(html, "name", "robots")) fail(file, "missing robots meta");
  if (!hasMeta(html, "http-equiv", "Content-Security-Policy")) fail(file, "missing document-level CSP");
  if (!hasMeta(html, "name", "referrer")) fail(file, "missing referrer policy meta");

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
  for (const [, source] of jsonLdBlocks) {
    try {
      collectSchemaTypes(JSON.parse(source));
    } catch (error) {
      fail(file, `invalid JSON-LD (${error.message})`);
    }
  }

  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const tag of images) {
    const src = attr(tag, "src");
    if (!attr(tag, "alt")) fail(file, `image is missing alt text (${src || "unknown source"})`);
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

const index = readFileSync(join(root, "index.html"), "utf8");
const queryTargets = new Map([
  ["新西兰AI俱乐部", "xin-xilan-ai-club.html"],
  ["华人AI俱乐部 NZ", "chinese-ai-club-nz.html"],
  ["新西兰 AI聚会", "events.html"],
  ["新西兰AI爱好者", "ai-enthusiasts-new-zealand.html"],
  ["新西兰AI协会", "new-zealand-ai-association.html"]
]);
for (const [query, target] of queryTargets) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<a\\b[^>]*href=["']${target}["'][^>]*>\\s*${escaped}\\s*</a>`, "u");
  if (!pattern.test(index)) fail("index.html", `missing exact-anchor link for “${query}” → ${target}`);
}

for (const file of [
  "xin-xilan-ai-club.html",
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

for (const required of ["feed.xml", "llms.txt", "llms-full.txt", "robots.txt", "sitemap.xml"]) {
  if (!existsSync(join(root, required))) fail(required, "file is missing");
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

if (failures.length) {
  console.error(`SEO CHECK FAILED (${failures.length})`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`SEO CHECK PASSED: ${pages.length} indexable pages, ${schemaTypes.size} schema types, 5 exact query anchors, RSS and LLM discovery files.`);

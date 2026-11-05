#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const entries = [...source.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => {
  const location = match[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
  const modified = match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  assert(location?.startsWith('https://new-bee.club/'), 'Expected an official canonical URL');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(modified), 'Expected a source modification date');
  return `  <url><loc>${location}</loc><lastmod>${modified}</lastmod></url>`;
});

assert(entries.length > 0, 'Source sitemap has no pages');
const output = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  ''
].join('\n');

writeFileSync(new URL('../sitemap-pages.xml', import.meta.url), output);
console.log(`Built sitemap-pages.xml with ${entries.length} canonical pages from sitemap.xml.`);

#!/usr/bin/env node
// Build delivery copies only. Original selected photographs and artwork are never overwritten.
// Usage: node scripts/build-responsive-images.mjs [path-to-installed-sharp]
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { stat } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sources = [
  "assets/events/2026-09-04-w3/home-cover-sunny.webp",
  "assets/events/2026-08-27-member-day/cover.webp",
  "assets/events/2026-08-15-k4/cover.webp",
  "assets/events/2026-08-01-k3/cover-distinct-v3.webp",
  "assets/events/2026-07-17-w2/cover-distinct-v3.webp",
  "assets/events/2026-06-26-k2/cover-distinct-v3.webp",
  "assets/events/2026-06-05-w1/workshop-01.webp",
  "assets/events/2026-05-15-k1/cover.webp",
  "assets/events/2026-05-04/article-000.webp"
];
for (const relative of [...sources, 'logo.webp']) {
  const source = join(root, relative);
  const widths = relative === 'logo.webp' ? [192] : relative.includes('home-cover-sunny') ? [640, 1000, 1672] : [640, 1000];
  for (const width of widths) {
    const target = source.replace('.webp', `-${width}.webp`);
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: relative === 'logo.webp' ? 92 : 86, effort: 6 }).toFile(target);
    console.log(`${relative} → ${width}px: ${Math.round((await stat(target)).size / 1024)} KiB`);
  }
}

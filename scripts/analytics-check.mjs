#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/analytics.js', import.meta.url), 'utf8');

function environment(url, { framed = false, existing = false } = {}) {
  const scripts = existing ? [{ dataset: { cfBeacon: '{}' } }] : [];
  const window = {};
  window.self = window;
  window.top = framed ? {} : window;
  const context = {
    location: new URL(url),
    window,
    document: {
      querySelector(selector) {
        assert.equal(selector, 'script[data-cf-beacon]');
        return scripts.find(script => script.dataset.cfBeacon) ?? null;
      },
      createElement(tag) {
        assert.equal(tag, 'script');
        return { dataset: {} };
      },
      head: { appendChild(script) { scripts.push(script); } }
    }
  };
  return { context, scripts };
}

for (const path of ['/', '/events.html', '/apply.html', '/event-2026-09-25-k5.html?release=test#video']) {
  const { context, scripts } = environment('https://new-bee.club' + path);
  runInNewContext(source, context);
  assert.equal(scripts.length, 1, `one beacon for ${path}`);
  assert.equal(scripts[0].type, 'module');
  assert.equal(scripts[0].src, 'https://static.cloudflareinsights.com/beacon.min.js');
  assert.deepEqual(JSON.parse(scripts[0].dataset.cfBeacon), { token: '959339b768f84be6839b4cdda1a2aefb' });
  runInNewContext(source, context);
  assert.equal(scripts.length, 1, 'repeated loader execution must not double count');
}

for (const url of ['http://localhost:8765/', 'http://127.0.0.1:8765/', 'file:///tmp/index.html', 'https://xkbear.github.io/nbclub/', 'https://preview.new-bee.club/', 'http://new-bee.club/']) {
  const { context, scripts } = environment(url);
  runInNewContext(source, context);
  assert.equal(scripts.length, 0, `do not load analytics on ${url}`);
}

const embedded = environment('https://new-bee.club/index.html', { framed: true });
runInNewContext(source, embedded.context);
assert.equal(embedded.scripts.length, 0, 'embedded preview must not count a visit');
const installed = environment('https://new-bee.club/', { existing: true });
runInNewContext(source, installed.context);
assert.equal(installed.scripts.length, 1, 'leave an existing beacon alone');

console.log('ANALYTICS CHECK PASSED: production-only loading, correct public site identifier, no duplicate beacon, and local/embedded previews excluded.');

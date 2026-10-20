import test from "node:test";
import assert from "node:assert/strict";
import { auditNavigation, pageLinks } from "./check-site-navigation.mjs";

test("normalizes home, absolute URLs, query strings and fragments", () => {
  assert.deepEqual(pageLinks('<a href="/">Home</a><a href="https://new-bee.club/guide.html?v=1&amp;x=2#learn">Guide</a><a href="mailto:office@new-bee.club">Mail</a><a href="https://elsewhere.nz/">Other</a>', "index.html"), [
    {file: "index.html", hash: ""}, {file: "guide.html", hash: "learn"}
  ]);
});

test("metadata, commented links, script strings and self-links cannot rescue an orphan", () => {
  const report = auditNavigation(new Map([
    ["index.html", '<!-- <a href="guide.html">Hidden</a> --><script>"<a href=\\\'guide.html\\\'>"</script><link href="guide.html">'],
    ["guide.html", '<a href="guide.html">Self</a><a href="/">Home</a>']
  ]));
  assert.deepEqual(report.orphans, ["guide.html"]);
  assert.deepEqual(report.unreachable, ["guide.html"]);
});

test("disconnected cycles have incoming links but are still unreachable", () => {
  const report = auditNavigation(new Map([
    ["index.html", ""], ["a.html", '<a href="b.html">B</a>'], ["b.html", '<a href="a.html">A</a>']
  ]));
  assert.deepEqual(report.orphans, []);
  assert.deepEqual(report.unreachable, ["a.html", "b.html"]);
  assert.deepEqual(report.noReturn, ["a.html", "b.html"]);
});

test("records forward and return paths separately", () => {
  const documents = new Map([
    ["index.html", '<a href="events.html">Events</a>'],
    ["events.html", '<a href="guide.html">Guide</a><a href="/">Home</a>'],
    ["guide.html", '<a href="events.html">Events</a>']
  ]);
  const report = auditNavigation(documents);
  assert.deepEqual(report.pages[2].fromHome, ["index.html", "events.html", "guide.html"]);
  assert.deepEqual(report.pages[2].toHome, ["guide.html", "events.html", "index.html"]);
  assert.deepEqual(report.orphans, []);
  assert.deepEqual(report.noReturn, []);
  documents.set("guide.html", "No return links");
  assert.deepEqual(auditNavigation(documents).noReturn, ["guide.html"]);
});

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const base = "https://new-bee.club/";
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2] ?? "";
const clean = html => (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html)
  .replace(/<!--[\s\S]*?-->|<(script|style|template|head)\b[^>]*>[\s\S]*?<\/\1>/gi, "");

export function pageLinks(html, file, origin = base) {
  return [...clean(html).matchAll(/<a\b[^>]*>/gi)].flatMap(([tag]) => {
    const href = attr(tag, "href").replace(/&amp;/g, "&");
    if (!href) return [];
    try {
      const url = new URL(href, new URL(file, origin));
      if (url.origin !== new URL(origin).origin) return [];
      return [{ file: decodeURIComponent(url.pathname.slice(1)) || "index.html", hash: decodeURIComponent(url.hash.slice(1)) }];
    } catch {
      return [];
    }
  });
}

function shortestPath(graph, start, end) {
  const paths = new Map([[start, [start]]]);
  for (const [file, path] of paths) {
    if (file === end) return path;
    for (const next of graph.get(file) ?? []) {
      if (!paths.has(next)) paths.set(next, [...path, next]);
    }
  }
  return null;
}

// Only actual HTML anchors count. Sitemap entries, metadata and self-links do not
// provide an incoming reading route. A disconnected cycle is not reachable.
export function auditNavigation(documents, origin = base) {
  const graph = new Map([...documents].map(([file, html]) => [
    file, new Set(pageLinks(html, file, origin).map(link => link.file).filter(target => documents.has(target)))
  ]));
  const pages = [...graph.keys()].map(file => ({
    file,
    incoming: [...graph].filter(([source, targets]) => source !== file && targets.has(file)).map(([source]) => source),
    fromHome: shortestPath(graph, "index.html", file),
    toHome: shortestPath(graph, file, "index.html")
  }));
  return {
    pages,
    orphans: pages.filter(page => page.file !== "index.html" && !page.incoming.length).map(page => page.file),
    unreachable: pages.filter(page => !page.fromHome).map(page => page.file),
    noReturn: pages.filter(page => !page.toHome).map(page => page.file)
  };
}

export function checkSiteNavigation(root, fail) {
  const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  const documents = new Map();
  if (new Set(urls).size !== urls.length) fail("sitemap.xml", "duplicate canonical URLs");
  const textUrls = readFileSync(join(root, "sitemap.txt"), "utf8").trim().split(/\s+/);
  if (JSON.stringify([...urls].sort()) !== JSON.stringify([...textUrls].sort())) fail("sitemap.txt", "URL set differs from XML sitemap");
  for (const value of urls) {
    const url = new URL(value);
    if (url.origin !== new URL(base).origin || url.search || url.hash) {
      fail("sitemap.xml", `expected canonical URL without query or fragment: ${value}`);
      continue;
    }
    const file = url.pathname.slice(1) || "index.html";
    if (!existsSync(join(root, file))) {
      fail(file, "sitemap target does not exist");
      continue;
    }
    const html = readFileSync(join(root, file), "utf8");
    documents.set(file, html);
    if ((html.match(/<meta\b[^>]*>/gi) ?? []).some(tag => /^(robots|googlebot)$/i.test(attr(tag, "name")) && /\b(noindex|none)\b/i.test(attr(tag, "content")))) {
      fail(file, "noindex page must not be in the public sitemap");
    }
  }
  const report = auditNavigation(documents);
  for (const file of report.orphans) fail(file, "orphan: no incoming link from another public page");
  for (const file of report.unreachable) fail(file, "not reachable from the homepage through public HTML links");
  for (const file of report.noReturn) fail(file, "no HTML navigation route back to the homepage");
  for (const [file, html] of documents) {
    for (const link of pageLinks(html, file)) {
      if (!link.hash || !documents.has(link.file)) continue;
      const target = documents.get(link.file);
      const ids = [...target.matchAll(/\b(?:id|name)\s*=\s*(["'])(.*?)\1/gi)].map(match => match[2]);
      if (!ids.includes(link.hash)) fail(file, `broken public-page fragment: ${link.file}#${link.hash}`);
    }
  }
  // These two main-navigation pages must expose the entrances without opening a
  // bottom-of-page FAQ. Browser tests separately verify visibility and layout.
  for (const file of ["events.html", "whitepaper.html"]) {
    const html = documents.get(file) ?? "";
    const primaryContent = clean(html).replace(/<details\b[^>]*>[\s\S]*?<\/details>/gi, "");
    const entry = primaryContent.match(/<nav\b[^>]*data-reading-entry[^>]*>[\s\S]*?<\/nav>/i)?.[0] ?? "";
    for (const target of ["xin-xilan-ai-club.html", "ai-enthusiasts-new-zealand.html"]) {
      if (!pageLinks(entry, file).some(link => link.file === target)) fail(file, `missing visible reading entrance: ${target}`);
    }
  }
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = [];
  const report = checkSiteNavigation(join(dirname(fileURLToPath(import.meta.url)), ".."), (file, message) => failures.push(`${file}: ${message}`));
  if (process.argv.includes("--json")) console.log(JSON.stringify({ ...report, failures }, null, 2));
  else {
    console.log(`NAVIGATION: ${report.pages.length} sitemap pages; ${report.orphans.length} orphans; ${report.unreachable.length} unreachable; ${report.noReturn.length} without a route home.`);
    failures.forEach(message => console.error(message));
  }
  process.exitCode = failures.length ? 1 : 0;
}

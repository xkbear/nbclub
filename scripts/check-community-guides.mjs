import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const origin = "https://new-bee.club/";
const text = value => value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, "").trim();

// Check useful public pages, not a keyword count or a promise about rankings.
export function checkCommunityGuides(root, fail) {
  const guides = {
    "xin-xilan-ai-club.html": ["learning", "people", "activities", "membership", "faq"],
    "auckland-ai-club.html": ["activities", "locations", "first-visit", "faq"]
  };
  for (const [file, sections] of Object.entries(guides)) {
    const html = readFileSync(join(root, file), "utf8");
    const body = html.split(/<body\b[^>]*>/i)[1] ?? "";
    const main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .flatMap(([, source]) => { try { const value = JSON.parse(source); return value["@graph"] ?? [value]; } catch { return []; } });
    const webpage = schemas.find(item => item["@type"] === "WebPage");
    const title = text(html.match(/<title>(.*?)<\/title>/i)?.[1] ?? "");
    if (text(webpage?.name ?? "") !== title) fail(file, "page schema name must match the document title");
    if (webpage?.publisher?.["@id"] !== `${origin}#organization`) fail(file, "guide must identify its official publisher");
    if (!webpage?.citation?.length) fail(file, "guide must cite its factual sources");
    for (const citation of webpage?.citation ?? []) {
      if (!main.includes(`href="${citation}"`) && !main.includes(`href="${citation.replace(origin, "")}"`) && !main.includes(`href="${citation.replace(origin, "")}#`)) {
        fail(file, `schema citation must have a visible source link (${citation})`);
      }
    }
    if (!main.includes(`datetime="${webpage?.lastReviewed}"`)) fail(file, "review date must appear in visible page content");
    for (const id of sections) if (!main.includes(`id="${id}"`)) fail(file, `missing useful guide section (${id})`);
    if (/<(?:section|article|div|p|h[1-6]|a)\b[^>]*(?:\s(?:hidden|inert)(?:\s|=|>)|aria-hidden="true"|style="[^"]*(?:display\s*:\s*none|visibility\s*:\s*hidden))/i.test(main)) fail(file, "guide content must not be hidden from readers");

    const faq = schemas.find(item => item["@type"] === "FAQPage");
    const visibleFaq = [...main.matchAll(/<details\b[^>]*class="faq-item"[^>]*>([\s\S]*?)<\/details>/gi)].map(([, item]) => ({
      question: text(item.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? ""),
      answer: text(item.match(/<div class="faq-answer">([\s\S]*?)<\/div>/i)?.[1] ?? "")
    }));
    if (!faq || faq.mainEntity.length !== visibleFaq.length) fail(file, "FAQ schema and visible questions must have matching counts");
    for (const question of faq?.mainEntity ?? []) {
      const match = visibleFaq.find(item => item.question === text(question.name));
      if (!match || match.answer !== text(question.acceptedAnswer?.text ?? "")) fail(file, `FAQ schema must match the visible answer (${question.name})`);
    }

    const incoming = readdirSync(root).filter(name => name.endsWith(".html") && name !== file).filter(name => {
      const source = readFileSync(join(root, name), "utf8");
      return [...source.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].some(([, href]) => {
        try { return new URL(href, origin + name).href.split("#")[0] === origin + file; } catch { return false; }
      });
    });
    if (incoming.length < 3 || !incoming.includes("events.html") || !incoming.some(name => name.startsWith("event-"))) fail(file, "guide needs contextual discovery from the event archive and relevant recaps");

    // Check fragment destinations too: a live file with a broken #section is not enough.
    for (const [, href] of main.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
      const url = new URL(href, origin + file);
      if (url.origin !== new URL(origin).origin || !url.hash) continue;
      const target = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      try {
        const source = readFileSync(join(root, target), "utf8");
        if (!source.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) fail(file, `broken section link (${href})`);
      } catch { fail(file, `missing section destination (${href})`); }
    }
  }
}

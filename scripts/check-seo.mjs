#!/usr/bin/env node
/**
 * Consistency check for sitemap.xml + _redirects. No dependencies, no network.
 * Run with `npm run seo:check` (and after any change to either file).
 *
 * It catches the three mistakes that are easy to make here and expensive to
 * discover from Search Console six weeks later:
 *
 *   1. a URL listed in the sitemap that also 301s away
 *      -> Google is told "index this" and "this moved" at the same time
 *   2. a redirect pointing at a URL that is not in the sitemap
 *      -> equity is sent to a page that may not exist
 *   3. a redirect chain (A -> B where B -> C)
 *      -> each hop loses signal, and Google gives up after a few
 *
 * It deliberately does NOT check that pages render; that needs a browser.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://cakeaiartist.com";

const sitemap = readFileSync(resolve(ROOT, "public/sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, ""));
const inSitemap = new Set(locs);

const redirects = readFileSync(resolve(ROOT, "public/_redirects"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => {
    const [from, to, code] = l.split(/\s+/);
    return { from, to, code };
  });

const problems = [];

if (locs.length !== inSitemap.size) {
  const seen = new Set();
  for (const p of locs) {
    if (seen.has(p)) problems.push(`duplicate <loc> in sitemap: ${p}`);
    seen.add(p);
  }
}

const sources = new Set(redirects.map((r) => r.from));
for (const { from, to, code } of redirects) {
  if (code !== "301") problems.push(`redirect is not a 301: ${from} -> ${to} (${code})`);
  if (inSitemap.has(from)) problems.push(`redirect source is still in the sitemap: ${from}`);
  if (!inSitemap.has(to)) problems.push(`redirect target is not in the sitemap: ${from} -> ${to}`);
  if (sources.has(to)) problems.push(`redirect chain: ${from} -> ${to}, and ${to} redirects on`);
}

console.log(
  `sitemap: ${locs.length} URLs   redirects: ${redirects.length}   problems: ${problems.length}`
);
for (const p of problems) console.error(`  ${p}`);
process.exit(problems.length ? 1 : 0);

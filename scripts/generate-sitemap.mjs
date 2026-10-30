#!/usr/bin/env node
/**
 * Build-time sitemap generator for cakeaiartist.com
 *
 * WHY THIS EXISTS
 * ---------------
 * public/sitemap.xml used to be a hand-maintained static file. By 2026-10-30 it
 * had drifted badly against reality:
 *   - 27 /blog/ URLs for posts that do not exist in the database
 *   - 25 published posts missing entirely, so Google never discovered them
 *   - lastmod frozen at May–July 2026
 * That accounts for most of the "Crawled – currently not indexed" and
 * "Discovered – currently not indexed" buckets in Search Console.
 *
 * This script rebuilds the sitemap from the real sources on every build:
 *   static routes  -> the STATIC_ROUTES list below (matches src/App.tsx)
 *   name pages     -> src/data/cakeNames.ts
 *   theme pages    -> src/data/cakeThemes.ts
 *   blog + recipes -> Supabase, published rows only
 *
 * SAFETY: if Supabase is unreachable the script keeps the /blog/ and /recipes/
 * URLs already present in the committed sitemap and carries on, so a network
 * blip degrades the sitemap's freshness but never fails the build.
 *
 * Routes that are intentionally noindex (/occasions, /gallery, /auth,
 * /settings, /admin/*, /party/*, /rsvp/*, /embed/*) are deliberately absent.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://cakeaiartist.com";
const OUT = resolve(ROOT, "public/sitemap.xml");

// Indexable static routes. Keep in sync with src/App.tsx when adding a page.
const STATIC_ROUTES = [
  ["/", 1.0, "daily"],
  ["/3d-cake-designer", 0.9, "weekly"],
  ["/free-ai-cake-designer", 0.9, "weekly"],
  ["/ai-cake-generator-free", 0.9, "weekly"],
  ["/ai-birthday-cake-with-name", 0.9, "weekly"],
  ["/photo-cake-maker", 0.9, "weekly"],
  ["/personalized-cake-online", 0.8, "weekly"],
  ["/wedding-cake-designer", 0.8, "weekly"],
  ["/anniversary-cake-designer", 0.8, "weekly"],
  ["/eggless-cake-design", 0.8, "weekly"],
  ["/graduation-cake-ideas", 0.8, "weekly"],
  ["/eid-cake-ideas", 0.8, "weekly"],
  ["/rakhi-cake-ideas", 0.8, "weekly"],
  ["/party-planner", 0.8, "weekly"],
  ["/blog", 0.8, "daily"],
  ["/recipes", 0.8, "weekly"],
  ["/community", 0.7, "weekly"],
  ["/use-cases", 0.7, "monthly"],
  ["/how-it-works", 0.7, "monthly"],
  ["/pricing", 0.7, "monthly"],
  ["/faq", 0.7, "monthly"],
  ["/about", 0.6, "monthly"],
  ["/contact", 0.6, "monthly"],
  ["/advertising", 0.5, "monthly"],
  ["/uk", 0.8, "weekly"],
  ["/usa", 0.8, "weekly"],
  ["/canada", 0.8, "weekly"],
  ["/australia", 0.8, "weekly"],
  ["/india", 0.8, "weekly"],
  ["/privacy", 0.3, "yearly"],
  ["/terms", 0.3, "yearly"],
];

const today = new Date().toISOString().slice(0, 10);

/** Pull `slug: "..."` values out of a TS data module without importing it. */
function slugsFrom(relPath) {
  const src = readFileSync(resolve(ROOT, relPath), "utf8");
  const found = [...src.matchAll(/slug:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  const unique = [...new Set(found)];
  if (unique.length !== found.length) {
    throw new Error(`${relPath}: duplicate slugs — ${found.length - unique.length} repeated`);
  }
  if (!unique.length) throw new Error(`${relPath}: no slugs found — parser out of date?`);
  return unique;
}

/**
 * The blog has TWO content sources and both must reach the sitemap:
 *   1. `blogPostsContent` — 27 posts hardcoded in src/pages/BlogPost.tsx
 *   2. the blog_posts table — everything the generator wrote
 * BlogPost.tsx checks the hardcoded map as well as the database, so these 27
 * URLs are live pages, not strays. An earlier version of this script only
 * looked at the database and would have dropped all 27 from the sitemap,
 * including /blog/cake-message-writing-tips, which ranks at position 8.9.
 */
function staticBlogSlugs() {
  const lines = readFileSync(resolve(ROOT, "src/pages/BlogPost.tsx"), "utf8").split("\n");
  const start = lines.findIndex((l) => l.includes("const blogPostsContent"));
  if (start === -1) throw new Error("BlogPost.tsx: blogPostsContent not found — parser out of date?");
  const end = lines.findIndex((l, i) => i > start && l.startsWith("};"));
  const slugs = lines
    .slice(start + 1, end)
    .map((l) => l.match(/^ {2}"([a-z0-9][a-z0-9-]*)":\s*\{/))
    .filter(Boolean)
    .map((m) => m[1]);
  if (!slugs.length) throw new Error("BlogPost.tsx: parsed zero hardcoded posts — parser out of date?");
  return slugs;
}

/** Read the committed sitemap so we can fall back to its dynamic URLs. */
function previousUrls(prefix) {
  if (!existsSync(OUT)) return [];
  const xml = readFileSync(OUT, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(ORIGIN, ""))
    .filter((p) => p.startsWith(prefix));
}

/**
 * Vite loads .env for the app, but this script runs as plain node before Vite,
 * so read the same file ourselves. Real environment variables win, which lets
 * Cloudflare's build settings override the committed values.
 */
function envValue(name) {
  if (process.env[name]) return process.env[name];
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return undefined;
  const line = readFileSync(envPath, "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${name}=`));
  if (!line) return undefined;
  return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}

async function fetchPublished(table, label) {
  const base = envValue("VITE_SUPABASE_URL");
  const key = envValue("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!base || !key) throw new Error("VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY not set");

  const url = `${base}/rest/v1/${table}?select=slug,updated_at&is_published=eq.true&limit=5000`;
  const res = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status} ${await res.text()}`);

  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) throw new Error(`${label}: zero published rows`);
  return rows.map((r) => ({
    slug: r.slug,
    lastmod: (r.updated_at || today).slice(0, 10),
  }));
}

/** Fetch published rows, or fall back to whatever the old sitemap had. */
async function dynamicSection(table, label, prefix, priority, changefreq) {
  try {
    const rows = await fetchPublished(table, label);
    console.log(`  ${label}: ${rows.length} published rows from Supabase`);
    return rows.map((r) => [`${prefix}${r.slug}`, priority, changefreq, r.lastmod]);
  } catch (err) {
    const kept = previousUrls(prefix);
    console.warn(`  ${label}: FETCH FAILED (${err.message})`);
    console.warn(`  ${label}: keeping ${kept.length} URLs from the previous sitemap`);
    if (!kept.length) {
      throw new Error(`${label}: fetch failed and no previous URLs to fall back on`);
    }
    return kept.map((p) => [p, priority, changefreq, today]);
  }
}

function xmlFor(entries) {
  const body = entries
    .map(
      ([path, priority, changefreq, lastmod]) =>
        `  <url>\n` +
        `    <loc>${ORIGIN}${path}</loc>\n` +
        `    <lastmod>${lastmod || today}</lastmod>\n` +
        `    <changefreq>${changefreq}</changefreq>\n` +
        `    <priority>${priority.toFixed(1)}</priority>\n` +
        `  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

async function main() {
  console.log("Generating sitemap…");

  const names = slugsFrom("src/data/cakeNames.ts");
  const themes = slugsFrom("src/data/cakeThemes.ts");
  const hardcoded = staticBlogSlugs();
  console.log(`  names: ${names.length}   themes: ${themes.length}   hardcoded posts: ${hardcoded.length}`);

  const dbBlog = await dynamicSection("blog_posts", "blog (db)", "/blog/", 0.7, "monthly");

  // A slug defined in both places is one page, so emit it once. The duplicate
  // guard below would otherwise abort the build.
  const dbBlogPaths = new Set(dbBlog.map(([p]) => p));

  const entries = [
    ...STATIC_ROUTES.map(([p, pr, cf]) => [p, pr, cf, today]),
    ...names.map((s) => [`/birthday-cake-for/${s}`, 0.6, "monthly", today]),
    ...themes.map((s) => [`/birthday-cake-theme/${s}`, 0.6, "monthly", today]),
    ...hardcoded
      .map((s) => [`/blog/${s}`, 0.7, "monthly", today])
      .filter(([p]) => !dbBlogPaths.has(p)),
    ...dbBlog,
    ...(await dynamicSection("cake_recipes", "recipes", "/recipes/", 0.6, "monthly")),
  ];

  // A duplicate <loc> is a crawl-budget bug; fail loudly rather than ship one.
  const seen = new Set();
  for (const [path] of entries) {
    if (seen.has(path)) throw new Error(`duplicate URL in sitemap: ${path}`);
    seen.add(path);
  }

  writeFileSync(OUT, xmlFor(entries));
  console.log(`  wrote ${entries.length} URLs to public/sitemap.xml`);
}

main().catch((err) => {
  console.error("sitemap generation failed:", err.message);
  process.exit(1);
});

# Plan: Expand & deepen name pages

## Goal
Grow `/birthday-cake-for/{name}` cluster from ~130 → ~200 pages, targeting underserved high-volume audiences, AND make every page substantive enough that Google treats them as real content (not templated doorways).

## Part 1 — Add ~70 strategic names

Focus on gaps in the current list. No more generic English names — pick underserved segments with real search demand.

**Muslim / Arabic (~20 names)**
Muhammad, Ahmed, Ali, Omar, Yusuf, Ibrahim, Hassan, Hussain, Zayn, Bilal, Fatima, Aisha (dup — skip), Zainab, Maryam, Khadija, Layla, Noor, Amina, Yasmin, Hafsa

**Hispanic / Latino (~20 names)**
Mateo (dup — skip), Diego, Santiago, Sebastián, Emiliano, Nicolás, Javier, Carlos, Miguel, Andrés, Sofía (variant), Valentina, Isabella (dup — skip), Camila, Valeria, Lucía, Martina, Renata, Ximena, Gabriela

**African-American popular (~15 names)**
Jaylen, Malachi, Amari, Kingston, Jayden, Zion, Messiah, Xavier, Nia, Zuri, Aaliyah, Amirah, Kehlani, Journee, Legend

**2026 trending / Gen Alpha (~15 names)**
Kai, Ezra, Milo, Atlas, Rowan, Silas, Wren, Nova, Aurora, Sage, River, Sloane, Ottilie, Cove, Bodhi

Dedupe against existing `CAKE_NAMES` before adding. Final add = ~70 unique.

## Part 2 — Deepen ALL ~200 name pages

Every page currently renders a generic template. Add 2 unique blocks per name:

**Block A — Name meaning card**
- Origin, meaning, cultural context (1 short paragraph, ~40 words)
- Data source: extend existing `src/data/nameMeanings.ts` (already in project) to cover all ~200 names
- Rendered as a styled card above the CTA

**Block B — Suggested cake themes for this name**
- 3–4 theme suggestions tied to the name's vibe (e.g. Aarav → cricket, superhero, blue-gold; Luna → moon, pastel, celestial)
- Pull from existing `src/data/cakeThemes.ts`; add a `nameThemeMap` lookup so each name gets curated (not random) themes
- Rendered as a 3–4 card grid with theme name + one-line description, each linking to `/birthday-cake-theme/{theme}`

Result: every name page has ~120–150 unique words + curated internal links → passes Google's "thin content" bar.

## Part 3 — Sitemap + internal linking

- Regenerate `public/sitemap.xml` to include all ~200 name URLs
- On `NamedCakePage`, add "Other popular names" section (8 random names from same region cluster) for internal link equity
- On homepage `PopularCakesSection`, surface a rotating strip of 12 name pages

## Technical details

**Files to touch:**
- `src/data/cakeNames.ts` — append 70 new entries with `origin` tags
- `src/data/nameMeanings.ts` — extend to cover all ~200 names (bulk-generate via one AI call, not per-name)
- `src/data/nameThemeMap.ts` — new file, `Record<slug, themeSlug[]>` with 3–4 themes per name
- `src/pages/NamedCakePage.tsx` — render meaning card + theme grid + "other names" section
- `public/sitemap.xml` — regenerate with new URLs
- `src/components/PopularCakesSection.tsx` — add rotating name strip (optional, low risk)

**No new routes, no new components beyond the data files.** Reuses `NamedCakePage` and existing theme cards.

**Order of ops:**
1. Extend `cakeNames.ts` (+70)
2. Bulk-generate meanings for all 200 → `nameMeanings.ts`
3. Build `nameThemeMap.ts` (grouped by origin — Indian names → certain themes, Muslim names → others, etc.)
4. Update `NamedCakePage.tsx` to render new blocks
5. Regenerate sitemap
6. Verify build + spot-check 3 pages (1 existing, 1 new Muslim name, 1 new Hispanic name)

## Out of scope (revisit later)
- Name + age combo pages (`/birthday-cake-for/{name}/{age}`) — wait for Pinterest data first
- Per-name hero image generation — reuse existing themed hero + name overlay, no new imagegen credits
- Rewriting existing pages' meta titles/descriptions — current pattern is fine

## Expected impact
- ~70 new indexable pages targeting underserved high-intent queries (Muslim/Hispanic/African-American names have huge diaspora search volume + low competition)
- ~200 pages upgraded from "thin" → "substantive," reducing risk of Google demoting the whole cluster
- Stronger internal linking → better crawl depth for the name cluster
- Timeline to results: 4–8 weeks for indexing, 8–12 weeks for ranking

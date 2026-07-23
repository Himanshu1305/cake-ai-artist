# Request-Indexing Priority List (Google Search Console)

**How to use:** In GSC → URL Inspection → paste URL → "Request Indexing". Google caps manual requests at **~10/day per property**. Work top-down; do one batch per day after the branch ships to production. Prioritise (a) pages whose title/description we just changed (Google must re-crawl to show the new snippet), (b) the revenue pages, then (c) new pages.

> ⚠️ Requesting indexing only helps pages that are **crawlable and indexable**. We added `noindex` to `/cake/:id` and removed noindexed URLs from the sitemap, so do **not** request those.

---

## Day 1 — Re-crawl the pages we just re-titled (highest ROI)
These have new titles/descriptions from Phase 1/3; forcing a re-crawl updates the SERP snippet fastest.
1. https://cakeaiartist.com/india
2. https://cakeaiartist.com/ai-birthday-cake-with-name
3. https://cakeaiartist.com/how-it-works
4. https://cakeaiartist.com/graduation-cake-ideas
5. https://cakeaiartist.com/3d-cake-designer  *(re-crawl after Phase 4 expansion)*
6. https://cakeaiartist.com/photo-cake-maker
7. https://cakeaiartist.com/wedding-cake-designer
8. https://cakeaiartist.com/personalized-cake-online
9. https://cakeaiartist.com/ai-cake-generator-free
10. https://cakeaiartist.com/free-ai-cake-designer

## Day 2 — Upgraded blog posts + new pages
1. https://cakeaiartist.com/blog/meaning-behind-candles-icing-cake-colors *(0.7% CTR — worst)*
2. https://cakeaiartist.com/blog/world-cake-report-2026 *(0.7% CTR)*
3. https://cakeaiartist.com/blog/funny-birthday-cake-ideas-for-adults
4. https://cakeaiartist.com/blog/cake-design-ideas-2026
5. https://cakeaiartist.com/blog/ai-cake-generator-vs-chatgpt-gemini-midjourney
6. https://cakeaiartist.com/rakhi-cake-ideas *(NEW — timely for Aug 28)*
7. https://cakeaiartist.com/eggless-cake-design *(NEW)*
8. https://cakeaiartist.com/anniversary-cake-designer *(NEW)*
9. https://cakeaiartist.com/eid-cake-ideas
10. https://cakeaiartist.com/use-cases

## Day 3 — Country pages + strong pillars
1. https://cakeaiartist.com/usa
2. https://cakeaiartist.com/uk
3. https://cakeaiartist.com/canada
4. https://cakeaiartist.com/australia
5. https://cakeaiartist.com/blog/best-ai-cake-generators-2026
6. https://cakeaiartist.com/blog/best-free-ai-cake-generator-2026
7. https://cakeaiartist.com/blog/birthday-cake-with-name-and-photo
8. https://cakeaiartist.com/blog/best-birthday-cake-ideas-india
9. https://cakeaiartist.com/blog/history-of-birthday-cakes
10. https://cakeaiartist.com/blog/birthday-cake-ideas-for-mom

## Day 4+ — Named/themed programmatic pages (only the strongest)
Request indexing selectively for the highest-search-volume names/themes (e.g. `muhammad`, `emma`, `olivia`, `noah`, `unicorn`, `spiderman`, `barbie`). Google indexes these on its own timeline; don't burn the daily quota on the full 220-page set.

---

## Notes on the "Not indexed" buckets (from Search Console)
- **15 × "Not found (404)":** exact URLs require a GSC export (Coverage → Not indexed → 404). Likely old blog/recipe slugs that changed. Method: export the list, cross-check each slug against the `blog_posts` / `cake_recipes` tables; if the row is gone, the URL is a genuine 404 → remove from sitemap and set up a 301 redirect to the closest live page. **This overhaul removed 7 known bad sitemap entries** (6 noindexed `-2` duplicate name pages + `/occasions`).
- **19 × "Crawled - currently not indexed":** most likely the `/cake/:id` share pages Google crawled — now fixed with `noindex, follow` (Phase 2). Should drop off over the next few crawl cycles.
- **214 × "Discovered - currently not indexed":** overwhelmingly the ~220 programmatic name/theme pages. These are indexable (191/197 names are in `NAME_MEANINGS`); Google simply hasn't prioritised crawling them. The internal-linking work (Phase 7) and stronger per-page uniqueness improve crawl priority over time. This is normal for large programmatic sets and not a technical error — do not mass-request them.

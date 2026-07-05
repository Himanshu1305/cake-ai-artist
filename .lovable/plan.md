## Approved parameters
- **Image tier:** `imagegen` fast
- **Cadence:** one continuous batch — all 27 rewrites + DB audit + 6 pillars, shipped back-to-back

## Audit summary (what needs fixing)

**Hardcoded posts (`src/pages/BlogPost.tsx`) — 27 total, all failing:**

| Word count | Alt text | Hero image |
|---|---|---|
| 27/27 under 1,200 words (avg ~430) | 26/27 missing `imageAlt` | 27/27 generic Unsplash stock — root cause of the "image doesn't match content" complaint |

**DB-driven posts (`blog_posts` table):** need runtime audit — will query for rows where body word count < 1,200, `image_alt IS NULL`, or `image_url` is an unsplash.com URL.

## Execution — one continuous batch

### Batch 1 — Content + images for the 27 hardcoded posts
For each of the 27 slugs:
- Expand body to **≥1,200 words**: add history/context, step-by-step, named examples, 3–5 Q&A FAQ block, closing CTA linking to 2–3 relevant `/birthday-cake/{name}` or `/birthday-cake-theme/{theme}` pages.
- Generate a **topical hero image** with `imagegen` (fast, 1200×630 jpg), save to `public/blog/{slug}-hero.jpg`, replace `featuredImage`.
- Add descriptive **`imageAlt`** field to each post record.
- Add **2 in-body images** per post (also fast tier, saved under `public/blog/{slug}-{n}.jpg`), each with keyword-rich alt.
- Add per-post **`FAQPage` JSON-LD** via existing `<FAQSchema>` component.

Total imagegen calls for this batch: 27 × 3 = **81 fast-tier calls**.

### Batch 2 — DB-driven post audit + fix
- `SELECT slug, title, image_url, image_alt, LENGTH(content) FROM blog_posts` — identify failing rows.
- For each failing row: rewrite content to ≥1,200 words, regenerate hero + set `image_alt` via `supabase--insert`/update migration.
- If count is large, will report list first and confirm before regenerating images.

### Batch 3 — 6 editorial pillars (fresh)
Each authored to 1,500+ words with topical hero + 3 in-body images + FAQ + `ArticleSchema` + `BreadcrumbSchema`:
1. `/blog/history-of-birthday-cakes`
2. `/blog/world-cake-report-2026`
3. `/blog/birthday-cake-traditions-around-the-world`
4. `/blog/cake-ai-artist-vs-chatgpt`
5. `/blog/cake-ai-artist-vs-gemini`
6. `/blog/meaning-behind-candles-icing-cake-colors`

Total imagegen calls for this batch: 6 × 4 = **24 fast-tier calls**.

### Batch 4 — Sitemap + delivery
- Add the 6 new pillar slugs to `public/sitemap.xml` with today's `lastmod`; bump `<lastmod>` on the 27 rewritten slugs.
- Print the **Google Search Console submission list** to chat, ready to paste:

```
Updated (27):
https://cakeaiartist.com/blog/creative-cake-ideas-birthday
https://cakeaiartist.com/blog/cake-design-trends-2025
https://cakeaiartist.com/blog/ai-vs-traditional-cake-design
https://cakeaiartist.com/blog/perfect-birthday-messages
https://cakeaiartist.com/blog/virtual-party-guide
https://cakeaiartist.com/blog/last-minute-birthday-solutions
https://cakeaiartist.com/blog/personalized-cakes-psychology
https://cakeaiartist.com/blog/anniversary-cake-ideas
https://cakeaiartist.com/blog/kids-birthday-cakes-guide
https://cakeaiartist.com/blog/cake-message-writing-tips
https://cakeaiartist.com/blog/first-birthday-cake-ideas
https://cakeaiartist.com/blog/fourth-of-july-cake-ideas
https://cakeaiartist.com/blog/british-jubilee-royal-cakes
https://cakeaiartist.com/blog/canada-day-cake-ideas
https://cakeaiartist.com/blog/australia-day-cake-ideas
https://cakeaiartist.com/blog/american-christmas-cake-ideas
https://cakeaiartist.com/blog/american-new-year-cake-ideas
https://cakeaiartist.com/blog/british-christmas-cake-ideas
https://cakeaiartist.com/blog/british-new-year-cake-ideas
https://cakeaiartist.com/blog/canadian-christmas-cake-ideas
https://cakeaiartist.com/blog/canadian-new-year-cake-ideas
https://cakeaiartist.com/blog/australian-christmas-cake-ideas
https://cakeaiartist.com/blog/australian-new-year-cake-ideas
https://cakeaiartist.com/blog/diwali-cake-ideas
https://cakeaiartist.com/blog/holi-cake-ideas
https://cakeaiartist.com/blog/indian-christmas-cake-ideas
https://cakeaiartist.com/blog/indian-new-year-cake-ideas

+ any DB-driven post updated in Batch 2

New (6 pillars):
https://cakeaiartist.com/blog/history-of-birthday-cakes
https://cakeaiartist.com/blog/world-cake-report-2026
https://cakeaiartist.com/blog/birthday-cake-traditions-around-the-world
https://cakeaiartist.com/blog/cake-ai-artist-vs-chatgpt
https://cakeaiartist.com/blog/cake-ai-artist-vs-gemini
https://cakeaiartist.com/blog/meaning-behind-candles-icing-cake-colors
```

## Definition of done per post
- ≥1,200 words (hardcoded/DB) or ≥1,500 (pillar)
- Topical hero image matching the H1 (no Unsplash mismatches)
- Every `<img>` has descriptive keyword-relevant `alt`
- `FAQPage` + `ArticleSchema` JSON-LD present
- 3+ internal links to related name/theme pages
- Sitemap `<lastmod>` bumped

## Heads-up
This is a large shipment — expect several long turns of file edits + imagegen calls in a row. I'll surface the final GSC URL list at the very end so you have one clean list to paste, and also flag any post where imagegen or content generation errored so you can decide whether to retry.

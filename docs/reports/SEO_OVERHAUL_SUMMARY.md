# Overnight SEO/AEO/GEO Overhaul — Morning Summary

**Date:** 2026-07-23 · **Branch:** `overnight-seo-overhaul` (NOT pushed — review, then merge to `main`)
**Type check:** `npx tsc --noEmit` passes clean after every phase.
**Build note:** A full `vite build` could not be run in this environment — `vite` is not installed locally (deps are managed via bun/Lovable). TypeScript compilation (the meaningful gate) passes.

> ⚠️ **You must run 2 SQL migrations manually** (they only ran through review here, not against the DB). See "SQL migrations" below.

---

## 1. Research highlights

Full detail in `seo-research.md` (master + keyword map + 10 ranked opportunities), `seo-keyword-competitor-research.md`, `aeo-geo-best-practices.md`.

**Top keyword opportunities found**
- **Eggless cake design** — India-critical dietary qualifier, **low competition, NO AI tool targets it.** → built `/eggless-cake-design`.
- **Rakhi / Raksha Bandhan cakes** — timely (**Aug 28 2026**), owned by delivery bakeries, **zero AI design competitors.** → built `/rakhi-cake-ideas`.
- **AI wedding cake generator** — fragmented, low-competition SERP (we already own `/wedding-cake-designer`).
- **Anniversary cake with photo + name**, **cake for mom/dad**, **"no signup" cake generator** — untapped long-tail.

**Competitor insights (what they do that we didn't)**
- Winners in "3d cake designer" (BasedLabs, Genbaz) **exact-match the keyword including "free online"** in title + H1, and run **FAQ + HowTo schema**. We already deploy FAQ+HowTo+Breadcrumb — we are *ahead* here; the job was to preserve it and add the missing definition/answer blocks.
- **Two title systems:** tool pages use plain `[keyword] — Free …` (no year); blog/listicle pages use `Top N … 2026`. We were using blog-style titles inconsistently — fixed in Phases 1 & 5.
- Differentiators competitors use in snippets: **Trustpilot stars** (Easy-Peasy) and **"No Login Required"** (Magica).

**AEO/GEO (what gets cited by AI Overviews / ChatGPT / Perplexity in 2026)**
- **Statistics (+30-41%)** and **inline citations (+30-40%)** are the highest-ROI structural tactics (Princeton GEO study).
- A **40-60 word direct answer in the top 30% of the page** captures 55% of AI-Overview citations.
- **Definition boxes** ("What is X?") get lifted whole. FAQ rich results were deprecated (May 2026) but the markup still helps AI parsing — keep it.

---

## 2. Meta title / description changes (before → after)

### Page files (in code)
| Page | Before (title) | After (title) |
|---|---|---|
| `/india` | AI Cake Generator India — Birthday Cake AI Designer | **Free AI Cake Designer India — Birthday, Diwali & Eggless** |
| `/ai-birthday-cake-with-name` | AI Birthday Cake with Name — Free Online Cake Designer | **AI Birthday Cake with Name — Free & Spelled Correctly** |
| `/how-it-works` | How the AI Cake Generator Works — 30-Second Guide | **How to Design a Cake with AI — Step-by-Step (Free)** |
| `/graduation-cake-ideas` | Graduation Cake Ideas — Free AI Graduation Cake Designer Online (62 chars) | **Graduation Cake Ideas 2026 — Free AI Cake Designer** (50 chars) |

Descriptions rewritten on all four to add a CTA + differentiator and (India) ₹/eggless/Diwali intent. See the diffs.

### Blog posts (via SQL — `20260723090000_blog_meta_updates.sql`)
| slug | New title | New meta description (summary) |
|---|---|---|
| funny-birthday-cake-ideas-for-adults | **45 Funny Birthday Cake Ideas for Adults (2026)** | count + laughs + "make your own free with AI" |
| meaning-behind-candles-icing-cake-colors | **What Birthday Candle & Cake Colors Mean (Guide)** | promises the answer directly (was 0.7% CTR) |
| cake-design-ideas-2026 | **30 Cake Design Ideas for 2026 (Trending Now)** | count + trending + CTA |
| world-cake-report-2026 | **Cake Statistics 2026: Trends, Data & Industry Report** | stats-forward (was 0.7% CTR) |
| ai-cake-generator-vs-chatgpt-gemini-midjourney | **AI Cake Generator vs ChatGPT, Gemini & Midjourney (2026)** | "which spells names right" |

---

## 3. Indexing fixes applied

- **`/cake/:id` (SharedCake): added `noindex, follow`** — thin, personal, infinite share pages that were surfacing as "Crawled/Discovered - not indexed." (PublicParty, PartyRSVP, PartyPlannerDetail already had noindex.)
- **Removed 7 bad URLs from `sitemap.xml`:** 6 noindexed `-2` duplicate name pages (anna-2, ava-2, jack-2, kevin-2, maya-2, noah-2) + `/occasions` (a logged-in personal page that is `noindex`). Sitemap re-validated as well-formed XML (now 360 → 363 URLs after adding the 3 new pages).
- **Confirmed** all 16 core SEO pages have `<link rel="canonical">`; the blog index (`/blog`) fetches **all** published posts (no pagination cap) so every post is discoverable.
- **Root-cause note on 214 "Discovered - not indexed":** overwhelmingly the ~220 programmatic name/theme pages (191/197 names are indexable via `NAME_MEANINGS`; the rest self-noindex). Normal for large programmatic sets — not a technical bug.

**Request-indexing priority list:** `docs/reports/request-indexing-list.md` (max 10/day, 4 days planned). Day 1 = the 4 re-titled pages + revenue pages; Day 2 = upgraded blogs + 3 new pages; Day 3 = country pages; Day 4 = strongest programmatic pages.

---

## 4. Schema / content additions per page (Phase 3 & 4)

New reusable components: **`AeoBlocks.tsx`** (`<AnswerBox>` = quotable 40-60 word direct answer + stat chips; `<DefinitionBox>` = "What is X?" H2 + 2-sentence definition) and **`RelatedTools.tsx`**.

- **15 SEO pages** got `<AnswerBox>` (top of page) + `<DefinitionBox>`: FreeCakeDesigner, AiCakeGeneratorFree, AiBirthdayCakeWithName, PhotoCakeMaker, PersonalizedCakeOnline, WeddingCakeDesigner, GraduationCakeDesigner, EidCakeDesigner, IndiaLanding, UKLanding, USALanding, CanadaLanding, AustraliaLanding, UseCases, HowItWorks. Consistent stat chips (~30s, 5 free designs, 3 views per cake, 20+ occasions).
- **FreeCakeDesigner:** added the missing **FAQPage schema** (6 Q&A) + a visible FAQ section.
- **`/3d-cake-designer` (winner, Phase 4):** FAQ 5→8, added **HowToSchema** (was missing), AnswerBox + DefinitionBox, and 4 new sections — "How to design a 3D cake online" (steps), "3D cake design ideas" grid, **"3D vs traditional" comparison table** (AEO win), and "Related AI cake tools" (outbound links to photo-cake-maker, birthday-cake-with-name, wedding-cake-designer).

---

## 5. New pages built (Phase 6)

| Route | Focus | Why |
|---|---|---|
| `/eggless-cake-design` | eggless cake design | India dietary qualifier, low competition |
| `/rakhi-cake-ideas` | rakhi / raksha bandhan cake | **timely — Aug 28 2026**, zero AI competitors |
| `/anniversary-cake-designer` | anniversary cake w/ photo + name | emotional long-tail, complements birthday tools |

Each: full Helmet meta, Breadcrumb + FAQ + HowTo schema, AnswerBox + DefinitionBox, 5 FAQs, Supabase featured-image fetch with Unsplash fallback, CTA → `/free-ai-cake-designer?occasion=…`, route in `App.tsx`, sitemap entry, single H1.

---

## 6. Internal linking (Phase 7)

- **Footer rebuilt** into 5 crawlable link groups — **AI Cake Tools, Occasions, Countries, Resources, Company**. Country links are now real `<Link>`s (were JS-only `window.location`, uncrawlable). Every tool/occasion/country/resource page is now **within 2 clicks of the homepage** → orphans eliminated for the main tree.
- **`<RelatedTools>`** in-content section added to **11 tool pages** (3-4 sibling links each).
- **Homepage "Explore Our AI Cake Designers"** hub expanded **6 → 12 links**, now including `/3d-cake-designer` and the 3 new pages.

---

## 7. SQL migration files — **YOU run these manually**

Both are additive, idempotent, and safe. Run against the Supabase DB:
1. **`supabase/migrations/20260723090000_blog_meta_updates.sql`** — title + meta_description for 5 low-CTR blog posts.
2. **`supabase/migrations/20260723093000_blog_content_upgrades.sql`** — content + excerpt (AEO-restructured) for the same 5 posts. Apostrophes encoded as `&#39;` for SQL safety; validated (balanced quotes, 0 raw contractions).

No other DB changes were made or executed.

---

## 8. Decisions needed from you (prioritized)

1. **Run the 2 SQL migrations** (above) — the blog fixes don't take effect until you do.
2. **Merge `overnight-seo-overhaul` → `main` and deploy**, then work the request-indexing list.
3. **Seasonal content cadence** (from research): ship a Rakhi listicle blog now; queue Diwali (early Oct), Ganesh Chaturthi (early Sep), Christmas (late Nov). Want these auto-drafted next?
4. **Programmatic-page crawlability (optional):** the ~220 `/birthday-cake-for/*` and `/birthday-cake-theme/*` pages are sitemap-discoverable but not in the 2-click nav tree. A lightweight browse hub (e.g. `/birthday-cakes-by-name`) linking them would raise crawl priority. Not built (kept within the max-3-new-pages scope).
5. **"No signup / No login" claim:** if the free tier truly needs no login, we can add it to key titles (Magica uses it; low competition). Confirm the free-tier auth behavior.
6. **AggregateRating in SERP:** competitors surface star ratings. We have `SoftwareApplicationSchema` (4.9★). Consider a review-platform (Trustpilot) profile — research shows ~3× AI-citation probability.

---

## 9. Expected impact per change

| Change | Expected impact |
|---|---|
| India/birthday/how-it-works/graduation meta rewrites | Recover CTR on high-impression pages — e.g. `/india` 4.7% → 8%+ would ≈ **+80 clicks/mo** at current impressions. |
| 5 blog title/meta rewrites | The two 0.7% CTR posts have the most headroom; matching intent should lift them toward 3-5%. |
| SharedCake noindex + sitemap cleanup | Cleaner Search Console coverage; "Crawled/Discovered - not indexed" counts drop over subsequent crawls. |
| AnswerBox + DefinitionBox on 15 pages | More AI-Overview / ChatGPT / Perplexity **citations** (direct answers in top 30% of page); better featured-snippet eligibility. |
| `/3d-cake-designer` expansion (winner) | Defends & extends the #1-3 ranking that drives ~21% of clicks; comparison table + HowTo add citation surface and long-tail capture. |
| 3 new pages | New non-branded entries for low-competition terms; Rakhi is time-sensitive upside for Aug 2026. |
| Footer + RelatedTools + homepage hub | Distributes internal PageRank to tool pages, improves crawl depth, kills orphans → better indexing of the whole tool set. |

---

## 10. Commit log (`git log --oneline overnight-seo-overhaul`)

```
42eb238 Phase 7: internal linking architecture (hub-and-spoke)
2e7fe5f Phase 6: 3 new opportunity pages (eggless, rakhi, anniversary)
e5fddaa Phase 5: blog content upgrades migration (5 low-CTR posts)
22b8ae7 Phase 4: expand /3d-cake-designer (the #1-ranking winner)
eb144de Phase 3: AEO/GEO content overhaul on 15 SEO pages
e917ad9 Phase 0 + 2: research reports + indexing fixes
6b73551 Phase 1: rewrite CTR-disaster meta titles/descriptions
```

**Scope:** 32 files changed, ~1,900 insertions. No pushes to `main`. No DB executed.

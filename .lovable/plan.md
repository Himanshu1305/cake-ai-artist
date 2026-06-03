
# Next steps after Tier 1

Two parallel workstreams: **Tier 2 Party Planner features** (depth) and an **SEO sprint** (reach). The SEO sprint is the bigger near-term win since the site currently surfaces for only ~15 keywords and ranks #13 even for its own brand term "cake ai".

---

## A. Tier 2 Party Planner (deferred work from competitor analysis)

Pick what to ship; not all four are required:

1. **AI vendor suggestions by city** — concierge already knows the city; extend it to suggest 2-3 vendor types per task (bakers, decorators, photographers) with realistic local price ranges. No new infra — prompt change + UI chip on each task.
2. **Quick-start templates** — 5 prebuilt party blueprints (kid birthday, milestone, baby shower, anniversary, corporate) so users don't always go through chat. One-click → seeds tasks + RSVP defaults.
3. **Host countdown reminders** — piggy-back on existing `send-anniversary-reminders` cron: email host at T-14 / T-7 / T-2 / T-0 with overdue tasks + RSVP status.
4. **Co-host invite** — add `party_collaborators` table; second user can edit tasks/guests. Useful but adds auth complexity.

Recommendation: ship **#1 + #2 + #3** as Tier 2. Skip #4 unless users ask.

---

## B. SEO sprint — keyword research & page optimization

### What Semrush shows today (US database)

- Site has **15 indexed keywords**, est. **1 visit/mo**. Ranks #13 for "cake ai" (320/mo, KD 27) and #13 for "birthday cake ai" (50/mo).
- All ranking URLs are the homepage. **Recipes, Party Planner, Gallery, Country pages are not indexed for any tracked keyword.**

### Target keyword map

**Tier A — Brand & core product (own these)**

| Keyword | Vol/mo | KD | Current | Target page |
|---|---|---|---|---|
| cake ai | 320 | 27 | #13 | `/` (homepage) |
| ai cake generator | 90 | 8 | not ranked | `/ai-cake-generator-free` |
| ai cake design | 50 | 8 | #32 | `/free-cake-designer` |
| birthday cake ai | 50 | 10 | #13 | `/ai-birthday-cake-with-name` |
| ai birthday cake | 90 | low | #20 | `/ai-birthday-cake-with-name` |
| cake generator | 70 | low | #79 | `/ai-cake-generator-free` |
| ai cake generator free | 50 | low | #25 | `/ai-cake-generator-free` |
| photo cake | 1,900 | 21 | not ranked | new `/photo-cake-maker` (or repurpose use-cases) |
| personalized cake | 480 | 45 | not ranked | `/` + new `/personalized-cake-online` |

**Tier B — Party Planner page** (currently no rankings)

Primary: `party planner` (3,600/mo, KD 42 — possible). Site won't outrank Partiful/Evite on this term in 6 months, so target the long tail:

| Keyword | Vol/mo | KD note | Page |
|---|---|---|---|
| free party planner | low-med | easy | `/party-planner` |
| ai party planner | very low | very easy | `/party-planner` |
| birthday party planner online | low | easy | `/party-planner` |
| party planning checklist | 1,600 | medium | new section on `/party-planner` |
| party planning template | ~1k | medium | new section / template gallery |
| how to plan a birthday party | high | medium | new blog post |
| free rsvp website | medium | medium | `/party-planner` + landing variant |
| online invitation maker | 1,300+ | medium | new landing or extend `/party-planner` |
| kids birthday party planner | low | easy | `/party-planner` |
| 1st birthday party planner | low | easy | new sub-landing or blog |

**Tier C — Recipes pages** (currently no rankings; each recipe is a separate landing opportunity)

Recipe keywords have realistic difficulty (KD 20-35) and clear intent. Each recipe page needs:

| Sample recipe | Primary keyword | Vol/mo | KD |
|---|---|---|---|
| Chocolate Truffle Cake | chocolate truffle cake recipe | 480 | 30 |
| (variant) | truffle cake recipe | 480 | low |
| (variant) | how to make chocolate truffle cake at home | low-medium | very low |
| Vanilla Sponge | vanilla sponge cake recipe | ~1.6k | medium |
| Red Velvet | red velvet cake recipe | ~6k | medium-high |
| Black Forest | black forest cake recipe | ~3k | medium |
| Carrot Cake | carrot cake recipe | ~40k | high |
| Pineapple Upside-Down | pineapple upside down cake recipe | ~9k | medium |

Each recipe should also target "[recipe name] eggless", "[recipe name] without oven", "easy [recipe name]" long-tails (huge in India market specifically).

---

## C. What to actually build/edit for the SEO sprint

### 1. Recipes pages — `src/pages/RecipeDetail.tsx` + DB
- Add per-recipe **SEO meta**: title (`<H1> recipe — primary keyword`), `meta_description` (already in `cake_recipes` table; populate it for every recipe), `meta_title`.
- Add **`react-helmet-async`** so each recipe sets its own `<title>`, description, canonical, `og:*`, and **Recipe JSON-LD** (schema.org/Recipe with ingredients, instructions, cookTime, prepTime, image, aggregateRating placeholder). Recipe JSON-LD is the single biggest SEO win — it earns rich result snippets in Google.
- Add **BreadcrumbList JSON-LD** (Home → Recipes → Recipe).
- Ensure recipes list page (`/recipes`) has its own title/desc + ItemList JSON-LD.
- Migration: backfill `meta_title` and `meta_description` for all existing recipes (use AI gateway script — see "Backfill script" below).

### 2. Party Planner page — `src/pages/PartyPlanner.tsx`
- Rewrite hero copy to lead with **"Free AI Party Planner — Plan birthdays, baby showers & anniversaries in minutes"**.
- Add a long-tail content section below the fold (collapsed/SEO content): "Party planning checklist", "How to plan a birthday party in 7 steps", "Online invitations & RSVP — free", "Templates by occasion".
- `react-helmet-async`: per-page title/desc/canonical + **WebApplication / SoftwareApplication JSON-LD** + **HowTo JSON-LD** for the checklist section.
- Add internal links to top-performing recipes and `/free-cake-designer`.

### 3. Homepage + key landing pages — `src/pages/Index.tsx`, `AiCakeGeneratorFree.tsx`, `AiBirthdayCakeWithName.tsx`, `FreeCakeDesigner.tsx`, country landings
- Audit current `<Helmet>` usage; tighten title (<60 chars) and description (<160 chars) for each, with **one primary keyword per page** from Tier A.
- Single H1 per page, primary keyword in the first 100 words.
- Add **Organization** + **WebSite** + **SearchAction** JSON-LD on `/` (sitewide is in `index.html` — confirm SearchAction is there).
- Add `/photo-cake` and `/personalized-cake-online` as new landing pages targeting two underserved Tier A terms (high volume, no current ranking).

### 4. Sitemap + technical
- Regenerate `public/sitemap.xml` to include **every published recipe**, every party RSVP landing isn't needed (private), and every country page. Currently the sitemap likely misses dynamic recipe URLs.
- Confirm `robots.txt` allows `/` and excludes `/admin`, `/rsvp/*`, `/party/*` (public party invites — decide: index or not; recommend `noindex` since they're per-user invites).
- Add `<link rel="alternate" hreflang>` between country landing pages.
- Image alt text audit on Recipes and Party Planner (currently many `<img>` lack alts).

### 5. Backfill script (one-off, no UI)
Run a script via the AI gateway to generate `meta_title`, `meta_description`, and keyword-tagged `excerpt` for every recipe that's missing them — then write straight to the `cake_recipes` table.

### 6. Verify in Google Search Console
After deploy, register the new property (or confirm existing), submit the updated sitemap, and request indexing on Recipes index + Party Planner. The Search Console connector can automate verification.

---

## Suggested order

1. **Recipes SEO** (highest ROI — long tail × many pages × low difficulty). Helmet + Recipe JSON-LD + meta backfill + sitemap.
2. **Party Planner SEO** (Helmet + long-tail content section + HowTo JSON-LD).
3. **Tier A landing pages** — tighten copy/meta on `/ai-cake-generator-free`, `/free-cake-designer`, `/ai-birthday-cake-with-name`; add 1-2 new pages (`/photo-cake-maker`, `/personalized-cake-online`).
4. **Tier 2 Party Planner features** (#1 + #2 + #3 from section A).
5. **Search Console verification + sitemap resubmit** to accelerate indexing.

## Out of scope for this plan
- Off-page SEO (backlinks, outreach) — separate effort.
- Paid search.
- Translating the site (could unlock huge IN/UK volume later).

## What I need from you to proceed
1. Approve scope: full sprint (1→5), or SEO-only (1→3 + 5), or Tier 2 features only (skip SEO).
2. Confirm new landing pages (`/photo-cake-maker`, `/personalized-cake-online`) are wanted.
3. Confirm `/party/:slug` public pages should be `noindex` (recommended — they're per-user).

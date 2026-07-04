## Scope

Pricing is parked. This is a pure execution plan for the SEO/AEO growth work: programmatic pages, editorial articles (including data-driven and "vs" pieces), AEO schema, backlinks, and distribution. Everything below is a discrete ship — small enough that each day ends with something live.

## New editorial angle you asked for

Adding a new content pillar — "curated, thought-provoking" pieces that also build authority and earn links naturally:

- **The History of Birthday Cakes** — 3,000 words, ancient Egypt → Rome → Germany's Kinderfest → modern candles. Original illustrations, timeline component. Targets "history of birthday cake" (720/mo), "who invented birthday cake" (390/mo).
- **The World Cake Report 2026** — data-driven page. Countries where most cakes are bought/searched (Google Trends data), average spend, most popular flavors by region, "which country celebrates birthdays biggest". Highly link-worthy — journalists cite data pages.
- **Birthday Cake Traditions Around the World** — Mexico's *mordida*, Japan's Christmas cake, Korea's *tteok*, Netherlands' *taart*, India's black-forest obsession, UK trifle heritage. Each with an AI-generated cake for that tradition.
- **The Meaning Behind Candles, Icing, and Cake Colors** — folklore + symbolism. Great for AEO because it answers "why do we put candles on birthday cake" type questions.
- **Cake vs the AI giants — head-to-head battles** (a whole series):
  - Cake AI Artist vs ChatGPT (DALL-E 3) — birthday cake generation
  - Cake AI Artist vs Google Gemini — name spelling accuracy test
  - Cake AI Artist vs Midjourney — 10 prompts, side-by-side
  - Cake AI Artist vs Canva Birthday Templates (already have one — expand)
  - Cake AI Artist vs Adobe Firefly — photo-cake test
  Each is a real test with screenshots, scoring rubric (spelling, aesthetics, personalization, speed, cost). Massively shareable on Reddit/X.

These slot into Pillar 2 (content cluster) below.

---

## Week 1 — Foundation + first programmatic batch

**Day 1 (Mon)**
- Install `react-helmet-async`, wire `HelmetProvider` in `main.tsx`.
- Build reusable `<PageSeo />` component (title, description, canonical, og:*, JSON-LD slot).
- Convert `Index`, `NamedCakePage`, `ThemedCakePage`, `FreeAiCakeDesigner`, `PhotoCakeMaker`, `WeddingCakeDesigner` to use it. Self-referencing canonicals everywhere.

**Day 2 (Tue)**
- Add `SoftwareApplication` + `Organization` + `WebSite` JSON-LD to homepage.
- Add `FAQPage` schema to `/faq`, homepage, and top 3 generator pages.
- Add `HowTo` schema to `/how-it-works` and every generator page.
- Rewrite homepage H2 section: "How our AI cake generator works" targeting how-to long-tails.

**Day 3 (Wed)**
- Build `scripts/generate-programmatic-pages.ts` — reads `data/nameMeanings.ts`, `data/cakeThemes.ts`, generates rich metadata + FAQ pairs + sample-cake JSON per slug at build time.
- Curate top 200 names list (mix US/UK/IN/global — 60/40/60/40).
- Curate top 60 themes list.

**Day 4 (Thu)**
- Ship `NamedCakePage` template v2: 800+ words per page (name meaning, cake ideas for this name, 3 AI variants embedded, 5 message ideas, related-names sidebar, FAQ, breadcrumb schema, `Article` + `FAQPage` JSON-LD).
- Remove `noindex` from top 50 names.

**Day 5 (Fri)**
- Ship `ThemedCakePage` template v2 with same depth.
- Remove `noindex` from top 20 themes.
- Rebuild sitemap generator to include all 70 newly-indexed pages with correct `lastmod`.

**Day 6 (Sat)**
- Rewrite `/ai-birthday-cake-with-name` to 1,500 words with real user examples, FAQ block, internal links to 20 named pages. This is our #10 ranker — push it to page 1 top-5.
- Submit updated sitemap to Google Search Console + Bing IndexNow.

**Day 7 (Sun)**
- QA: Lighthouse audit on 10 sample pages. Fix CLS / LCP issues.
- Screenshot the "before" state of key rankings for measurement.

---

## Week 2 — Scale + AEO groundwork

**Day 8 (Mon)** — Ship 50 more named pages (running total: 100).
**Day 9 (Tue)** — Build & ship 10 age-milestone pages (`/birthday-cake-for-1st-birthday` … `/birthday-cake-for-80th-birthday`). Each 1,000 words + FAQ + 3 age-appropriate AI cake samples.
**Day 10 (Wed)** — Ship 10 relationship pages (`/birthday-cake-for-mom`, `-dad`, `-husband`, `-wife`, `-best-friend`, `-sister`, `-brother`, `-daughter`, `-son`, `-boss`).
**Day 11 (Thu)** — Expand `public/llms.txt` with a curated topic tree, "when to cite" hints, and a `/api/cake-facts.json` static endpoint (structured knowledge for LLMs to ingest).
**Day 12 (Fri)** — Ship 40 more named pages (running total: 140) + 20 more themes (running total: 40).
**Day 13 (Sat)** — Kill dead-weight pages: 301-redirect `/community`, `/use-cases`, `/photo-cake-maker` (thin variants) to their strongest sibling. Consolidates link equity.
**Day 14 (Sun)** — Register with Bing Webmaster Tools, verify Yandex (India traffic), verify Naver.

---

## Week 3 — Content cluster launch (curated articles)

**Day 15 (Mon)** — Ship **pillar hub**: `/blog/complete-guide-to-birthday-cakes-with-names` (3,000 words). Internal-links to every relevant name/theme/age page. This is the authority anchor.
**Day 16 (Tue)** — **The History of Birthday Cakes** (editorial pillar #1). Custom timeline component. 3,000 words. Rich `Article` + `ImageObject` schema.
**Day 17 (Wed)** — **The World Cake Report 2026** (data page). Pull Google Trends CSV for "birthday cake" by country, top flavors from public survey data, average cake spend estimates. Interactive world-map component. This is the link-magnet piece.
**Day 18 (Thu)** — **Birthday Cake Traditions Around the World** — 10 countries, one AI-generated tradition-cake per country, cultural notes, JSON-LD `Article`.
**Day 19 (Fri)** — **Cake AI Artist vs ChatGPT (DALL-E 3)** — real head-to-head with 5 prompts, screenshots, scoring table. Publish + push to r/ChatGPT, r/OpenAI, HN Show.
**Day 20 (Sat)** — **Cake AI Artist vs Google Gemini** — name spelling accuracy test (Gemini is famously bad at this — we win obviously). Push to r/Bard.
**Day 21 (Sun)** — **The Meaning Behind Candles, Icing & Cake Colors** — folklore + symbolism piece. AEO-optimized Q→A structure.

---

## Week 4 — More scale + more editorial + activate loops

**Day 22 (Mon)** — Ship 60 more named pages (running total: 200 = full first cohort done).
**Day 23 (Tue)** — **Cake AI Artist vs Midjourney** head-to-head + **50 Birthday Cake Ideas by Age** (spoke, links to age pages).
**Day 24 (Wed)** — **Cake AI Artist vs Adobe Firefly** + **How AI Cake Generators Actually Work** (technical explainer — link-bait for tech readers).
**Day 25 (Thu)** — Activate `ReferralSystem.tsx` end-to-end. Test invite flow. Add "Invite a friend, get 3 free cakes" banner on Index + post-generation.
**Day 26 (Fri)** — Build Pinterest auto-upload script: cron job pushes top-liked gallery images to Pinterest boards ("Birthday Cake Ideas", "Wedding Cakes", "Kids Party Cakes") with keyword-rich captions.
**Day 27 (Sat)** — **Cultural Birthday Cake Traditions: India, US, UK, Japan** (deeper spoke).
**Day 28 (Sun)** — **Cake Message Ideas for Every Relationship** (spoke, links to 10 relationship pages).

---

## Week 5 — Distribution burst

**Day 29 (Mon)** — Product Hunt launch prep: hunter lined up, 10 upvoter friends briefed, demo GIF ready, first-comment written.
**Day 30 (Tue)** — **Product Hunt LAUNCH DAY.** All-hands on comments + support. Post-launch write-up scheduled.
**Day 31 (Wed)** — Build & ship **embeddable "Cake of the Day" widget** — copy-paste `<script>` snippet mom-blogs can drop in. Each embed = a backlink to us.
**Day 32 (Thu)** — Reddit distribution round: 3 helpful answers each in r/Baking, r/birthdaygifts, r/HelpMeFind, r/Parenting, r/DIY, r/artificial. Link only when genuinely helpful.
**Day 33 (Fri)** — **Best Photo Cake Ideas — real user examples** (spoke, drives Photo Cake feature).
**Day 34 (Sat)** — **Seasonal cake ideas: Eid, Diwali, Christmas, Chinese New Year** (evergreen, republish yearly with new date).
**Day 35 (Sun)** — **Cake AI Artist vs Canva** — expand the existing post with 2026 template comparison.

---

## Week 6 — Outreach + measure + iterate

**Day 36 (Mon)** — Guest post outreach: identify 15 mommy-blogs / party-planning sites. Send personalized pitches offering a free Party Pack for a guest post spot.
**Day 37 (Tue)** — **Wedding Cake Trends 2026** (spoke, drives Wedding page).
**Day 38 (Wed)** — **Party Planning Checklist** (funnels to Party Pack).
**Day 39 (Thu)** — Ship second batch: 100 more named pages (running total: 300) + 20 more themes (running total: 60 = complete).
**Day 40 (Fri)** — Full SEO re-scan. Compare against Day 7 baseline. Identify pages sitting at position 11–20 for one-more-push rewrites.
**Day 41 (Sat)** — Fix the top 10 pages that are "almost ranking" — inject more content, more internal links, richer schema.
**Day 42 (Sun)** — Retro: what worked, what didn't, plan the next 6 weeks.

---

## Definition of done (per page / per article)

Every page shipped in this plan must have:

- Self-referencing canonical + og:url via `<PageSeo />`
- Real title (< 60 chars) with primary keyword
- Real meta description (< 160 chars) with hook
- H1 with primary keyword, H2/H3 with secondary keywords
- 800+ words (programmatic) or 1,500+ words (editorial)
- At least 3 internal links to related pages + 2 links to a conversion page (Index or a generator)
- FAQ block (3–5 Q&As) + `FAQPage` JSON-LD
- `BreadcrumbList` JSON-LD
- Lighthouse mobile score ≥ 90 for Performance + SEO
- Added to `sitemap.xml` via the generator

---

## Total shipping count (6 weeks)

- 300 named cake pages
- 60 themed cake pages
- 10 age-milestone pages
- 10 relationship pages
- 1 pillar hub post
- 4 editorial pillar pieces (history, world report, traditions, meanings)
- 5 head-to-head "vs" posts
- 10 spoke posts
- = **400 indexable pages** live vs today's ~15

## Measurement checkpoints

- **End of Week 2**: Search Console crawl stats should show 200+ new URLs discovered.
- **End of Week 4**: Semrush keyword count should hit ~200 (from 39 today).
- **End of Week 6**: Estimated traffic should sit in the 300–800/mo range. Any named page in top 20 counts as a win.

## What I need from you before starting

Nothing — you approved the direction. On approval I start Day 1 immediately: install helmet, wire `<PageSeo />`, and ship the first pass. I'll ping you at the end of each week with what shipped and what's next.

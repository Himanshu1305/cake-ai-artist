# Cake AI Artist — Growth Sprint Plan (SEO + Conversion + Content)

A 2-week sprint with three coordinated tracks: **fix what's almost ranking**, **convert traffic into paying customers**, and **publish content that captures every variation of intent**. All content is written like a real human wrote it — never AI-flavored.

---

## TRACK 1 — SEO: fix existing pages + build new ranking pages

### 1.1 Homepage rewrite (highest ROI — you're already at #13 for "cake ai")
**File:** `index.html`, `src/pages/Index.tsx`

- **`<title>`**: `Cake AI — Free AI Birthday Cake Generator | Cake AI Artist`
- **`<meta name="description">`**: ~155 chars naturally using "cake AI", "AI birthday cake", "free AI cake generator"
- **H1**: `Cake AI — Design a Personalized Birthday Cake in 30 Seconds` (was generic)
- **Above-the-fold paragraph** (60–80 words) using primary phrases naturally
- **Sitewide internal link anchors** standardized to "cake AI" / "AI birthday cake generator" instead of "click here" / "try it"

### 1.2 Fix country landing pages (they cannibalize each other right now)
**Files:** `IndiaLanding.tsx`, `UKLanding.tsx`, `USALanding.tsx`, `AustraliaLanding.tsx`, `CanadaLanding.tsx`

Each needs a unique H1, unique meta, unique 200-word intro. Right now they read too similarly — Google picks one and ignores the rest. Localize copy (UK: "birthday cake"; US: "ai cake designer"; India: "₹ pricing, cake delivery context"; etc.).

### 1.3 Three new SEO landing pages
**New files:**
- `/ai-cake-generator-free` → targets "ai cake generator free" (you're #25) + "ai cake" (210/mo, #50)
- `/3d-cake-designer` → targets "3d cake designer free online" (210/mo, #36)
- `/ai-birthday-cake-with-name` → targets "ai birthday cake" (90/mo, #20) + "birthday cake ai" (#13) + long-tail "ai birthday cake with name"

Each page: unique H1, 700–1000 words, 6-cake sample gallery, FAQ schema, single CTA to the generator, internal links to/from homepage and blog.

### 1.4 Audit + ship JSON-LD schema everywhere
**Files:** `SEOSchema.tsx`, `index.html`, blog routes

- Verify `FAQSchema` actually emits on homepage (you have `HomepageFAQ` content but I need to confirm the schema fires)
- Add `Product` schema with `aggregateRating` on `/pricing` (eligible for star ratings in Google)
- Add `BreadcrumbList` schema on all non-homepage routes
- Add `HowTo` schema on the new `/ai-cake-generator-free` page
- Add `SoftwareApplication` schema to homepage

### 1.5 Technical SEO cleanup
- **`sitemap.xml`**: add new landing pages, blog posts, country pages; set proper `lastmod`
- **`robots.txt`**: confirm no accidental disallows
- **Canonical audit**: each country page must self-canonical (not all pointing to `/`)
- **Image alt text**: audit hero cakes, gallery images, blog images — currently many are decorative `alt=""` when they should describe the cake (Google Images traffic opportunity)
- **Internal linking map**: every blog post → 2 product pages + 2 related blogs; every country page → blog + pricing

---

## TRACK 2 — Conversion: get paying customers from existing traffic

You're losing every visitor who isn't ready to pay in the first 30 seconds. Fix the funnel timing.

### 2.1 Reduce signup friction
**Files:** `Index.tsx`, `CakeCreator.tsx`, `Auth.tsx`

- Homepage CTA changes from any "Sign Up" wording to **"Design Your Cake Free →"**
- Generate first cake **with zero signup** (use anonymous session, store cake locally)
- Signup only requested when user wants to **save / download / share** their cake — they're now emotionally invested

### 2.2 Smart upgrade triggers (right moment, not every moment)
**Files:** `CakeCreator.tsx`, `GenerationLimitTracker.tsx`, new `UpgradeMomentModal.tsx`

- **After cake #2**: tiny inline banner *"3 cakes left in your free plan"*
- **After cake #4**: full-card promo with their just-generated cake — *"One cake left. Unlock unlimited HD cakes for [local price]"*
- **After cake #5 (limit hit)**: hard paywall modal showing their cake **blurred** behind it with single CTA to pricing; no dismiss-without-decision option (use exit button + ESC, not a sneaky close)
- Show **local currency only** + the exact deliverable ("Unlimited HD cakes + Party Pack + Commercial use")

### 2.3 Pricing page rebuild for trust-first decision
**File:** `Pricing.tsx`, `PricingPlans.tsx`

Reorder above-the-fold to: **(1) Testimonials with photos → (2) Live activity counter → (3) Money-back guarantee badge → (4) Pricing table → (5) FAQ**.

- Add a **7-day refund guarantee badge** (genuine, easy to honor for digital goods)
- Move 3 strongest testimonials above the pricing table
- Use `LiveActivityFeed` above pricing — *"Cakes designed this week"*
- Add a comparison row: *"Vs hiring a designer: ₹X. Vs Cake AI Artist: ₹Y"*
- Sticky mobile CTA: *"Get Unlimited for [local price]"*

### 2.4 Abandoned-checkout recovery (highest-impact backend change)
**New edge function:** `supabase/functions/abandoned-checkout-recovery/index.ts`

Trigger: a Razorpay order is created but no successful webhook arrives within **60 minutes**.

Action: send a single email via Brevo with:
- Their generated cake image attached
- One-time 15% discount code valid for 24 hours
- Direct re-checkout link with code pre-applied

Schedule via Supabase cron (`pg_cron`) running every 15 minutes.

### 2.5 Exit-intent on pricing page only
**File:** `Pricing.tsx` + `ExitIntentModal.tsx`

Verify exit-intent fires on `/pricing` specifically (not blog). Offer is **first-time-only** (track via `localStorage`): *"Wait — here's 20% off your first month"*. Don't show to repeat dismissers.

### 2.6 Welcome email upgrade nudge
**File:** `supabase/functions/send-welcome-email/index.ts`

Existing welcome email goes out on signup. Add a **second email at +48 hours** to free users who haven't upgraded — show 3 cake examples from premium users + soft CTA. Skip if they've already paid.

---

## TRACK 3 — Content: blogs + listicles (humanized, not AI-flavored)

### Content voice rules (applied to every post)
- First-person occasional asides ("Honestly, I tried this with my niece's name and it worked first try")
- Contractions everywhere (it's, don't, you're)
- Short sentences mixed with long. No rhythm uniformity.
- Specific small details ("My mom's friend Geeta…" not "A user reported…")
- **Banned phrases**: "delve into", "in today's fast-paced world", "unleash", "elevate", "game-changer", "in conclusion", "moreover", "furthermore", em-dash overuse, perfectly balanced 3-item lists in every paragraph
- One genuine opinion per post (even a small one)
- Acknowledge real flaws of AI cake design — builds trust

### 3.1 Listicle (Week 1 priority — captures "best ai cake" intent)
**`/blog/best-ai-cake-generators-2026`**

Honest comparison of 6–8 tools: Cake AI Artist, cake.ai, cakeai.app, generic Midjourney prompt, DALL-E, Canva AI, etc. Cake AI Artist ranks #1 with genuine reasons (occasion-aware, name spelling, local pricing). Each tool gets pros + 1 honest con. ~1800 words. Captures "best ai cake generator", "best ai cake designer", "ai cake generator comparison".

### 3.2 High-intent how-to (Week 1)
**`/blog/how-to-design-a-birthday-cake-online-free`**

Step-by-step with screenshots. Targets long-tail commercial intent. Internal-links aggressively to homepage and `/ai-cake-generator-free`.

### 3.3 Occasion-specific posts (Week 2 — broad keyword net)
- `/blog/ai-anniversary-cake-ideas`
- `/blog/ai-baby-shower-cake-designs`
- `/blog/ai-wedding-cake-designs`
- `/blog/ai-cake-for-kids-birthday`

Each ~1200 words, 6-cake gallery, FAQ schema, internal links to homepage and pricing.

### 3.4 Geo-targeted post per country (Week 2)
- `/blog/best-birthday-cake-ideas-india` (₹ context, Indian names, Diwali/festivals)
- `/blog/birthday-cake-ideas-uk` (£, British names, UK occasions)
- Same pattern for US, AU, CA

Each gets a country-specific testimonial + currency mentions naturally. Boosts the country landing pages via internal linking.

### 3.5 Comparison post (high commercial intent)
**`/blog/ai-cake-vs-real-bakery-cost-comparison`**

Real numbers, real photos. *"I ordered a custom cake from 3 bakeries vs designed 3 with AI — here's what happened"*. Shareable, builds trust, captures price-shoppers.

### 3.6 SEO content for every blog post
- Unique `<title>` + meta description via `react-helmet-async`
- `Article` + `BreadcrumbList` JSON-LD
- Author byline (use `AuthorByline.tsx`)
- Hero image with descriptive `alt`
- 2–3 internal links to product pages
- 1 internal link to another blog post
- Final CTA: *"Design your own in 30 seconds →"*

---

## Implementation order (what gets built first)

### Week 1 — Ranking foundations + first revenue lift
1. Homepage rewrite (Track 1.1) — 2 hrs
2. Pricing page rebuild + 7-day guarantee (Track 2.3) — 3 hrs
3. Smart upgrade triggers + paywall at cake #5 (Track 2.2) — 4 hrs
4. Listicle: best AI cake generators (Track 3.1) — 3 hrs
5. Abandoned-checkout email (Track 2.4) — 3 hrs
6. JSON-LD schema audit + fixes (Track 1.4) — 2 hrs

### Week 2 — Content scale + funnel polish
7. New landing pages × 3 (Track 1.3) — 5 hrs
8. Country landing page differentiation (Track 1.2) — 3 hrs
9. Anonymous-first cake generation (Track 2.1) — 4 hrs
10. Occasion blog posts × 4 (Track 3.3) — 4 hrs
11. Geo-targeted blog post × 1 (Track 3.4) — 1 hr (template for rest)
12. Welcome email upgrade nudge (Track 2.6) — 2 hrs
13. Technical SEO cleanup (Track 1.5) — 2 hrs

Total: ~40 build hours across both weeks.

---

## What I'm NOT doing (intentional)

- **No paid ad spend recommendations.** Fix conversion + organic first.
- **No subscription management UI** (per memory rule).
- **No homepage redesign.** Visuals are fine; problem is copy + funnel timing.
- **No new product features.** Every new feature delays the revenue work.
- **No hardcoded USD pricing anywhere** (per memory rule).
- **No fake urgency** ("only 3 spots left!") — generic urgency only.

---

## Honest expectations

- **Rankings**: Google needs 2–6 weeks to re-crawl and re-rank. Homepage rewrite usually moves 3–8 spots within 4 weeks. New landing pages: 6–12 weeks to start ranking.
- **Conversion fixes**: ship-day impact. Abandoned-checkout email alone typically recovers 8–15% of dropped carts.
- **Content**: 1–2 posts won't move the needle; the 6–8 posts in this sprint create a content cluster Google starts trusting at week 4–6.
- **Realistic 60-day outcome**: ~50–200 organic visits/mo + measurable first cohort of paying customers from the conversion fixes (which work on direct + social traffic immediately).

---

## What I need from you

Just reply **"go"** and I'll start with Week 1 in the order listed. I'll ship one or two items per build session and check in before the next batch.

If you want to reorder priorities (e.g., "do all the content first" or "skip the listicle"), tell me what to change and I'll adjust before starting.
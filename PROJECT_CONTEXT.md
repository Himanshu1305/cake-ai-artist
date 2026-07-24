# Cake AI Artist — Project Context

**Read this before diagnosing any bug. Update it after fixing anything non-obvious.**

Exhaustive reference lives in `docs/SURVEY.md` (~1,930 lines: all 51 routes, 49 pages,
76 components, 36 edge functions, 41 tables, theme tokens). This doc is the short version —
the things that actually cause confusion.

Scale check: 51 routes · 49 pages · 76 components · 36 edge functions · 41 tables.

---

## 1. Stack & deployment

React + TypeScript + Vite + Tailwind + shadcn/ui · Lovable Cloud (Supabase) ·
Razorpay · Brevo (marketing) + Resend (transactional) · Lovable AI Gateway → Gemini

Repo `github.com/Himanshu1305/cake-ai-artist` · Supabase ref `ozgghjbvhveswqplzegd`

**Deploy:** push to `main` → Lovable auto-builds → 2–4 min. Always verify a *behavioural*
change after deploying, not just that the page loads.

**Local build is impossible.** `node_modules` is absent; `vite build` fails. `npx tsc --noEmit`
works (fetches TS on demand) and is the only local gate.

**New edge functions are NOT deployed by a git push** — they must be deployed explicitly.
A function in the repo but missing from the Edge Functions list has never been deployed.

**Lovable pushes to `main` independently.** Rejected push → `git pull --rebase origin main && git push`.
If Lovable already fixed the same thing, `git rebase --skip`.

---

## 2. Live bugs found by survey — not yet fixed

Ordered by user impact.

**2.1 Exit modal shows USD to non-US visitors on ~13 pages**
`ExitIntentModal` takes `country`, defaulting to `'US'`, and silently falls back to USD for any
unmapped value. The 5 country landings and `Index.tsx` pass region correctly — but these pass a
literal `country="US"` and read no geo at all:
`EgglessCakeDesign:267` · `WeddingCakeDesigner:271` · `PhotoCakeMaker:271` · `PersonalizedCakeOnline:266`
· `EidCakeDesigner:260` · `AiBirthdayCakeWithName:196` · `RakhiCakeIdeas:267` · `Recipes:229`
· `AiCakeGeneratorFree:231` · `ThreeDCakeDesigner:322` · `AnniversaryCakeDesigner:267`
· `GraduationCakeDesigner:258` · `PartyPlanner:494`
→ An Indian visitor sees "$49 lifetime" on those pages while the footer and pricing page show ₹.

**2.2 Pricing has drifted between hardcoded tables**
Three independent copies: `PricingPlans.tsx:20-47` · `ExitIntentModal.tsx:34-47` ·
FAQ pages (`FAQ.tsx:20-23`, `PremiumComparison.tsx:9`, inline in landings).
**Confirmed live inconsistency:** US yearly is `$29` everywhere except `USALanding.tsx:191`
which states **"$19.99/year"** in an FAQ answer.

**2.3 Lifetime-only users are treated as non-premium on ~15 pages**
Only `PartyPlanner.tsx:316` and `usePartyPackAccess.ts:47` check `is_premium || lifetime_access`.
Everywhere else checks `is_premium` alone. `Admin.tsx:714-718` sets both together, so this may not
trigger today — but any grant path that sets only `lifetime_access` breaks premium for that user.

**2.4 Social proof numbers are copy-pasted across ~25 files and already inconsistent**
`4.9` / `2847` almost everywhere, but `PartyPlanner.tsx:133` uses `4.8` / `1240`, and
`EgglessCakeDesign.tsx:174` says "20+ occasions". Changing the marketing number means editing
~25 files.

**2.5 Swallowed errors hide real failures**
`generate-blog-post:393,514` (blog-image dedup) · `generate-complete-cake:786,873` (background
vendor message) · `send-reengagement-sequence:276,336,400` (per-recipient send reason discarded).

---

## 3. Gotchas that have cost real time

### 3.1 StickyMobileCTA — the mobile CTA trap *(cost ~2 hours, 4 wrong fixes)*
`src/components/StickyMobileCTA.tsx`
- The **only genuinely mobile-only component** in the codebase (`md:hidden`, fixed bottom bar).
- Renders a `<Link>` → an `<a>`. **Long-pressing it shows browser link options** — that is the
  fingerprint that you are touching this, not a hero `<Button>`.
- Its `href` defaulted to `/` and no consumer passed one → tapping navigated to the page you were
  already on. **Fixed:** default is now `/free-ai-cake-designer?ref=sticky_mobile`.
- Mounted with no props by: `IndiaLanding:751` · `UKLanding:809` · `USALanding:673` ·
  `CanadaLanding:504` · `AustraliaLanding:569` · `Pricing:214`.
- **`Index.tsx` does NOT mount it** — which is why grepping `Index.tsx` found nothing and sent
  the investigation down the wrong path for hours.

### 3.2 Geo-redirect changes which page you are actually on
`GeoRedirectWrapper.tsx` — an India-based user visiting `/` lands on `/india`. "The homepage"
for you is `IndiaLanding.tsx`, **not** `Index.tsx`. Confirm which component renders before
grepping. Admin accounts bypass geo-redirect; `?noredirect=true` also bypasses.

### 3.3 Anchor CTAs vs Button CTAs — matters for debugging
Anchor CTAs navigate natively even if JS fails. `<Button onClick={navigate()}>` depends on the
handler firing. When a CTA "does nothing", identify which type it is first.
- **Anchor-CTA components:** StickyMobileCTA, Footer, RelatedTools, BlogCTABox, PopularCakesSection,
  RecipesNavDropdown, CountryBlogFeed, CountryRecipesSection, PostShareUpgradeModal,
  LocalVendorResults, EmbeddableGalleryWidget.
- **Anchor-CTA pages:** About, HowItWorks, UseCases, Privacy, Advertising, Blog, NotFound,
  SharedCake, Recipes, NamedCakePage, ThemedCakePage, PartyPlanner (logged-out),
  AustraliaLanding + CanadaLanding (final CTA only).
- Everything else — the interactive tool pages, admin, CakeCreator — uses `<Button>` + `navigate()`.

### 3.4 Razorpay
- Subscription rows are created at status `created` **before** payment. `created` ≠ paid.
  Verify `active` / payment `captured` in the Razorpay dashboard before granting premium manually.
- The webhook was once **disabled** while a different project's (bornclock.com) stayed enabled →
  users paid, premium never granted. If premium isn't being granted, check
  Razorpay → Settings → Webhooks **first**.
- Correct URL: `https://ozgghjbvhveswqplzegd.supabase.co/functions/v1/razorpay-webhook`
- Plan IDs are hardcoded in `create-razorpay-subscription/index.ts` and must match the dashboard.

### 3.5 AI model IDs
When Google promotes a Gemini model preview → GA, the `-preview` suffix is dropped and the old ID
returns **403**. This caused a 100% generation outage.
- All IDs live in `supabase/functions/_shared/ai-models.ts`. **Never hardcode.**
- `scripts/check-model-ids.sh` fails if a raw model string appears elsewhere.
- `generate-complete-cake` walks `IMAGE_FALLBACK_CHAIN` on 403 / model-shaped 400.
  Does **not** fall back on 402 (credits) or 429 (rate limit) — terminal.

### 3.6 Auth is fully decentralised
~60 independent `supabase.auth.*` call sites; no auth context. Every page checks for itself.
Login navigates directly after `signInWithPassword` — do **not** reintroduce navigation inside
`onAuthStateChange` for email/password (caused a race where login "succeeded" but the user stayed
logged out). OAuth still navigates via the listener; it has no other entry point.

---

## 4. Debugging playbook

**The rule, learned the hard way:** if two fixes produce no observable change, the premise is
wrong. Stop fixing. Re-identify the element.

1. **Which page actually renders?** Geo-redirect means `/` may be `/india`.
2. **Which element is actually tapped?** Long-press on mobile: link options = `<a>`/`<Link>`;
   text selection = `<button>`. Cross-reference §3.3.
3. **Is it a mobile-only component?** `StickyMobileCTA` is the only one. Check it early on any
   "works on desktop, dead on mobile" report.
4. **Is the change deployed?** Verify a behavioural difference. Old behaviour after a push =
   stale bundle; stop shipping more fixes into the void.
5. **Check prop defaults.** Three components silently default to `US`/no-op (§2.1, §8 of survey).

```bash
grep -rn "ComponentName" src/ --include="*.tsx"   # who mounts it, with what props
bash scripts/check-model-ids.sh                    # hardcoded model IDs (should be silent)
git diff <sha> HEAD -- src/pages/Index.tsx         # what changed
npx tsc --noEmit                                   # the only working local gate
```

In-browser, for "element does nothing":
```javascript
const b = [...document.querySelectorAll('a,button')]
  .find(x => x.textContent.includes('PARTIAL LABEL'));
const r = b.getBoundingClientRect();
console.log(b.tagName, b.getAttribute('href'), r);
console.log('element at centre:', document.elementFromPoint(r.left+r.width/2, r.top+r.height/2));
```

---

## 5. Key facts

**Pricing — source of truth is `PricingPlans.tsx` `PRICING`** (but see §2.2 for drift)
IN ₹299/₹1,999/₹2,999 · GB £4.99/£29/£49 · CA C$6.99/C$39/C$69 · AU A$7.99/A$49/A$79 · US $4.99/$29/$49

**Limits** — free: 5 lifetime + `bonus_generations` from referrals · premium: 150/yr · admin: 500/yr.
Enforced client-side in `CakeCreator.tsx` **and** server-side in `generate-complete-cake`
(5 free → 403; 10 requests/5 min → 429). The 150/yr premium cap is **client-only**.

**RLS is applied to all 41 tables.**

**Key tables:** `profiles` (is_premium, lifetime_access, country, bonus_generations) ·
`generated_images` (featured, featured_pages[], occasion_type) · `public_featured_images` (view) ·
`cake_generation_jobs` (hero/side/top_url, request_id unique) · `generation_tracking` ·
`generation_rate_limits` · `subscriptions` · `blog_posts` · `cake_recipes` · `user_occasions` ·
`referral_bonuses` · `email_sequence_log` · `client_errors` · `vendor_search_usage` · `user_roles`

**Big files:** `CakeCreator.tsx` ~3,400 lines · `Index.tsx` ~1,200 · `PartyPlannerDetail.tsx` ~1,900

---

## 6. Fix history

| Date | Issue | Root cause / fix |
|---|---|---|
| Jul 24 | Mobile CTA dead (4 wrong fixes first) | `StickyMobileCTA` href defaulted to `/`; mounted only on country landings, not `Index.tsx` |
| Jul 23 | Low CTR on high-impression pages | Meta rewrites ×4 pages + 5 blog posts; AEO answer/definition blocks on 15 pages |
| Jul 23 | 250 pages not indexed | `noindex` on `/cake/:id`; 7 bad sitemap URLs removed |
| Jul 15 | Users paid, no premium | Razorpay webhook disabled; a different project's webhook was the live one |
| Jul 15 | Free users blocked after 2–3 cakes | `totalGenerations` summed yearly **and** monthly rows → added `.is("month", null)` |
| Jul 14 | Login "succeeded" but stayed logged out | `setTimeout` nav race → navigate directly after `signInWithPassword` |
| Jul 13 | Anyone could spam Brevo list | Added auth/secret check + IP rate limiting to `add-contact-to-brevo` |
| Jul 12 | 100% generation outage (403) | Stale model IDs → centralised in `_shared/ai-models.ts` + fallback chain + lint guard |
| Jun | Exit modal shown to premium users | Modal mounted before auth resolved → gated on `authChecked` |

---

## 7. Open items

**Decisions pending**
Hero declutter + font-contrast audit (analysis done, unimplemented — biggest UX win) ·
browse-hub for ~220 programmatic `/birthday-cake-for/*` pages (likely most of "Discovered –
not indexed") · Trustpilot for SERP stars (needs ~25 reviews) · migration off Lovable Cloud
(feasible; main coupling is the AI gateway key)

**Manual actions outstanding**
Request-indexing list in `docs/reports/request-indexing-list.md` (max 10/day) ·
daily 9am cron for `send-reengagement-sequence` · confirm `grant-referral-bonus` is deployed

**Growth backlog (researched, not started)**
Pinterest · weekly Reels · bakery embed widget · WhatsApp share-message copy ·
community posting · GA4 + Ads conversion tracking **before** any paid spend

---

## 8. Maintenance protocol

**Update this doc when:** a bug takes >20 min to locate · a new gotcha is found · a footgun in
§2 is fixed (move it to §6) · architecture changes.

**Add to §6 in this shape** — root cause, not just symptom:

```
| Date | Symptom as the user reported it | Actual root cause + the fix |
```

**If it took more than two attempts, add a §3 entry** with the fingerprint that would have
identified it faster. That is the part that saves time next round.

**Use it in prompts:** start debugging prompts with *"Read `PROJECT_CONTEXT.md` first."*
Section 4 step 2 alone would have caught the StickyMobileCTA bug in minutes.

**Keep it short.** `docs/SURVEY.md` is the exhaustive reference; this is the working memory.
A doc nobody reads is worse than no doc.

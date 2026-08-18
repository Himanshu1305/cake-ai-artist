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

## 1a. Migration Status (Lovable Cloud → new Supabase) — IN PROGRESS

Migrating off Lovable Cloud onto a self-owned Supabase project.

- **New Supabase project:** `gadiwsbvbycfygsaizja` (Mumbai, `ap-south-1`).
  New functions base URL: `https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/…`
- **Old project (still live):** `ozgghjbvhveswqplzegd`.
- **Census:** `docs/reports/function_census.md` — 36 folders → **34 to deploy, 2 DEAD skipped**
  (`test-premium-email`, `test-weekly-digest` = manual QA harnesses).

**Functions to deploy (LIVE):** add-contact-to-brevo · analyze-cake-photo · analyze-cake-text ·
cake-generation-watchdog · cancel-razorpay-subscription · check-payment-status ·
create-razorpay-order · create-razorpay-subscription · delete-user-account · detect-country ·
generate-blog-post · generate-complete-cake · generate-invite-artwork · generate-invite-copy ·
generate-logo · generate-party-pack · generate-vendor-message · grant-referral-bonus ·
party-planner-chat · razorpay-webhook · save-cake-audio · save-image-to-storage ·
search-local-vendors · send-anniversary-reminders · send-engagement-drip · send-party-invite ·
send-premium-emails · send-reengagement-sequence · send-vendor-email · send-weekly-blog-digest ·
send-weekly-upgrade-nudge · unsubscribe-blog · verify-razorpay-payment · **send-welcome-email**
(⚠️ deploy but confirm trigger — no invoke site in code; see census).

**Secrets needed on new project** (set via `supabase secrets set`):
RAZORPAY_KEY_ID · RAZORPAY_KEY_SECRET · GOOGLE_PLACES_API_KEY · CRON_SECRET · TEST_EMAIL_SECRET ·
BREVO_API_KEY · RESEND_API_KEY · SUPABASE_URL · SUPABASE_ANON_KEY · SUPABASE_SERVICE_ROLE_KEY · **GEMINI_API_KEY**.
(`LOVABLE_API_KEY` is NO LONGER USED as of Phase A — all AI calls go direct to Gemini via `GEMINI_API_KEY`.)

**Code that still points at the old stack** (report only, not yet fixed):
- Hardcoded old ref `ozgghjbvhveswqplzegd` in **email logo URLs** — `send-premium-emails`
  (6×: L424,556,658,876,974,1086) and `send-welcome-email` (2×: L23,111). Storage must be
  migrated or these hotlink the old project.
- ~~Lovable AI gateway in 10 functions~~ — **DONE (Phase A)**: all now call the direct Google
  Gemini API via `supabase/functions/_shared/gemini-client.ts`.
- ~~`LOVABLE_API_KEY` in those 10 functions~~ — **DONE (Phase A)**: removed; `GEMINI_API_KEY` used.
- Razorpay webhook URL (§3.4) is hardcoded to the old ref in the Razorpay dashboard — repoint.

**Cron schedules do NOT deploy with the code** — recreate on the new project:
cake-generation-watchdog (10 min, critical) · generate-blog-post · send-anniversary-reminders ·
send-engagement-drip · send-reengagement-sequence (daily 9am) · send-weekly-blog-digest ·
send-weekly-upgrade-nudge. No `cron.schedule` exists in migrations — they lived in the dashboard.

**Pending phases:**
- **Phase A — DONE (2026-08-18).** All 10 AI functions call the direct Google Gemini API via
  `supabase/functions/_shared/gemini-client.ts` (`generateImage` / `generateText` /
  `generateWithTools`). `LOVABLE_API_KEY` no longer used; new secret `GEMINI_API_KEY` required.
  Rollback is DNS-level (repoint to Lovable), NOT a code kill switch. Model IDs stay centralised
  in `_shared/ai-models.ts` — updated 2026-08-18 to bare direct-API names (no `google/` prefix;
  chat `gemini-3.6-flash`, image `gemini-2.0-flash-exp-image-generation`), both UNVERIFIED — see §2.4.
  The client also strips a leading `google/` defensively.
  Behaviour notes: complete-cake now advances `IMAGE_FALLBACK_CHAIN` on 429/RATE_LIMIT (was
  terminal on the gateway); the tool-calling functions (invite-copy, party-planner-chat) use
  Gemini-native function calling. **Deploy of these 10 functions is still PENDING** — needs
  `SUPABASE_ACCESS_TOKEN`; no local `deno`/CLI so they are UNVERIFIED until deployed/smoke-tested.
- **Phase D** — Cloudflare Pages setup (frontend hosting off Lovable).
- Migrate storage bucket `cake-images` (logo + generated images) to the new project, then fix
  the 8 hardcoded email logo URLs above.
- Recreate all cron schedules; recreate the `send-welcome-email` trigger if it was a dashboard hook.

---

## 2. Live bugs found by survey — not yet fixed

Ordered by user impact.

**2.1 Lifetime-only users are treated as non-premium on ~15 pages**
Only `PartyPlanner.tsx:316` and `usePartyPackAccess.ts:47` check `is_premium || lifetime_access`.
Everywhere else checks `is_premium` alone. `Admin.tsx:714-718` sets both together, so this may not
trigger today — but any grant path that sets only `lifetime_access` breaks premium for that user.

**2.2 Social proof numbers are copy-pasted across ~25 files and already inconsistent**
`4.9` / `2847` almost everywhere, but `PartyPlanner.tsx:133` uses `4.8` / `1240`, and
`EgglessCakeDesign.tsx:174` says "20+ occasions". Changing the marketing number means editing
~25 files.

**2.3 Swallowed errors hide real failures**
`generate-blog-post:393,514` (blog-image dedup) · `generate-complete-cake:786,873` (background
vendor message) · `send-reengagement-sequence:276,336,400` (per-recipient send reason discarded).

**2.4 AI model IDs (direct Gemini API) — UNVERIFIED, deprecate frequently**
`_shared/ai-models.ts` now uses bare direct-API names (no `google/` prefix). Two risks, both
untestable until the new project is deployed + smoke-tested (deploy is blocked on
`SUPABASE_ACCESS_TOKEN`):
- **`CHAT_MODEL_DEFAULT = "gemini-3.6-flash"`** — set per operator instruction (google/gemini-2.5-flash
  reported deprecated for new API keys). Not confirmed to exist on `generativelanguage.googleapis.com`
  — verify against Google's model list before relying on it. A wrong chat ID breaks ALL text/vision/
  tool functions.
- **Image models all = `"gemini-2.0-flash-exp-image-generation"`** — a *preview/exp* model; Google
  deprecates these often (see §3.5). Confirm cake generation actually works after deploy.

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

### 3.7 Frontend env vars — the .env override trap
- Frontend reads VITE_SUPABASE_PUBLISHABLE_KEY, NOT VITE_SUPABASE_ANON_KEY. (hearlog uses ANON_KEY — do not copy conventions between projects.)
- .env is TRACKED in git despite being listed in .gitignore (committed before the rule was added, so the rule is inert). Vite loads it at build time and it OVERRIDES Cloudflare/Lovable platform env vars.
- If deployed credentials look wrong, check .env FIRST — before platform settings.
- Frontend vars: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID, VITE_RAZORPAY_KEY_ID
- At cutover: merge migration-frontend to main so production picks up the new project.

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
5. **Check prop defaults.** Components can silently default to `US`/no-op (§8 of survey; the `ExitIntentModal` instance was fixed Jul 24 — see §6, but `PostShareUpgradeModal`/`PricingPlans` still default `country="US"`).

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

**Pricing — source of truth is `PricingPlans.tsx` `PRICING`** (prior copy drift corrected Jul 24 — see §6)
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
| Aug 12 | 10h silent outage: 9 cake jobs produced zero images | AI credits hit zero (gateway 402 → `CREDITS_EXHAUSTED`). Watchdog sent **one** generic "degraded" email in 10h (1h cooldown + 3-job/hour minimum sample) and never named credits. Zero-image jobs were also stored as `partial_failed`, indistinguishable from a 2-of-3 success. Added a dedicated `credits_exhausted` alert (fires on a single failure, no sample minimum, 6h cooldown, explicit "top up now" copy), made `filled === 0` resolve to `failed`, and gave the 402 case its own user-facing message. `generation_tracking` is only incremented on save, so no free generation was consumed. |
| Jul 24 | Non-US visitors saw USD in the exit-intent modal on 13 pages | `ExitIntentModal` defaults `country` to `US` and falls back to USD for unmapped values; 13 pages passed a literal `country="US"` and read no geo. Wired each to `useGeoContext().detectedCountry` → `country={detectedCountry \|\| 'US'}` (matches Index.tsx). USALanding intentionally keeps `US`. |
| Jul 24 | Pricing copy drifted from the source-of-truth table | Prices hardcoded in several places instead of read from `PricingPlans.PRICING`. `USALanding` FAQ said yearly `$19.99` (real `$29`); `PremiumComparison` had no `US` key so US/unmapped visitors fell back to a stale `$9.99/mo` (real `$4.99`). Corrected both; other copies already matched. |
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

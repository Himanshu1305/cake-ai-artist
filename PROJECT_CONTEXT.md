# Cake AI Artist — Project Context

**Read this before diagnosing any bug. Update it after fixing anything non-obvious.**

Exhaustive reference lives in `docs/SURVEY.md` (~1,930 lines: all 51 routes, 49 pages,
76 components, 36 edge functions, 41 tables, theme tokens). This doc is the short version —
the things that actually cause confusion.

Scale check: 51 routes · 49 pages · 76 components · 36 edge functions · 41 tables.

---

## 1. Stack & deployment

React + TypeScript + Vite + Tailwind + shadcn/ui · **Cloudflare Pages** ·
**Supabase (self-managed, `gadiwsbvbycfygsaizja`, Mumbai `ap-south-1`)** ·
Razorpay · Brevo (marketing) + Resend (transactional) · **Direct Google Gemini API**

Repo `github.com/Himanshu1305/cake-ai-artist` · Supabase ref `gadiwsbvbycfygsaizja`

**Deploy (frontend):** push to `main` → **Cloudflare Pages** auto-builds (`npm run build` → `dist`)
→ live in a few minutes. Always verify a *behavioural* change after deploying, not just that the
page loads.

**Local build is impossible.** `node_modules` is absent; `vite build` fails. `npx tsc --noEmit`
works (fetches TS on demand) and is the only local gate.

**Edge functions are NOT deployed by a git push** — deploy them explicitly, and **from the Mac
terminal** (`npx supabase functions deploy …`; the Claude Code container has no pre-installed CLI —
see §3.8). A function in the repo but missing from the Edge Functions list has never been deployed.

**Old project `ozgghjbvhveswqplzegd`** (Lovable Cloud) is now dark — **decommission after Oct 2026**
once we're confident nothing references it (email logo URLs still do — §2.5).

---

## 1a. Migration Status — ✅ COMPLETE (2026-08-19)

Fully migrated off Lovable Cloud to a self-managed stack (Cloudflare Pages + Supabase +
direct Gemini). DNS cut over 2026-08-19; `cakeaiartist.com` now serves entirely from the new
stack. **Saving ~$90/month.**

| Phase | What | Done |
|---|---|---|
| B1 | DB schema + data migrated to new project (migrations applied) | Aug 17 |
| B2 | Auth users imported (454; see `import_log.json`) | Aug 17 |
| B3 | Storage buckets copied (see `storage_log.json`) | Aug 18 |
| B4 | Secrets set on new project | Aug 18 |
| B5 | Cron schedules recreated (7 pg_cron jobs — §1b) | Aug 18 |
| C  | 34 LIVE edge functions deployed (census: `docs/reports/function_census.md`) | Aug 18–19 |
| A  | AI gateway → direct Gemini (10 fns via `_shared/gemini-client.ts`) | Aug 18–19 |
| D  | Cloudflare Pages frontend (`.env` → new project) | Aug 19 |
| F  | DNS cutover — `cakeaiartist.com` + `www` → Cloudflare | Aug 19 |
| G  | Post-cutover verification + old-project wind-down prep | Aug 19 |

*(Phase labels B1–B5/F/G inferred from the migration record — adjust if your naming differs.)*

**Pending (not blockers):**
- **Rotate the Supabase service_role key** — it was exposed in the migration chat. Do this before
  Oct decommission.
- **Email logo URLs still hotlink the old project** (§2.5) — fix before decommissioning `ozg…`.

---

## 1b. New stack config

**Cloudflare Pages** — project `cake-ai-artist` · domains `cakeaiartist.com` + `www` ·
production branch `main` · build `npm run build` → output `dist` ·
env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`,
`VITE_RAZORPAY_KEY_ID`. (Frontend reads the **PUBLISHABLE** key, not ANON — §3.7.)

**Supabase secrets** (edge functions): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`GOOGLE_PLACES_API_KEY`, `CRON_SECRET`, `BREVO_API_KEY`, `RESEND_API_KEY`, `GEMINI_API_KEY`,
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
(`LOVABLE_API_KEY` is gone — all AI is direct Gemini.)

**Cron jobs (7 — schedules in UTC; pg_cron on the new project):**
| Job | Schedule (UTC) | Function |
|---|---|---|
| cake-generation-watchdog | `*/10 * * * *` | cake-generation-watchdog |
| engagement-recent-visitors | `30 3 * * 1` | send-engagement-drip (campaign=recent_visitors) |
| engagement-we-miss-you | `30 3 * * 3` | send-engagement-drip (campaign=we_miss_you) |
| send-anniversary-reminders | `30 3 * * *` | send-anniversary-reminders |
| weekly-blog-digest | `0 21 * * 6` | send-weekly-blog-digest |
| weekly-blog-generation | `30 18 * * 5` | generate-blog-post |
| weekly-upgrade-nudge | `30 3 * * 4` | send-weekly-upgrade-nudge |

**Razorpay webhook:** `https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/razorpay-webhook`

**AI models** (direct Gemini, **no `google/` prefix**): chat `gemini-3.7-flash` ·
image `gemini-3.1-flash-image` (fast) + `gemini-3-pro-image` (HQ). Centralised in
`supabase/functions/_shared/ai-models.ts`; `gemini-client.ts` strips a leading `google/` defensively.

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

**2.4 PostShareUpgradeModal defaults `country="US"`**
Quotes USD pricing at a high-intent moment even for non-US visitors. Wire it to
`useGeoContext().detectedCountry` like the ExitIntentModal fix (§6, Jul 24). `PricingPlans` still
defaults `US` too — cross-check both.

**2.5 Email logo URLs hotlink the OLD project — breaks at decommission**
`send-premium-emails` (L424, 556, 658, 876, 974, 1086) and `send-welcome-email` (L23, 111) load the
logo from `https://ozgghjbvhveswqplzegd.supabase.co/storage/...`. When the old project is
decommissioned (after Oct 2026) every transactional/premium email shows a broken logo. Repoint to
the new project's storage (or a stable CDN) before then.

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
- **Webhook now points at the new project:**
  `https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/razorpay-webhook`. The **BornClock webhook
  was deleted** (no more cross-project confusion).
- **30 plans in the Razorpay account:** 10 CakeAI (all correct + in use) · 5 BornClock (harmless,
  can't delete) · 5 lifetime (dead weight) · 10 legacy. Only the 10 CakeAI plan IDs matter — they're
  hardcoded in `create-razorpay-subscription/index.ts` and must match the dashboard.

### 3.5 AI model IDs
When Google promotes a Gemini model preview → GA (or retires an old one), the old ID starts
returning **403/404**. This has caused 100% generation outages. Direct Gemini API uses **bare**
model names (no `google/` prefix — that was the Lovable gateway format).
- All IDs live in `supabase/functions/_shared/ai-models.ts`. **Never hardcode.**
- `scripts/check-model-ids.sh` fails if a provider-prefixed model string appears elsewhere.
- `generate-complete-cake` walks `IMAGE_FALLBACK_CHAIN` on 403 / model-shaped 400 / **429
  (RATE_LIMIT)** — 429 now advances the chain (a per-model quota may free up on the next model).
  The direct Gemini API has **no 402 "credits" concept** (billing is Google Cloud).

### 3.6 Auth is fully decentralised
~60 independent `supabase.auth.*` call sites; no auth context. Every page checks for itself.
Login navigates directly after `signInWithPassword` — do **not** reintroduce navigation inside
`onAuthStateChange` for email/password (caused a race where login "succeeded" but the user stayed
logged out). OAuth still navigates via the listener; it has no other entry point.

### 3.7 Frontend env vars — the .env override trap
- Frontend reads `VITE_SUPABASE_PUBLISHABLE_KEY`, NOT `VITE_SUPABASE_ANON_KEY`. (Don't copy
  conventions between projects.)
- `.env` is TRACKED in git despite being listed in `.gitignore` (committed before the rule was
  added, so the rule is inert). Vite loads it at build time and it **OVERRIDES Cloudflare platform
  env vars**.
- If deployed credentials look wrong, check `.env` **FIRST** — before platform settings.
- Frontend vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`,
  `VITE_RAZORPAY_KEY_ID`.
- Cutover done (Aug 19): `migration-frontend` carried the new-project `.env`; `main` builds on
  Cloudflare against the new project.

### 3.8 Supabase CLI is not in the Claude Code container
Deploy edge functions **from the Mac terminal**: `export SUPABASE_ACCESS_TOKEN=…` then
`npx supabase functions deploy <fn> --project-ref gadiwsbvbycfygsaizja`. (In-container `npx supabase`
can work off stored `~/.supabase` creds, but treat the Mac terminal as the source of truth.)
Note: **`npx supabase functions logs` does not exist** — read logs from the Supabase **dashboard**.

### 3.9 Auth email confirmation rate limit (Lovable-era lockout)
On Lovable's shared SMTP the confirmation-email rate limit was **2/hour**, so signup confirmations
were silently dropped in bursts — **72 of 117 email users never confirmed**. Fixed **Aug 14**:
auto-confirm **ON**, rate limit raised to **100/hour**, and the 72 back-confirmed via SQL. The new
Supabase project uses **auto-confirm by default**, so this shouldn't recur — but watch it if you
ever turn auto-confirm off.

### 3.10 IPv6 — new Supabase projects default to IPv6 direct connections
Direct-connection `pg_restore`/`psql` from a Mac (often IPv4-only) **fails to connect**. Use the
**Session pooler** (IPv4) instead:
`postgresql://postgres.gadiwsbvbycfygsaizja:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`

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
5. **Check prop defaults.** Components can silently default to `US`/no-op (the `ExitIntentModal`
   instance was fixed Jul 24 — see §6, but `PostShareUpgradeModal`/`PricingPlans` still default
   `country="US"` — §2.4).

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
| Aug 19 | Full Lovable migration complete | DNS cutover — `cakeaiartist.com` now on **Cloudflare Pages + self-managed Supabase (`gadiwsbvbycfygsaizja`) + direct Gemini**. 34 edge functions deployed, 7 cron jobs recreated, Razorpay webhook repointed, frontend `.env` → new project. **~$90/mo saved.** Old project `ozgghjbvhveswqplzegd` dark → decommission after Oct 2026. |
| Aug 19 | AI functions using deprecated models | `gemini-2.5-flash` deprecated for new API keys; image `-exp` model retired. Switched to `gemini-3.7-flash` (chat) + `gemini-3.1-flash-image` / `gemini-3-pro-image` (image), bare direct-API names. IDs centralised in `_shared/ai-models.ts`. |
| Aug 14 | 72 email signups locked out | Lovable shared SMTP confirmation limit was **2/hr** → confirmations silently dropped (72 of 117 email users never confirmed). Fixed: auto-confirm ON, rate limit 100/hr, 72 back-confirmed via SQL (see §3.9). |
| Aug 12 | 10h silent outage: 9 cake jobs produced zero images | AI credits hit zero (gateway 402 → `CREDITS_EXHAUSTED`). Watchdog sent **one** generic "degraded" email in 10h and never named credits. Zero-image jobs were also stored as `partial_failed`, indistinguishable from a 2-of-3 success. Added a dedicated `credits_exhausted` alert (single failure, 6h cooldown, explicit "top up now"), made `filled === 0` resolve to `failed`, and gave the 402 case its own user-facing message. `generation_tracking` is only incremented on save, so no free generation was consumed. |
| Jul 24 | Non-US visitors saw USD in the exit-intent modal on 13 pages | `ExitIntentModal` defaults `country` to `US` and falls back to USD for unmapped values; 13 pages passed a literal `country="US"` and read no geo. Wired each to `useGeoContext().detectedCountry` → `country={detectedCountry \|\| 'US'}`. USALanding intentionally keeps `US`. |
| Jul 24 | Pricing copy drifted from the source-of-truth table | Prices hardcoded instead of read from `PricingPlans.PRICING`. `USALanding` FAQ said yearly `$19.99` (real `$29`); `PremiumComparison` had no `US` key so US/unmapped visitors fell back to a stale `$9.99/mo` (real `$4.99`). Corrected both. |
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

**Fix soon**
- Rotate the Supabase **service_role key** (exposed in migration chat).
- Repoint **email logo URLs** off the old project (§2.5) — before Oct decommission.
- **PostShareUpgradeModal** `country="US"` default → geo (§2.4).
- **Lifetime-only premium** check across ~15 pages (§2.1).

**Decommission after Oct 2026**
- Remove Lovable Cloud project `ozgghjbvhveswqplzegd` once nothing references it (email logos first).

**Decisions pending**
Hero declutter + font-contrast audit (analysis done, unimplemented — biggest UX win) ·
browse-hub for ~220 programmatic `/birthday-cake-for/*` pages (likely most of "Discovered –
not indexed") · Trustpilot for SERP stars (needs ~25 reviews).

**Growth backlog (researched, not started)**
Pinterest · weekly Reels · bakery embed widget · WhatsApp share-message copy ·
community posting · GA4 + Ads conversion tracking **before** any paid spend.

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

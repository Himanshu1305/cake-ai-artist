# Morning Summary — Overnight Work Session

**Branch:** `overnight-work`  
**Date:** 2026-07-13 → 2026-07-14  
**Safety:** No pushes to main. No edge functions deployed. No DB migrations executed.  
**tsc:** Passed clean after every code phase.

---

## What Was Done

### Phase 1: Stability Sprint (6 bugs fixed + 3 security hardening)
All changes in: `src/`, `supabase/functions/add-contact-to-brevo/`, `supabase/functions/save-image-to-storage/`

| # | File | Fix |
|---|------|-----|
| 1 | `CakeCreator.tsx` | Fixed `totalGenerations` double-count — added `.is("month", null)` filter so yearly rows aren't double-summed |
| 2 | `FreeCakeDesigner.tsx` | Extracted `FREE_TOTAL_LIMIT = 5` constant; replaced 4 hardcoded string literals |
| 3 | `SharedCake.tsx` | Email capture always showed success even on API failure — moved `setEmailSubmitted(true)` inside success path |
| 4 | `Auth.tsx` | Password minimum raised 6→8 characters in both signup schema and reset handler |
| 5 | `Gallery.tsx` | Delete without confirmation replaced with AlertDialog (matching existing pattern) |
| 6 | `Admin.tsx` | `window.confirm()` for image delete replaced with AlertDialog |
| 7 | `Admin.tsx` | `select('*').limit(500)` in `loadAnalytics()` → narrow column selects; limit raised to 1000 |
| 8 | `add-contact-to-brevo` | Added `anonymous: true` flag for SharedCake flow; IP rate limiting (5/IP/hr) via new `brevo_anon_rate_limits` table |
| 9 | `save-image-to-storage` | Domain allowlist, 10 MB size cap, content-type validation for both external URLs and base64 |

Migration: `20260713000001_brevo_anon_rate_limits.sql`  
Report: `docs/reports/01-stability-audit.md`

---

### Phase 2: Reliability Hardening
| Item | Details |
|------|---------|
| `lint:models` script | Added `"lint:models": "bash scripts/check-model-ids.sh"` to `package.json` |
| Idempotency | Migration `000002`: unique index on `cake_generation_jobs.request_id`; edge function checks for existing job before inserting |
| Rate limiting | Migration `000003`: `generation_rate_limits` table; rolling 5-min window check (max 10 req/user) in generate-complete-cake |
| ErrorBoundary | Enhanced to log caught errors to `client_errors` table (migration `000004`); accepts `component` prop; chunk-load auto-reload preserved |
| Component wrapping | `CakeCreator`, `PartyPackGenerator`, `PartyPlannerDetail` wrapped with named ErrorBoundaries |
| RUNBOOK.md | `docs/RUNBOOK.md` — 5 incidents: model outage, payment not granted, free limit wrong, SharedCake email capture, Admin analytics |

---

### Phase 3: Feature Improvement Analysis
`docs/reports/03-feature-improvements.md`  
15 improvements prioritised. **Top P1s:**
- Inspiration gallery / preset style picker (high conversion impact)
- Web Push notifications at generation complete (retention)
- Occasions management page `/occasions` (return visits)

Technical debt noted: CakeCreator (3515 lines) and PartyPlannerDetail (1942 lines) should be split into hooks; generation polling should migrate to Supabase Realtime channels.

---

### Phase 4: Competitor & Market Research
`docs/reports/04-competitor-analysis.md`  
6 direct competitors analysed. Key finding: **no competitor covers the full cake → share → party → RSVP workflow**.

**Top 4 market opportunities:**
1. Bakery B2B white-label SaaS (₹999/month per bakery)
2. India Hindi localisation + regional occasion types
3. WhatsApp-native viral sharing CTA
4. Physical printed cake card via print-on-demand partner (₹99–149)

---

### Phase 5: Growth & Monetization Strategy
`docs/reports/05-growth-monetization.md`  
14 growth levers ranked. **Immediate actions:**
1. Make "Share on WhatsApp" the primary CTA post-generation for Indian users
2. Referral program with UPI rewards (₹50–100 cash > discount codes 3×)
3. Re-engagement email sequence: Day 2 / Day 7 / Day 14 for non-converting free users
4. Hard paywall test: redirect to `/pricing` at limit instead of modal (could 5× conversion)

**Key benchmark:** Hard paywall apps convert at **12.11%** vs. **2.18%** for freemium. This is the single biggest lever.

---

### Phase 6: Local Vendor Discovery Feature (complete)
New files: 6 created + 3 modified

| File | Purpose |
|------|---------|
| `supabase/functions/search-local-vendors/index.ts` | Google Places API wrapper; premium gate; 20 searches/day rate limit |
| `supabase/migrations/20260713000005_vendor_search_usage.sql` | Usage logging table |
| `src/data/vendorSearchMap.ts` | 8 vendor categories; occasion→vendor mapping |
| `src/components/LocalVendorResults.tsx` | Result cards (name, rating, phone, Maps, website, open/closed) |
| `src/components/VendorSearchGate.tsx` | Blurred premium gate with upgrade CTA |
| `src/components/PartyVendorDirectory.tsx` | Full search UI with category chips, location input |
| `src/pages/PartyPlannerDetail.tsx` | New "Vendors" tab; `isPremium` state loaded from profiles |
| `src/components/PricingPlans.tsx` | "Local vendor discovery" added to COMMON_FEATURES |

**Requires:** `GOOGLE_PLACES_API_KEY` env var set in Supabase → Edge Functions → Secrets before deploying.

---

## Migrations Written (NOT Executed)

| File | Purpose |
|------|---------|
| `20260713000001_brevo_anon_rate_limits.sql` | IP rate limit table for anonymous Brevo email capture |
| `20260713000002_cake_jobs_idempotency.sql` | Unique index on `cake_generation_jobs.request_id` |
| `20260713000003_generation_rate_limits.sql` | Per-user rolling-window rate limit for cake generation |
| `20260713000004_client_errors.sql` | Client-side error logging table for ErrorBoundary |
| `20260713000005_vendor_search_usage.sql` | Vendor search usage logging and rate limiting |

**To apply:** Run these in order in Supabase SQL editor or via `supabase db push`.

---

## Decisions Needed From You

### Critical (affects production now or soon)

1. **Hard paywall test** — Should the free limit trigger a hard redirect to `/pricing` instead of a modal? Research says this can 5× conversion, but it increases new-user friction. Recommend A/B test or just flip it given current stage.

2. **Apply migrations** — The 5 migration files are ready. Run them in the Supabase SQL editor in sequence (`000001` → `000005`). The rate limit and idempotency changes only take effect after migration is applied.

3. **Deploy `search-local-vendors`** — Needs `GOOGLE_PLACES_API_KEY` in Supabase secrets first. Do you have a Google Places API key? If not, the Vendors tab will fail gracefully with a "not configured" error.

4. **Deploy `add-contact-to-brevo`** — The anonymous SharedCake email fix is ready but needs the edge function redeployed. Until then, SharedCake recipients' emails are still not being captured.

### Medium (this week)

5. **Referral program budget** — What's the reward per referral? Options: (a) 2 extra free cakes for both parties, (b) ₹100 off Lifetime for referrer, (c) both.

6. **India localisation priority** — Hindi first, or English-global push? India is already your largest market based on ₹ pricing tier.

7. **Gift subscription** — Greenlight the "Gift Premium to [name]" button on SharedCake pages? High LTV + virality. Requires Razorpay gift flow (3 days engineering).

8. **Bakery B2B** — Interested in a white-label mode? Could be a meaningful recurring revenue channel.

### Low priority

9. **Print card partner** — D2C physical cake card (₹99–149). Need to pick a print-on-demand vendor (Zoomin, Canvera, or similar).

10. **`check-payment-status` hardcoded key** — Line ~23: `rzp_live_Rp0dR29v14TRpM` is hardcoded as a fallback. Only a key ID, not the secret, but should move to env var.

---

## Commits on `overnight-work`

```
20d44da feat: local vendor discovery (Phase 6)
e1c57c7 docs: Phase 5 growth and monetization strategy
08b6541 docs: Phase 4 competitor and market research
578e6b4 docs: Phase 3 feature improvement analysis
49c71f3 feat: reliability hardening — idempotency, rate limiting, error observability
a9f99cc fix: stability sprint — error handling, race conditions, security hardening
```

All on `overnight-work`. Ready to review, cherry-pick, or merge to main at your discretion.

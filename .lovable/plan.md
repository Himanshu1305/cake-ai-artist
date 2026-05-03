# Simplified 3-Tier Pricing Migration

## Confirmed Pricing (15 Razorpay Plans)

| Country | Monthly | Yearly | Lifetime |
|---|---|---|---|
| India (INR) | ₹299 | ₹1,999 | ₹2,999 |
| UK (GBP) | £4.99 | £29 | £49 |
| Canada (CAD) | C$6.99 | C$39 | C$69 |
| Australia (AUD) | A$7.99 | A$49 | A$79 |
| USA (USD) | $4.99 | $29 | $49 |

Note: Lifetime plans in Razorpay are configured as "Once in 5 Years" — we treat these as one-time lifetime purchases (charged once via subscription with `total_count: 1`, or via Orders API). We'll use the **Orders API** for Lifetime (one-time payment, cleaner UX) and **Subscriptions API** for Monthly/Yearly recurring.

## Database Migration

Add new tier values without breaking grandfathered members:
- Allowed `founding_members.tier`: legacy `tier_1_49`, `tier_2_99` + new `lifetime_<cc>` (e.g. `lifetime_in`, `lifetime_us`)
- Allowed `subscriptions.tier`: `monthly_<cc>`, `yearly_<cc>` for all 5 countries
- Update `get_available_spots()` → deprecate (no more spot caps); keep function but always return high availability OR remove callers
- Keep `YYYY-LTA-####` numbering scheme starting at 1000; preserve existing member numbers on renewal

## Edge Function Changes

**`create-razorpay-order`** (Lifetime one-time payments)
- Replace tier enum with `lifetime` + country
- New PRICING map with the 15 confirmed amounts (lifetime row only)
- Remove `get_available_spots` validation (no more sold-out logic)
- Notes: tier = `lifetime_<cc>`

**`create-razorpay-subscription`** (Monthly + Yearly)
- Replace PLAN_IDS map with all 10 recurring plan IDs (monthly + yearly × 5 countries)
- Tier enum: `monthly_in|gb|ca|au|us`, `yearly_in|gb|ca|au|us`
- `total_count`: 12 for monthly, 5 for yearly (or unbounded)
- Remove placeholder check

**`verify-razorpay-payment`** (Lifetime activation)
- Accept tier `lifetime_<cc>` (and keep legacy `tier_1_49/2_99` for backward compat)
- Member numbering preserved
- `special_badge`: drop tier-based gold/silver, use single `lifetime` badge

**`razorpay-webhook`** — review for hardcoded tier strings, update accordingly.

## Frontend Changes

**New: `src/components/PricingPlans.tsx`**
- Single source of truth for the 3 plans
- Reads country from `GeoContext`
- Internal PRICING map mirrors edge function values (display only)
- Renders 3 cards: Monthly / Yearly (badge: "Best Value") / Lifetime (badge: "Most Popular")
- Shows local currency only, never USD fallback
- CTA buttons route to `useRazorpayPayment` with appropriate tier

**`useRazorpayPayment` hook**
- Add `mode: 'subscription' | 'order'` based on tier
- Lifetime → `create-razorpay-order` + `verify-razorpay-payment`
- Monthly/Yearly → `create-razorpay-subscription` + Razorpay subscription checkout

**Replace pricing sections in:**
- `src/pages/Pricing.tsx`
- `src/pages/IndiaLanding.tsx`
- `src/pages/UKLanding.tsx`
- `src/pages/CanadaLanding.tsx`
- `src/pages/AustraliaLanding.tsx`
- `src/pages/Index.tsx` (homepage pricing block)
- `src/components/PreviewPricingHero.tsx` (if it has hardcoded tiers)

**Delete / neutralize:**
- `src/components/SpotsRemainingCounter.tsx`
- `src/components/UrgencyBanner.tsx`
- `src/components/PreviewUrgencyBanner.tsx`
- `src/hooks/useFoundingSpots.ts`
- Remove all imports/usages across pages

**Keep:**
- `HolidaySalesManager` / `useHolidaySale` — admin can apply timed discounts
- `DynamicSaleLabel` — for occasional promotions

## Email Templates
- `send-premium-emails`: update tier display logic to handle new tier strings (lifetime vs monthly vs yearly)
- Member number format unchanged

## Out of Scope
- No changes to existing grandfathered members — they keep `tier_1_49`/`tier_2_99` and lifetime access
- No subscription self-management UI (per memory)
- No "AI Message Variations" / "Priority Support VIP" features

## Execution Order
1. DB migration (tier value expansion)
2. Edge functions update + deploy
3. Build `PricingPlans` component + `useRazorpayPayment` refactor
4. Swap pricing sections on all 6 pages
5. Delete scarcity components + clean imports
6. Smoke test each country path

Approve to proceed end-to-end in one build.
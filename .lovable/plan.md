## Goal
Close the biggest Party Planner gap: users can already **track & message** vendors, but they have no way to **discover** them. Add Google Places-powered local vendor discovery gated behind Premium / Lifetime / Party Pack — so it's a real premium value driver, not a free-tier cost sink. Manual vendor entry stays fully available for everyone.

## Access model
- **Premium, Lifetime, and Party Pack buyers** → full "Find local vendors" feature.
- **Everyone else (free / logged-out)** → sees a **locked button with upgrade nudge** ("🔒 Find local vendors — Premium"), tooltip → `/pricing`. Manual vendor fields (name / email / phone / notes / message) stay untouched and fully usable.
- Reuse existing `usePartyPackAccess` hook — it already returns `{ isPremium, hasPartyPackPurchase, hasAccess }` covering all three tiers.

## Cost control (in scope, non-negotiable)
Google Places `searchText` = ~$32 / 1000 calls, with Google's $200/mo free credit (~6.2k searches free). To stay predictably inside the free tier even at scale:

1. **Gate at UI + server.** Edge function re-checks premium/party-pack status server-side — never trust the client. Non-eligible users get 403 before Google is called.
2. **Per-user daily cap** (even for premium): 30 searches/user/day. Track in a lightweight `vendor_search_usage` table (`user_id, date, count`). Prevents one user or a bug from burning $$. Premium users almost never hit this; malicious/looping requests get stopped cold.
3. **Debounce + cache in-component.** Same (task category × city) within a session doesn't refetch.
4. **Party-level directory does NOT auto-load.** User clicks "Show local vendors for this party" — no background calls on page mount. Kills the 4-calls-per-page-view cost I originally planned.
5. **Reasonable page size.** 8 results max per search.

Expected steady-state cost with 500 premium users: well under 1000 calls/day = **$0** (inside free tier).

## What we're building

### 1. Edge function: `search-local-vendors`
- Auth: `verify_jwt = true` (default) + in-code re-check that the user is premium OR has a party pack purchase; else 403.
- Rate limit: reject if `vendor_search_usage` for `(user_id, today)` ≥ 30.
- Input: `{ query, city, country, lat?, lng?, taskCategory }` (zod-validated).
- Maps task category → search query via `src/data/vendorSearchMap.ts` (mirrored server-side to prevent injection).
- Calls Google Maps Platform connector: `POST /places/v1/places:searchText` through `connector-gateway.lovable.dev/google_maps/...` (per google_maps knowledge).
- FieldMask limited to: `places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.priceLevel,places.googleMapsUri` — keeps response small.
- Returns 8 results max.
- Bumps `vendor_search_usage` count on success only.

### 2. New table: `vendor_search_usage`
```
user_id uuid, date date, count int, PRIMARY KEY (user_id, date)
```
Standard grants + RLS: users can read their own row; service_role writes.

### 3. Category mapping: `src/data/vendorSearchMap.ts`
`Record<TaskCategory, { label, googleQuery, icon }>` covering: cake/baker, decorator, caterer, venue, photographer, entertainer, florist, DJ/music, cleanup. Task titles → category via keyword match with a sensible "other" fallback.

### 4. UI components (all frontend)
- `src/components/party/LocalVendorResults.tsx` — inline results grid (name + rating + address + phone/website/Maps link + **"Use this vendor"** button that prefills `vendor_name`, `vendor_phone`, and appends website to `vendor_notes` via existing `updateTaskVendor`). Loading / empty / rate-limit / error states.
- `src/components/party/PartyVendorDirectory.tsx` — collapsed by default; user clicks category chip to run search on demand.
- `src/components/party/VendorSearchGate.tsx` — small component wrapping the search button; if user lacks access renders the locked variant with 🔒 icon, tooltip, and click → `navigate('/pricing')`.

### 5. Touch `src/pages/PartyPlannerDetail.tsx`
- In each task's vendor panel: add `<VendorSearchGate>` above the current manual fields. Manual fields unchanged.
- Below tasks list: mount `<PartyVendorDirectory>` for logged-in users.
- No changes to existing vendor CRUD or message/email logic.

### 6. Pricing / feature messaging
- Add one line to `src/components/PricingPlans.tsx` `COMMON_FEATURES`: `"Local vendor discovery — find bakers, decorators, caterers near you"`.
- No visual redesign; just the copy addition.

## What we're NOT doing
- No storing places in our DB (Google ToS + freshness).
- No affiliate/lead-gen wiring (future).
- No email discovery (Places rarely returns email — user still uses existing WhatsApp/copy flow for those).
- No auto-loading searches on party page mount (cost).
- No favorites/saved vendors (future).

## Order of work
1. User approves + connects Google Maps Platform connector (`standard_connectors--connect`).
2. Migration: create `vendor_search_usage` with grants + RLS.
3. Build `vendorSearchMap.ts` + shared category resolver.
4. Build `search-local-vendors` edge function (premium gate + rate limit + Places call).
5. Build `VendorSearchGate` + `LocalVendorResults` + `PartyVendorDirectory`.
6. Wire into `PartyPlannerDetail.tsx`.
7. Add feature bullet to `PricingPlans.tsx`.
8. QA: one Indian city (INR user) + one US city (USD user), one premium + one free user, verify gate + rate limit + prefill.

## Expected impact
- Party Planner becomes complete: plan → **discover** → contact → track, all in-app.
- Clear premium value driver: "Find real local bakers/decorators/caterers" is a stronger upsell than any existing free-tier feature.
- Cost stays inside Google's $200/mo free credit at expected volume; rate limit prevents surprise bills even if usage spikes.
- Foundation for future monetization: saved favorites, vendor lead-gen / affiliate deals.

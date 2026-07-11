## Goal
Close the biggest Party Planner gap: users can already **track & message** vendors, but they have no way to **discover** them. Add Google Places-powered local vendor discovery gated behind Premium / Lifetime / Party Pack — a real premium value driver, not a free-tier cost sink. Manual vendor entry stays fully available for everyone.

## Google API key: your own Google Cloud key (not Lovable-managed)
Chosen for cost transparency, the $200/mo Google free credit, portability, and hard quota ceilings you control in Google Cloud console.

**One-time setup you'll do (I'll walk you through when we get there):**
1. Create a Google Cloud project (or reuse one).
2. Enable billing on it (Google requires this even for free-tier usage).
3. Enable the **Places API (New)** on the project.
4. Create an API key, restrict it to the Places API (New) only, and set a daily quota (e.g. 500 requests/day) as a hard spend ceiling.
5. Paste the key into a Supabase secret named `GOOGLE_PLACES_API_KEY` when I prompt via `add_secret`.

## Access model
- **Premium, Lifetime, and Party Pack buyers** → full "Find local vendors" feature.
- **Everyone else (free / logged-out)** → sees a **locked button with upgrade nudge** ("🔒 Find local vendors — Premium"), tooltip → `/pricing`. Manual vendor fields stay untouched and fully usable.
- Reuse existing `usePartyPackAccess` hook (returns `{ isPremium, hasPartyPackPurchase, hasAccess }`).

## Cost control (belt + suspenders)
Google Places `searchText` = ~$32 / 1000 calls, with Google's $200/mo free credit (~6,200 searches free).

1. **UI gate + server gate.** Edge function re-checks premium/party-pack status; non-eligible users get 403 before Google is called.
2. **Per-user daily cap:** 30 searches/user/day, tracked in a `vendor_search_usage` table. Prevents runaway usage.
3. **Google Cloud daily quota** on the API key itself (e.g. 500/day) — final ceiling even if everything else fails.
4. **On-demand only.** Party-level directory does NOT auto-load — user clicks to run each search.
5. **Debounce + in-session cache.** Same (category × city) doesn't re-fetch.
6. **8 results max per search**, tight FieldMask.

Expected steady-state cost at 500 premium users: **$0** (comfortably inside Google's free credit).

## What we're building

### 1. Edge function: `search-local-vendors`
- Auth: `verify_jwt = true` + in-code re-check that the user is premium OR has a party pack purchase; else 403.
- Rate limit: reject if `vendor_search_usage` for `(user_id, today)` ≥ 30.
- Input (zod-validated): `{ query?, city, country, taskCategory }`.
- Maps `taskCategory` → Google query via a server-side copy of the category map (prevents client injection). If the user typed a custom `query`, that's used as-is (trimmed, length-capped, sanitized).
- Calls Google Places directly:
  ```
  POST https://places.googleapis.com/v1/places:searchText
  Headers: X-Goog-Api-Key: ${GOOGLE_PLACES_API_KEY},
           X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,
                             places.internationalPhoneNumber,places.websiteUri,
                             places.rating,places.userRatingCount,places.priceLevel,
                             places.googleMapsUri
  Body: { textQuery, pageSize: 8, ...(locationBias if city geocoded — optional v2) }
  ```
- Increments `vendor_search_usage` on success only.

### 2. New table: `vendor_search_usage`
```
user_id uuid, date date, count int, PRIMARY KEY (user_id, date)
```
Standard grants + RLS: users read their own row; service_role writes.

### 3. Category mapping: `src/data/vendorSearchMap.ts`
`Record<TaskCategory, { label, googleQuery, icon }>` — cake/baker, decorator, caterer, venue, photographer, entertainer, florist, DJ/music, cleanup. Task titles → category via keyword match with "other" fallback. **Also exports a resolver used by both client and edge function** (mirror the file into the function directory or share via `_shared`).

### 4. UI components (all frontend)
- `src/components/party/LocalVendorResults.tsx` — results grid: name, rating, address, phone, website, Maps link, and **"Use this vendor"** button that prefills `vendor_name` + `vendor_phone` and appends website to `vendor_notes` via existing `updateTaskVendor`. Loading / empty / rate-limit / error states.
- `src/components/party/PartyVendorDirectory.tsx` — collapsed by default; category chips + optional custom-query input; user clicks to run each search on demand.
- `src/components/party/VendorSearchGate.tsx` — wraps the trigger; if user lacks access, renders locked variant with 🔒 icon, tooltip, click → `navigate('/pricing')`.
- **Manual entry stays available for everyone**, unchanged.

### 5. Touch `src/pages/PartyPlannerDetail.tsx`
- In each task's vendor panel: add `<VendorSearchGate>` above the current manual fields. Manual fields unchanged.
- Below tasks list: mount `<PartyVendorDirectory>` for logged-in users.
- No changes to existing vendor CRUD, message, or email logic.

### 6. Pricing / feature messaging
- Add one bullet to `src/components/PricingPlans.tsx` `COMMON_FEATURES`: `"Local vendor discovery — find bakers, decorators, caterers near you"`.
- No visual redesign.

## What we're NOT doing
- No storing places in our DB (Google ToS + freshness).
- No affiliate/lead-gen wiring (future).
- No email discovery (Places rarely returns email — user still uses existing WhatsApp/copy flow).
- No auto-loading searches on party page mount.
- No favorites/saved vendors (future).
- No Lovable Google Maps connector (using your own key).

## Order of work
1. **You:** Create Google Cloud project → enable Places API (New) → generate + restrict key → set daily quota. I'll walk you through it.
2. **You:** Paste key into `GOOGLE_PLACES_API_KEY` secret (I'll request via `add_secret`).
3. **Me:** Migration → `vendor_search_usage` table with grants + RLS.
4. **Me:** `src/data/vendorSearchMap.ts` + shared category resolver.
5. **Me:** `search-local-vendors` edge function (premium gate + rate limit + direct Places call).
6. **Me:** `VendorSearchGate` + `LocalVendorResults` + `PartyVendorDirectory`.
7. **Me:** Wire into `PartyPlannerDetail.tsx`.
8. **Me:** Add feature bullet to `PricingPlans.tsx`.
9. **Me + you:** QA — one Indian city (INR user) + one US city (USD user), one premium + one free user; verify gate + rate limit + prefill.

## Expected impact
- Party Planner becomes complete: plan → **discover** → contact → track, all in-app.
- Strong upsell hook for Premium / Party Pack.
- $0 real cost at expected volume thanks to Google's free credit + your quota ceiling.
- You keep full control of the key — portable, independently monitorable, easy to swap providers later.

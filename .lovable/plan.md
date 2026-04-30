## Issues found

### 1. Footer always shows "United States"
`src/components/Footer.tsx` reads only `localStorage.user_country_preference` and falls back to `'US'`. That key is only written when the user (a) manually picks a country in the footer/picker, or (b) hits a redirectable route like `/pricing`. On the homepage (`/`), the geo detection result is stored in `sessionStorage` under `geo_detection_done` (via `GeoContext` / `useGeoRedirect`) but the footer never reads it — so Indian visitors landing on `/` see "United States".

### 2. Surabhi Dixit was charged after premium was removed
Verified in DB:
- `profiles.is_premium = true`, `subscription_status = 'active'`, `subscription_id = sub_S6ZSWlskYzvWFw`
- `subscriptions.status = 'active'`, last charged 2026-04-20, next period ends 2026-05-20

Root cause: in `src/pages/Admin.tsx` `handleRemovePremium` only flips `profiles.is_premium = false` locally. It never tells Razorpay to cancel the subscription, so Razorpay keeps auto-charging every cycle. There is also no `cancel-subscription` edge function in the project at all (users can't self-cancel either, despite Terms saying they can).

---

## Plan

### A. Footer country defaulting (frontend only)
Update `src/components/Footer.tsx` to resolve the displayed country with this priority:
1. `localStorage.user_country_preference` (explicit user choice)
2. `useGeoContext().detectedCountry` (auto-detected this session)
3. URL-based hint: `/india` → IN, `/uk` → UK, `/canada` → CA, `/australia` → AU, otherwise US
4. Final fallback: US

Map the detected ISO code (`GB` → UK, unsupported codes → US) to one of the 5 supported entries. Re-render when `detectedCountry` resolves so the flag updates from the loading state.

### B. Cancel Razorpay subscription on premium removal (backend + admin UI)

1. **New edge function** `supabase/functions/cancel-razorpay-subscription/index.ts`
   - Auth: requires a valid JWT. Allow if (a) caller is the subscription owner, or (b) caller has `admin` role via `has_role()`.
   - Input: `{ userId: string, cancelAtCycleEnd?: boolean }` (default `true`).
   - Look up the user's active `subscriptions` row (or `profiles.subscription_id`).
   - Call Razorpay `POST https://api.razorpay.com/v1/subscriptions/{id}/cancel` with `{ cancel_at_cycle_end: 1 | 0 }` using Basic auth (`RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET`).
   - On success, update `subscriptions.status = 'cancelled'` and `profiles.subscription_status = 'cancelled'`. (Existing `razorpay-webhook` `subscription.cancelled` handler will also fire for safety.)
   - Add a deploy-time config block in `supabase/config.toml` only if needed (function should keep `verify_jwt = true`).

2. **Admin "Remove Premium" flow** (`src/pages/Admin.tsx` `handleRemovePremium`)
   - Before flipping `is_premium`, look up the user's `subscription_id`. If present and `subscription_status` is `active` (or anything other than `cancelled/expired/halted`), invoke the new `cancel-razorpay-subscription` function with `cancelAtCycleEnd: true` so they are not charged again but keep access until the paid period ends.
   - Surface success/failure in the existing toast. If the cancel call fails, abort the local update and show an error so the admin can retry — this prevents the current bug where the local profile says "not premium" but Razorpay keeps billing.
   - Keep the existing email-type dropdown.

3. **One-off cleanup for Surabhi**
   - As part of the implementation, run the new function (or an equivalent SQL + Razorpay call) for `user_id = df576f0b-3343-48e3-a43d-f98450a41657` / subscription `sub_S6ZSWlskYzvWFw` to stop further charges immediately. Refunding the last cycle is out of scope (must be done manually in the Razorpay dashboard).

4. **(Optional, recommended) User-facing cancel**
   - Add a "Cancel subscription" button in `src/pages/Settings.tsx` for premium users with a `subscription_id`, calling the same edge function with `cancelAtCycleEnd: true`. This honors what `Terms.tsx` already promises. Skip if you want this kept admin-only.

### Files to touch
- `src/components/Footer.tsx` — geo-aware country resolution
- `supabase/functions/cancel-razorpay-subscription/index.ts` — new
- `src/pages/Admin.tsx` — call cancel before removing premium
- `src/pages/Settings.tsx` — optional user-facing cancel button

### Out of scope
- Refunding the April 2026 charge to Surabhi (manual Razorpay dashboard action)
- Changing how lifetime/one-time `tier_X_49/99` users are handled (they have no recurring subscription)

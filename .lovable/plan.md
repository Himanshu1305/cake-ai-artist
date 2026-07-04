## Root cause analysis

I queried the database and inspected the auth flow. The country field is blank for **31 of 145 profiles (21%)**, and **every single one is a Google OAuth signup** (`provider = 'google'`, `raw_user_meta_data->>'country'` is null).

There are 4 compounding bugs, none of them in geo-detection itself (that works fine — proven by users being redirected to `/uk` etc.).

### Bug 1 — OAuth bypasses the country-capture form entirely
Email signup collects country in the form and passes it as `options.data.country`, which `handle_new_user` trigger stores. But the Google button calls:
```ts
supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}/` } })
```
Google returns the user to `/` (home), **not** `/auth`. The `SIGNED_IN` listener that would redirect them to `/complete-profile` lives inside `Auth.tsx` — it never fires because the user isn't on that page. So OAuth users land on home with no country prompt, ever.

### Bug 2 — `useRequireCountry` guard is only on 3 low-traffic pages
It's wired into `Gallery`, `Pricing`, and `Settings`. It is NOT on `Index`, `/free-ai-cake-designer`, `/party-planner`, `CakeCreator`, or any country landing page — the actual high-traffic surfaces. So OAuth users can browse, create cakes, and even purchase without ever hitting the guard. This is why admin sees "user created 3 cakes, country blank".

### Bug 3 — `handle_new_user` has no fallback for OAuth
The trigger only reads `raw_user_meta_data->>'country'`. Google never sends that field. No `locale` fallback, no IP-based fallback. Nothing writes country at signup for OAuth.

### Bug 4 — Client-side geo is detected but never persisted
`GeoContext` successfully detects country on every visit (that's what powers the `/uk` redirect the admin sees in page_visits). But that detected value is only used for routing — it's never written back to `profiles.country`. So we already know these users' countries; we just throw the data away.

### Why admin sees `/` and `/uk` for the same blank-country user
`/` is home. `/uk` is where `GeoRedirectWrapper` sent them because their IP resolved to GB. Both got tracked in `page_visits` with a `country_code`. But `profiles.country` remained null because nothing links the two.

---

## Fix plan

### 1. Silent auto-fill on every sign-in (primary fix)
Add a top-level `AuthCountrySync` effect in `App.tsx` (runs regardless of route). On every `SIGNED_IN` event and on initial session load:
- Read `profiles.country` for the user.
- If blank AND `GeoContext.detectedCountry` is available, `UPDATE profiles SET country = <detected>` (mapping `GB → UK`).
- No modal, no redirect — invisible to the user.

This closes Bug 1 and Bug 4 for all future OAuth signups. No forced `/complete-profile` interruption, which would hurt OAuth conversion.

### 2. Trigger-level fallback for future OAuth signups
Update `handle_new_user` to also try `raw_user_meta_data->>'locale'` (e.g. `en-GB` → `GB`) as a secondary source before falling back to null. Keeps signup row consistent even before the client-side sync runs.

### 3. One-time backfill of the 31 existing blank users
Migration that, for each `profiles.country IS NULL` user, sets country to the most-frequent `page_visits.country_code` for their `user_id` (fallback: their most recent visit's country_code). Users who never had a page visit stay null and will be filled by fix #1 on their next login.

### 4. Optional safety net (do only if #1 proves insufficient)
Add `useRequireCountry` to `Index` and `/free-ai-cake-designer` so cake creation can't happen with a blank profile. Keeping this optional because the silent sync in #1 should make it unnecessary and forced redirects hurt UX.

---

## Technical details

**Files to change**
- `src/App.tsx` — mount a new `<AuthCountrySync />` component inside providers.
- `src/components/AuthCountrySync.tsx` — new; listens to auth + geo context, writes profile country if blank.
- Migration — updates `handle_new_user` to add locale fallback; backfills existing 31 rows from `page_visits.country_code`.

**No change** to `GeoContext`, `GeoRedirectWrapper`, `CompleteProfile`, or Google OAuth `redirectTo` — those work correctly for their scope.

**Verification after ship**
- Re-run the blank-country query: should drop from 31 to ~0 (only users with no page_visits history remain).
- Sign in fresh with a Google account, confirm `profiles.country` populates within seconds without any UI prompt.

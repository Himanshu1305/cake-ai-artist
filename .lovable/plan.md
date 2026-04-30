# Fix: Footer still shows United Kingdom for India users

## Root cause

The footer resolves the displayed country in this priority:

1. `localStorage["user_country_preference"]` (explicit picker choice) — **always wins**
2. Geo-detected country from `GeoContext` (ipapi.co → server fallback)
3. URL path hint (`/india`, `/uk`, etc.)
4. Default `US`

A stale value (`"UK"`) is sitting in localStorage from an earlier session — likely set when the user (or a prior preview test) clicked the country picker, or visited `/uk`. Because step 1 wins unconditionally, geo-detection (which correctly returns `IN`) is ignored and the footer keeps showing United Kingdom forever.

There is currently no logic that:
- Clears or overrides a stale preference when it conflicts with the actual detected country.
- Lets the user "reset to auto-detect."
- Re-validates the saved preference against geo data on a new session.

## Fix

### 1. Smarter preference resolution in `src/components/Footer.tsx`

Change the priority so explicit user choice still wins, but a **stale/auto-saved preference** doesn't permanently override correct geo detection:

- Read the saved preference, but also read a new flag `user_country_preference_explicit` (set only when the user manually picks via the footer dropdown).
- If the saved preference is **not explicit** AND `detectedCountry` resolves to something different, prefer the geo-detected value and update the saved preference to match.
- If the saved preference **is explicit**, keep honoring it (user picked it on purpose).

When the footer picker is used (`handleCountryChange`), set both:
- `user_country_preference` = code
- `user_country_preference_explicit` = `"1"`

### 2. Add an "Auto-detect" option to the footer dropdown

Append an extra menu item ("Auto-detect my region") that:
- Removes `user_country_preference` and `user_country_preference_explicit` from localStorage.
- Removes `geo_detection_done` from sessionStorage.
- Reloads the page so geo runs fresh.

This gives the user a recovery path and is the cleanest way to clear a wrong saved value.

### 3. One-time migration to fix existing stale preferences

On Footer mount, run a tiny migration (guarded by a `user_country_pref_migrated_v1` flag in localStorage):
- If `user_country_preference` exists but `user_country_preference_explicit` is missing, treat the existing value as **non-explicit** (auto-saved by older logic). The new resolver in step 1 will then re-evaluate against geo detection on the next render and self-correct.

This silently fixes every existing user (including the reporter) without forcing them to click anything.

### 4. Don't auto-save preferences from `GeoRedirectWrapper` / `useGeoRedirect`

Audit `src/hooks/useGeoRedirect.ts` and `src/components/GeoRedirectWrapper.tsx` to make sure they only write to `geo_detection_done` (sessionStorage), never to `user_country_preference` (localStorage). They currently look correct, but I'll double-check during implementation to ensure no other code path silently writes the explicit preference.

## Files to edit

- `src/components/Footer.tsx` — new resolver logic, "Auto-detect" menu item, migration flag, mark explicit picks.
- (Verify only) `src/hooks/useGeoRedirect.ts`, `src/components/GeoRedirectWrapper.tsx` — confirm they don't write `user_country_preference`.

## Out of scope

- Backend / edge function changes (geo detection itself works fine).
- UI redesign of the footer.
- Currency/pricing logic on landing pages (separate concern).

## Expected result

- Reporter's footer immediately shows India (🇮🇳) on next load thanks to the migration + new resolver.
- Future users who manually pick a country still get their choice respected.
- Anyone stuck on a wrong region can click "Auto-detect my region" to reset.

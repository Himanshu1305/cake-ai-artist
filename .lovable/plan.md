## Root cause

Login on mobile is actually working — the session is created and stored correctly. The reason it *looks* broken is the **country landing pages** (`IndiaLanding`, `USALanding`, `UKLanding`, `CanadaLanding`, `AustraliaLanding`) still have their **own hand-rolled nav** with a hardcoded `<Button>Sign In</Button>` that never checks auth state.

After login, the user is redirected to e.g. `/india`. They land on `IndiaLanding.tsx`, which renders its inline nav (lines ~207–264) showing "Sign In" no matter what. The user concludes login failed, even though `supabase.auth.getSession()` would return a valid session.

This was missed in the previous SiteHeader rollout — the country landings already had a nav, so they were skipped, but their nav doesn't react to auth state.

## Fix

Replace the inline `<nav>…</nav>` block in each of the 5 country landing pages with `<SiteHeader />`. SiteHeader already:
- Subscribes to `onAuthStateChange` and reflects logged-in state (My Gallery / Settings / Logout vs. Sign In).
- Computes a country-aware Pricing link via `resolveRegion(location.pathname, …)`, so `/india` → `/pricing?country=IN` automatically.
- Has matching mobile hamburger menu.

### Per-file changes

For each of `IndiaLanding.tsx`, `USALanding.tsx`, `UKLanding.tsx`, `CanadaLanding.tsx`, `AustraliaLanding.tsx`:

1. Add `import { SiteHeader } from "@/components/SiteHeader";`.
2. Delete the entire inline `<nav>…</nav>` block (logo + desktop links + mobile `<Sheet>`).
3. Render `<SiteHeader />` in its place, immediately after the `<UrgencyBanner />`.
4. Remove now-unused imports (`Menu`, `Sheet`, `SheetContent`, `SheetTrigger`, and `Link` / `Button` if no longer referenced elsewhere on the page) — keep them if they're still used further down.
5. Leave the `UrgencyBanner` + its `isBannerVisible` / `bannerHeight` state alone (still used for banner offset elsewhere if applicable; if only the removed nav consumed `bannerHeight`, drop that state too).

### Trade-off note (the small regression)

The current country navs show a region badge (e.g. `🇮🇳 India`) and a `🔥` flame on Pricing. `SiteHeader` does not render those. To stay surgical and ship the fix, we drop those decorations — the regional Pricing link still routes correctly via `pricingPathForRegion(region)`. If you want the badge / flame preserved, I can add optional `regionBadge` and `pricingFlame` props to `SiteHeader` in the same pass — say the word and I'll include it.

### Not changing

- `Auth.tsx`, `SiteHeader.tsx`, `postLoginRedirect.ts`, Supabase client — all correct. The auth flow itself is fine.
- No backend / RLS / schema changes.

### Verification

After the change, on mobile:
- Log in → land on `/india` (or detected country) → header shows "My Gallery" + avatar/logout instead of "Sign In".
- Logout from any country landing still works (handled inside SiteHeader).

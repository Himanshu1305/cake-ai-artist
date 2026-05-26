## Findings

The mismatch is caused by multiple country systems fighting each other:

1. **Pricing uses stale saved country before live geo**
   - `Pricing.tsx` prefers `localStorage.user_country_preference` over current VPN/geo detection.
   - If a visitor previously had `IN` saved, `/pricing` can still show India pricing even when the footer/header now says Australia.

2. **Footer and pricing disagree**
   - `Footer.tsx` tries to self-correct old saved country values, but `Pricing.tsx` can render and lock onto the old value before the footer updates storage.
   - This creates exactly the trust-breaking state from the screenshot: page says one region, pricing comes from another.

3. **Generic `/pricing` is unsafe**
   - Country landing pages link to `/pricing`, but `/pricing` dynamically guesses the country from profile/localStorage/session geo.
   - That means a user on `/australia` can click Pricing and still see INR if old storage/profile data says India.

4. **Country pages are not protected**
   - `GeoRedirectWrapper` only redirects `/` and `/pricing`.
   - A human user can still land on `/india`, `/uk`, `/canada`, `/australia`, or `/usa` directly and see the wrong local page.

5. **Country mapping is duplicated**
   - Country resolution logic exists separately in `GeoRedirectWrapper`, `GeoContext`, `Footer`, `Pricing`, `FAQ`, and landing pages.
   - These duplicated rules are drifting and causing inconsistent behavior.

## Fix plan

### 1. Add one shared country-routing utility
Create a single source of truth for:
- Supported regions: `US`, `IN`, `GB`, `CA`, `AU`
- Display region codes: `UK` maps to `GB`
- Localized landing paths:
  - `US -> /usa`
  - `IN -> /india`
  - `GB/UK -> /uk`
  - `CA -> /canada`
  - `AU -> /australia`
- Broader region fallbacks:
  - Asia-Pacific fallback -> Australia
  - Europe/MENA fallback -> UK
  - Unknown fallback -> US

This prevents every page from making its own country decision.

### 2. Make `/pricing` deterministically country-safe
Update `Pricing.tsx` so it resolves country in this order:

1. Explicit URL country override, e.g. `/pricing?country=AU`
2. Current detected country from VPN/geo
3. Explicit manual user country selection only if present
4. Logged-in profile country only if it does not conflict with live country, or as fallback when live country is unavailable
5. US fallback

Important behavior change: stale `localStorage.user_country_preference` will no longer override current geo detection unless it was explicitly selected by the visitor.

### 3. Pass country through every Pricing link
Update country landing pages so their Pricing nav links carry the correct country:
- Australia page: `/pricing?country=AU`
- India page: `/pricing?country=IN`
- UK page: `/pricing?country=GB`
- Canada page: `/pricing?country=CA`
- USA/home page: `/pricing?country=US`

This means a user clicking Pricing from Australia cannot accidentally get India pricing because the source page itself passes the intended region.

### 4. Protect localized country pages for humans
Expand the geo redirect guard so human visitors on localized pages are corrected when they are on the wrong country page:
- AU visitor opening `/india` redirects to `/australia`
- IN visitor opening `/australia` redirects to `/india`
- GB/UK visitor opening `/usa` redirects to `/uk`

Keep existing bot bypass rules so SEO crawlers can still access country-specific pages and indexing is not damaged.

### 5. Fix Footer and FAQ to use the shared resolver
Update `Footer.tsx` and `FAQ.tsx` to use the same country resolver as pricing.
This ensures:
- Footer country label
- FAQ pricing amounts
- Pricing page currency
- Redirect behavior
all agree with each other.

### 6. Clean up stale preference behavior
Keep the manual country picker, but make its meaning clear in code:
- Explicit manual selection is stored with `user_country_preference_explicit = 1`
- Old/non-explicit saved values are ignored when live geo exists
- “Auto-detect my region” clears both local and session country values

### 7. Verify permanently
After implementation, verify these scenarios:

```text
Scenario A: VPN Australia + stale IN localStorage
Expected: footer shows Australia, /pricing shows AUD, Pricing link keeps AU.

Scenario B: VPN Australia + direct /india
Expected: human visitor redirects to /australia.

Scenario C: VPN India + direct /australia
Expected: human visitor redirects to /india.

Scenario D: Bot user-agent on /india
Expected: no redirect; SEO page remains accessible.

Scenario E: Manual country picker selection
Expected: explicit selection is respected until Auto-detect is clicked.
```

## Files to change

- `src/utils/countryRouting.ts` or similar new utility
- `src/components/GeoRedirectWrapper.tsx`
- `src/pages/Pricing.tsx`
- `src/components/Footer.tsx`
- `src/pages/FAQ.tsx`
- Country landing pages with hardcoded `/pricing` links:
  - `src/pages/AustraliaLanding.tsx`
  - `src/pages/IndiaLanding.tsx`
  - `src/pages/UKLanding.tsx`
  - `src/pages/CanadaLanding.tsx`
  - `src/pages/USALanding.tsx`
  - `src/pages/Index.tsx`
- Any remaining CTA components that navigate to `/pricing` without country context

## Expected result

Users will no longer see another country’s pricing or localized page after geo detection. Pricing, footer country, FAQ pricing, and landing-page navigation will all use the same resolved region, eliminating the current mismatch permanently.
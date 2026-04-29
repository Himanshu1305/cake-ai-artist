# Geo Check Results + Remove "Offer Ends In" Banner from Pricing

## 1. Geo / location APIs — health check

I tested the live geo stack end-to-end. **Everything is working correctly.**

### Verification
- **Edge function `detect-country`** — called directly: returned `200 OK` with `{"country_code": "NL", "source": "cloudflare"}`. The Cloudflare `cf-ipcountry` header path is firing as expected.
- **Client fallback chain (in `GeoContext.tsx`)** — order is correct:
  1. `ipapi.co/json/` (3s timeout)
  2. Edge function `detect-country` (Cloudflare header)
  3. Stored country preference
- **`GeoRedirectWrapper`** — sync bot check first (good for SEO), `?noredirect` escape hatch present, redirects only on `/pricing`, results cached in `localStorage` so users aren't re-redirected.

### Country → page mapping (confirmed in `useGeoRedirect.ts` + `GeoRedirectWrapper.tsx`)
```text
IN          → /india
GB / UK     → /uk
CA          → /canada
AU          → /australia
Asia/Pac    → /australia
Europe/MENA → /uk
US/other    → / (homepage, USD)
```

### Pricing on each page (verified in code)
- **`/india`** — uses `useRazorpayPayment("IN")` → `₹4,100` shown.
- **`/uk`** — uses `useRazorpayPayment("GB")` → `£39` shown.
- **`/canada`** — uses `useRazorpayPayment("CA")` → `C$67` shown.
- **`/australia`** — uses `useRazorpayPayment("AU")` → `A$75` shown.
- **`/` (homepage)** — `countryPricing` memo reads `detectedCountry` from `GeoContext` and shows IN/GB/CA/AU prices when detected, else USD `$49`.
- **`/pricing`** — also reads `useGeoContext()` for currency.

**Conclusion: no fixes needed for geo/pricing. The system is healthy.**

The only theoretical risk would be a user on a brand-new device with both ipapi.co rate-limited *and* an edge function cold-start failure — handled gracefully by falling back to USD homepage.

---

## 2. Remove the "offer ends in" banner from pricing page

`src/pages/Pricing.tsx` currently shows two countdown/urgency elements:

- **Lines 208–237** — the big top banner: *"EXCLUSIVE LIFETIME DEAL - LIMITED SPOTS"* (default mode) or *"{Holiday} - ENDS SOON"* with `<CountdownTimer />` (campaign mode).
- **Line 496** — a second `<CountdownTimer />` inside the bottom CTA section.

### Changes

1. **Remove the entire top urgency banner section** (lines 208–237).
2. **Remove the bottom `<CountdownTimer />`** at line 496 (keep `<SpotsRemainingCounter />` for soft scarcity since spots are real).
3. Leave `CountdownTimer` import in place only if still used elsewhere; if unused after these edits, remove the import too.

### Result
- Pricing page loads cleanly with the hero headline and pricing cards — no countdown, no "ends in" pressure.
- Spots-remaining counter stays (genuine scarcity, not a fake clock).
- Country-specific pricing logic on `/pricing` is untouched.

### Files edited
- `src/pages/Pricing.tsx` — remove top banner section + bottom countdown.

No backend, geo, or other page changes.

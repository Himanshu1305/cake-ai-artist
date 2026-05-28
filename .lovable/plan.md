## Fix Google Search Console Product schema errors

Reuse the existing OG image (`https://cakeaiartist.com/og-image.jpg`) — no SEO impact since it's already a branded product visual.

### 1. Extend `src/components/SEOSchema.tsx`

Update both `ProductSchema` and `ProductReviewSchema`:
- Add optional `image` prop (defaults to `https://cakeaiartist.com/og-image.jpg`)
- Always emit `brand: { "@type": "Brand", name: "Cake AI Artist" }`
- On `offers`:
  - `hasMerchantReturnPolicy`: `MerchantReturnNotPermitted` (schema.org-approved for digital goods, matches 7-day refund handled via support)
  - `shippingDetails`: zero-cost, 0-day handling (digital delivery)
- Keep all existing fields/props backward compatible

### 2. Pass `image` from callers (only where missing)

- `src/pages/Pricing.tsx` — `ProductReviewSchema` (no change needed if default kicks in; verify)
- `src/pages/CanadaLanding.tsx` — add `image`
- `src/pages/USALanding.tsx`, `UKLanding.tsx`, `AustraliaLanding.tsx`, `IndiaLanding.tsx` — confirm `image` present, add if missing

(Default value in the component means most callers won't need edits, but I'll verify each.)

### Outcome

- Resolves GSC "Missing field 'image'" critical error on `/canada` and `/pricing`
- Resolves "Missing field 'hasMerchantReturnPolicy'", "shippingDetails", and "brand" warnings on all country pages
- No visual or copy changes to the site

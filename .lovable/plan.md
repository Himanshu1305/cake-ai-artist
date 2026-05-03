# Purge Legacy Pricing Across All Pages

## The problem

Although `<PricingPlans />` was added below the hero on each landing page, the **hero blocks themselves still display old founding-member pricing** (₹4,100, £39, C$67, A$75, "Founding Member Special", "Once spots fill", "Claim Your Lifetime Deal"). They also still call `handlePayment('tier_1_49')`, which routes to the legacy lifetime tier instead of the new country-specific lifetime plan. Several other surfaces also leak old prices.

## Files to fix

### 1. Landing page heroes (`IndiaLanding`, `UKLanding`, `CanadaLanding`, `AustraliaLanding`)
Replace the entire hero "Get LIFETIME ACCESS for just …" block (≈ lines 277–363 in India, equivalents in others) with a clean, currency-correct hero that:
- Drops the line-through "regular price" / "save over 10 years" boxes
- Drops `SpotsRemainingCounter`, "Founding Member Special", "Once spots fill, price becomes …", "This offer will NEVER be repeated"
- Removes the "Claim Your Lifetime Deal Now" button + `handlePayment('tier_1_49')` + the Razorpay `currentOrderId` check button
- Replaces it with a short headline + sub-headline + a single CTA that scrolls to the `<PricingPlans />` section below (anchor `#plans`)
- Removes `<UrgencyBanner …>` mount at top of page (banner already neutralised but the component import + mount adds noise; replace with nothing)
- Removes now-unused imports: `SpotsRemainingCounter`, `UrgencyBanner`, `Loader2`, `currentOrderId`, `checkPaymentStatus`, `isCheckingStatus`, `isLoading`, `handlePayment` (keep only what's still used)
- Updates the FAQ schema entry `"What's the price in …"` to reflect 3-tier pricing (Monthly / Yearly / Lifetime in local currency)
- Updates `ProductSchema` price prop to the new lifetime price for that country (₹2999 / £49 / C$69 / A$79)

### 2. `src/pages/Index.tsx` (US homepage)
- Update `countryPricing` map to the new lifetime prices: `IN ₹2,999`, `GB £49`, `CA C$69`, `AU A$79`, `US $49`. Remove the misleading `monthly` / `yearly` / `savings` fields (replace with simple `lifetime` + a sub-line "Monthly and Yearly options also available").
- Remove `<UrgencyBanner …>` import + mount
- If the homepage has its own pricing CTA section, replace with `<PricingPlans country={detectedCountry || 'US'} />`

### 3. `src/pages/FAQ.tsx`
- Replace `PRICING_BY_COUNTRY` (`tier1`/`tier2`) with the new 3-tier map per country
- Rewrite the answer that says "First 200 people pay once …" → describe the actual model: Monthly / Yearly / Lifetime, no spots, no expiry
- Delete the "After those 200 spots fill up, this offer's gone" paragraph

### 4. `src/components/PremiumComparison.tsx`
- Update the per-country fallback prices (line 9) to the real Monthly subscription prices: `IN ₹299/mo`, `GB £4.99/mo`, `CA C$6.99/mo`, `AU A$7.99/mo`, `US $4.99/mo`

### 5. `src/components/PreviewPricingHero.tsx`
- Remove the "Countdown or Spots" block and any old founding/spot copy; have it render localized 3-tier teaser pulling from the same `PRICING` map shape used by `PricingPlans`

### 6. `src/components/SalePreviewModal.tsx` & `src/components/LivePurchaseNotifications.tsx`
- Remove `tier_1_49` / `tier_2_99` branching; show a single generic "Lifetime member" label instead

## New hero block shape (used on all 4 landing pages)

```tsx
<div className="text-center space-y-6 px-4 max-w-4xl">
  <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
    {flag} Pick the plan that fits your celebrations
  </h1>
  <p className="text-white text-lg md:text-xl drop-shadow-md">
    Monthly, Yearly or Lifetime — pay in {currency}. Cancel anytime.
  </p>
  <Button
    size="lg"
    className="bg-gradient-gold hover:shadow-gold text-lg px-8 py-6 font-bold"
    onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
  >
    See Plans →
  </Button>
</div>
```

And the existing `<PricingPlans country="…" />` section gets `id="plans"` on its wrapping `<section>`.

## What stays

- `<PricingPlans />` (already correct — single source of truth)
- `useRazorpayPayment` (already routes correctly on new tiers)
- Edge functions (already updated)
- Legacy `tier_1_49` / `tier_2_99` enum values in the hook/types — kept silently for grandfathered members; no UI surfaces them anymore

## Out of scope

- DB / edge function changes (already done in previous step)
- Subscription self-management UI

Approve to apply the cleanup across all 9 files in one pass.
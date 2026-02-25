

## Plan: Fix 4 Issues — Stuck Saving, Mobile Text Truncation, Wrong Currency, and Generic Deal Name

---

### Issue 1: "Saving" state never resolves

**Root cause:** In `src/components/CakeCreator.tsx` (lines 2471-2503), the Save to Gallery button sets `isSavingToGallery = true` before calling `saveGeneratedImage`, then sets it to `false` after. But there is no `try/catch/finally` — if `saveGeneratedImage` throws (e.g., network error, storage error), the flag stays `true` forever and the button shows "Saving..." indefinitely.

**Fix:** Wrap the save call in a `try/catch/finally` block so `setIsSavingToGallery(false)` always runs, even on error. Show an error toast on failure.

**File:** `src/components/CakeCreator.tsx` (lines ~2484-2502)

---

### Issue 2: Mobile text truncation in hero

**Root cause:** From the screenshot, "Get LIFETIME ACCESS for just $49" is cut off on the right side. The heading text is too wide for mobile screens. The `text-2xl` size combined with the long string overflows the container.

**Fix in `src/pages/Index.tsx`:**
- Reduce hero heading to `text-xl md:text-2xl lg:text-6xl` on mobile
- Add `break-words` or wrap text more aggressively
- Reduce padding/font size on the sale label badge for mobile
- The "Founding Member Special" + spots counter line also overflows — reduce to `text-xs md:text-sm` on mobile

**Fix in `src/pages/IndiaLanding.tsx`:**
- Apply same responsive text sizing to the hero section heading and sale labels

---

### Issue 3: Wrong currency (showing USD instead of INR for Indian users)

**Root cause:** The Index.tsx homepage hardcodes `countryCode="US"` in `<DynamicSaleLabel>` and `<CountdownTimer>` (line 384, 393), and hardcodes "$49" in the heading (line 402). When geo-redirect fails or user lands on the US homepage directly, they see USD pricing regardless of their actual location.

The geo-redirect system should redirect Indian users to `/india`, but the screenshots show the user is on the US homepage seeing "$49". This means either the redirect failed or the user navigated back to `/`.

**Fix:** Instead of hardcoding "US" on the Index page, detect the user's country dynamically (from `useGeoContext` or localStorage preference) and display the correct currency. Replace the hardcoded "$49" with a dynamic pricing lookup from the same `PRICING_DISPLAY` object used in `Pricing.tsx`.

**File:** `src/pages/Index.tsx`
- Import `useGeoContext` and `PRICING_DISPLAY` equivalent
- Use detected country to show correct price in the hero heading
- Pass correct `countryCode` to `<DynamicSaleLabel>` and `<CountdownTimer>`

---

### Issue 4: "New Year" deal naming — replace with generic term

**Root cause:** Multiple pages still reference "Special New Year Lifetime Deal" or "New Year Special" as hardcoded text:
- `src/pages/IndiaLanding.tsx` line 697
- `src/pages/UKLanding.tsx` line 696
- `src/pages/AustraliaLanding.tsx` line 479
- `src/pages/Pricing.tsx` lines 190, 272
- `src/pages/HowItWorks.tsx` line 460
- `src/pages/CanadaLanding.tsx` (likely similar)

**Fix:** Replace all "New Year" references in pricing sections with a generic label like **"Exclusive Lifetime Deal"** or **"Special Lifetime Deal"**. Blog posts about New Year cakes should remain unchanged (they are content, not pricing labels).

**Files:**
- `src/pages/IndiaLanding.tsx` — "Special New Year Lifetime Deal" → "Exclusive Lifetime Deal"
- `src/pages/UKLanding.tsx` — same
- `src/pages/AustraliaLanding.tsx` — same
- `src/pages/CanadaLanding.tsx` — same
- `src/pages/Pricing.tsx` — "New Year Special" → "Lifetime Deal", SEO schema name update
- `src/pages/HowItWorks.tsx` — "New Year Lifetime Deal" → "Lifetime Deal"

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/CakeCreator.tsx` | Wrap save-to-gallery in try/catch/finally to fix stuck "Saving..." state |
| `src/pages/Index.tsx` | Dynamic country detection for pricing display; fix mobile text overflow |
| `src/pages/IndiaLanding.tsx` | Rename "New Year" → generic; fix mobile text sizing |
| `src/pages/UKLanding.tsx` | Rename "New Year" → generic |
| `src/pages/AustraliaLanding.tsx` | Rename "New Year" → generic |
| `src/pages/CanadaLanding.tsx` | Rename "New Year" → generic |
| `src/pages/Pricing.tsx` | Rename "New Year Special" → "Lifetime Deal" |
| `src/pages/HowItWorks.tsx` | Rename "New Year Lifetime Deal" → "Lifetime Deal" |

### Impact
- Fixes the critical "forever saving" bug that blocks users from using the gallery
- Ensures Indian users see INR pricing on the homepage
- Removes outdated "New Year" branding across all pages
- Fixes text truncation on mobile hero sections




## Plan: Remove All Hardcoded USD Pricing — Use Dynamic Country-Based Amounts

### Problem
Three files contain hardcoded `$49`, `$99`, `$9.99`, `$1,149.80`, `$1,099.80`, `$120/year`, `$119.88/year`, and `$1,198.80` amounts that ignore the user's detected country. An Indian user seeing "$49" instead of "₹4,100" is confusing and reduces conversion.

### Scope of Hardcoded $ Found

| File | Hardcoded USD instances |
|------|----------------------|
| `src/pages/Index.tsx` | Hero pricing grid: "$120/year forever", "$49 ONCE", "$1,149.80 over 10 years", "$9.99/month" (lines 438-460) |
| `src/pages/Pricing.tsx` | Savings badges: "$1,149.80 forever" and "$1,099.80 forever" (lines 294, 357). FAQ answers: "$9.99/month", "$49", "$99", "$119.88/year", "$1,198.80" (lines 135, 155, 159). SEO meta tags: "$49" in title/description (lines 166-179). Monthly "$1,198.80 over 10 years" comparison box (line 410 area) |
| `src/pages/FAQ.tsx` | FAQ answers: "$49 or $99" (lines 62, 234) |

### What Will NOT Change
- SEO meta tags in Pricing.tsx `<Helmet>` — these are for search engine crawlers and should remain in USD (international SEO standard)
- Schema.org `ProductSchema` price/currency — must remain USD per structured data spec
- `estimatedCost` in HowToSchema — schema.org standard, keep USD
- Country landing pages (IndiaLanding, UKLanding, etc.) — already use local currency correctly
- Admin.tsx hardcoded "USD" — internal admin tool, correct as-is

### Plan

**File: `src/pages/Index.tsx`**

Expand the `countryPricing` object (line 54-62) to include savings and monthly amounts:

```typescript
const countryPricing = useMemo(() => {
  const pricing: Record<string, { price: string; monthly: string; yearly: string; savings: string; code: string }> = {
    IN: { price: '₹4,100', monthly: '₹899/mo', yearly: '₹10,788/year', savings: '₹1,06,000+', code: 'IN' },
    GB: { price: '£39', monthly: '£7.99/mo', yearly: '£96/year', savings: '£921+', code: 'GB' },
    CA: { price: 'C$67', monthly: 'C$13.99/mo', yearly: 'C$168/year', savings: 'C$1,600+', code: 'CA' },
    AU: { price: 'A$75', monthly: 'A$14.99/mo', yearly: 'A$180/year', savings: 'A$1,700+', code: 'AU' },
  };
  return pricing[detectedCountry || ''] || { price: '$49', monthly: '$9.99/mo', yearly: '$120/year', savings: '$1,149+', code: 'US' };
}, [detectedCountry]);
```

Then replace all hardcoded values in the hero pricing grid (lines 438-461) with `countryPricing.price`, `countryPricing.monthly`, `countryPricing.savings`, etc.

**File: `src/pages/Pricing.tsx`**

- Add a `SAVINGS_DISPLAY` object alongside `PRICING_DISPLAY` with country-specific savings amounts, yearly totals, and 10-year costs
- Replace the hardcoded savings badges on lines 294 and 357 with `SAVINGS_DISPLAY[userCountry]` values
- Replace hardcoded amounts in FAQ answers (lines 135, 155, 159) with dynamic values from `PRICING_DISPLAY[userCountry]`
- Replace the monthly card's "$1,198.80 over 10 years" with a dynamic calculation
- The FAQ items array will need to become a function of `userCountry` so values are interpolated

**File: `src/pages/FAQ.tsx`**

- Import `useGeoContext` to detect country
- Add a pricing lookup (same `PRICING_DISPLAY` structure)
- Replace "$49 or $99" in FAQ answers (lines 62, 234) with dynamic `tier1`/`tier2` values based on detected country

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Expand `countryPricing` to include monthly/yearly/savings; replace hardcoded $ in hero grid |
| `src/pages/Pricing.tsx` | Add savings display object; dynamize FAQ answers and savings badges |
| `src/pages/FAQ.tsx` | Import geo context; replace hardcoded $49/$99 with country-appropriate amounts |


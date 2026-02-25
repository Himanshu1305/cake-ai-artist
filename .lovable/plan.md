

## Plan: Fix Last Hardcoded USD in PremiumComparison

### Problem
`src/components/PremiumComparison.tsx` line 97 still shows `"Upgrade to Premium - $9.99/month"` regardless of user location.

### Fix

**File: `src/components/PremiumComparison.tsx`**
- Import `useGeoContext` from `@/contexts/GeoContext`
- Add a small pricing lookup for the monthly display price
- Replace the hardcoded `$9.99/month` with the country-appropriate amount

The lookup:
```typescript
const MONTHLY_PRICE: Record<string, string> = {
  IN: '₹899/mo', GB: '£7.99/mo', CA: 'C$13.99/mo', AU: 'A$14.99/mo'
};
const monthlyLabel = MONTHLY_PRICE[detectedCountry || ''] || '$9.99/month';
```

Then line 97 becomes:
```tsx
Upgrade to Premium - {monthlyLabel}
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/PremiumComparison.tsx` | Import `useGeoContext`; replace hardcoded `$9.99/month` with dynamic country price |


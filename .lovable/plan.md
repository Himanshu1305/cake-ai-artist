

## Impact Analysis

The CORS header fix has **no negative impact** on any existing functionality — adding extra allowed headers is purely additive. Browsers simply ignore headers they don't send. However, there's a broader finding:

### All 22 Edge Functions Have the Same Old CORS Headers

Every single backend function in the project uses the outdated CORS headers missing the newer client platform fields. This means the same mobile CORS failure could potentially affect **any** function called from mobile, including:

- **Payment functions** (create-razorpay-order, verify-razorpay-payment, check-payment-status) — could block mobile payments
- **save-image-to-storage** — could fail to save generated cakes on mobile
- **generate-logo** — logo generation could fail on mobile
- **generate-party-pack** — party pack generation could fail on mobile
- **detect-country** — geo detection could fail on mobile
- **delete-user-account** — account deletion could fail on mobile

### Recommended Plan Update

Instead of only fixing `generate-complete-cake`, update CORS headers in **all 22 edge functions** to include the full set:

```
authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version
```

Functions with extra custom headers (like `x-razorpay-signature` or `x-test-secret`) will keep those in addition.

The 402 error handling will still only be added to `generate-complete-cake` and `CakeCreator.tsx` as originally planned, since those are the only AI generation functions affected.

**Zero risk of breaking anything** — this change only *allows* more headers through, it doesn't restrict or change any behavior.


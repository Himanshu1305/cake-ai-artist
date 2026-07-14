## Deploy `search-local-vendors` edge function

The function code already exists at `supabase/functions/search-local-vendors/index.ts` and `GOOGLE_PLACES_API_KEY` is already configured in secrets. The migration `20260713000005_vendor_search_usage.sql` for the `vendor_search_usage` table also needs to be applied so the rate-limit logging query doesn't fail at runtime.

### Steps
1. Deploy `search-local-vendors` via the deploy tool.
2. Verify the `vendor_search_usage` table exists; if not, run the migration `20260713000005_vendor_search_usage.sql`.
3. Tail edge function logs to confirm cold start succeeds (no missing-env or import errors).

### Not included
- No code changes to the function itself.
- No changes to `PartyVendorDirectory` or other frontend.
- No other pending migrations (`000001`–`000004`) from the overnight report — deploy those separately when you're ready.

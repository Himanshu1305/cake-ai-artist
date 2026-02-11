

## Temporarily Skip Secret Verification in Test Email Function

### Change

Modify `supabase/functions/test-premium-email/index.ts` to bypass the `x-test-secret` header check so we can test the GST invoice email without needing the secret value.

### File: `supabase/functions/test-premium-email/index.ts`

Comment out or skip the secret verification block (lines ~30-44) so the function processes requests without authorization. This is temporary -- we will re-enable it after testing.

### After Deployment

Once the function is updated, we will call it with:
- **userId**: `15e43e3e-2e56-4d56-b434-9f20cf8b7a46` (himanshu1305@gmail.com)
- **country**: `IN`
- **tier**: `tier_1_49`

This will trigger the new GST Tax Invoice email to verify formatting.

### Important

Re-enable the secret check after testing is complete to keep the endpoint secure.


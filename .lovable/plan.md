

## Plan: Redeploy the Weekly Upgrade Nudge Edge Function

### Problem

The `send-weekly-upgrade-nudge/index.ts` file was updated with all the fixes (localized pricing, correct admin greeting, updated free tier numbers), but the **deployed edge function** is still running the old version. The test email reflects the old deployed code, not the updated file.

### Fix

Redeploy the `send-weekly-upgrade-nudge` edge function so the live version matches the updated source code. After redeployment, the test email will show:

- Localized pricing (₹4,100 for India instead of $49)
- Admin's actual first name instead of "Admin"
- "5 total" generations for free tier in the comparison table
- "5" gallery slots for free tier

### Steps

1. Trigger a redeployment of the `send-weekly-upgrade-nudge` edge function
2. Send a test email to verify all 5 fixes are applied

No code changes needed — the file already contains the correct content.


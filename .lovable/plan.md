

## Plan: Merge Conversion Email into Weekly Upgrade Nudge

The two systems are redundant — both send upgrade emails to free users via Brevo. The "Weekly Upgrade Nudge" is the superior system (4 variants, localized pricing, dedup tracking). We should remove the Conversion Email Campaign and keep only the Weekly Upgrade Nudge.

### Changes

**1. `src/pages/Admin.tsx`**
- Remove the entire "Conversion Email Campaign" card (Send Test Email + Send Conversion Email to Free Users)
- Remove all related state: `sendingConversionEmail`, `sendingTestEmail`, `freeUserCount`, `conversionEmailDialog`
- Remove `sendTestConversionEmail`, `openConversionDialog`, `sendConversionEmails` functions
- Remove the AlertDialog for conversion email confirmation
- The "Weekly Upgrade Nudge" card remains as the single email campaign section

**2. `supabase/functions/send-conversion-email/index.ts`**
- Delete this edge function entirely — it's now fully replaced by `send-weekly-upgrade-nudge`

**3. `supabase/config.toml`**
- Remove the `[functions.send-conversion-email]` entry (if present)

**4. Update `send-weekly-upgrade-nudge/index.ts` conversion email template**
- The conversion email had the updated "5 total" and "5 gallery slots" numbers but the nudge already has these from the earlier update — no content changes needed

### Result
One clean "Weekly Upgrade Nudge" section in Admin with "Send Test Nudge" and "Send Nudge to Free Users" buttons. No duplicate functionality.


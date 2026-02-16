

## Add "Send Test Email" Button for Conversion Email Preview

### What This Does
Adds a "Send Test Email" button next to the existing bulk send button in the Admin dashboard. Clicking it sends the conversion email only to `himanshu1305@gmail.com` (the admin) so you can preview the email before sending to all free users. After adding the button, a test email will be triggered immediately.

### Changes

**1. `src/pages/Admin.tsx`**

- Add a new `sendTestConversionEmail` function that calls `send-conversion-email` with `{ testEmail: "himanshu1305@gmail.com" }` instead of `sendToAll: true`
- Add a "Send Test Email" button next to the existing "Send Conversion Email to Free Users" button in the Conversion Email Campaign card
- Add loading state for the test email button

**2. `supabase/functions/send-conversion-email/index.ts`**

- Add handling for a new `testEmail` parameter in the request body
- When `testEmail` is provided, skip the free-user query and send the conversion email directly to that single email address
- This bypasses the premium/marketing-opt-in checks since it's just a preview

### Flow

1. Admin clicks "Send Test Email" on the dashboard
2. Edge function receives `{ testEmail: "himanshu1305@gmail.com" }`
3. Sends the conversion email to that address only
4. Admin previews in inbox, then uses the existing bulk send button when satisfied

### After implementation, a test email will be sent automatically to `himanshu1305@gmail.com`.



## Free-to-Paid Conversion Email System

### Overview
Create a new edge function and admin trigger to send conversion emails to free users, encouraging them to upgrade to premium. The email will highlight what they're missing and include a direct CTA to the pricing page.

### How It Works
1. Admin clicks "Send Conversion Email" button on the Admin dashboard
2. The system fetches all free (non-premium) users with email addresses
3. Each free user receives a beautifully designed email showcasing premium benefits
4. Admin sees a summary of how many emails were sent

### Email Content Strategy
- Show what they've already enjoyed (free tier features)
- Highlight what they're missing (premium benefits comparison)
- Include lifetime deal pricing with urgency messaging
- Direct CTA button to the pricing page
- Friendly, non-pushy tone

### Technical Plan

**1. New Edge Function: `send-conversion-email/index.ts`**
- Uses Brevo API (consistent with other marketing emails)
- Accepts two modes:
  - `sendToAll: true` -- sends to all free users
  - `userId: "..."` -- sends to a specific user
- Queries the `profiles` table for free users (`is_premium = false`)
- Gets email from `auth.users` via service role
- Sends a styled HTML email with:
  - Logo and gradient header
  - "You've been creating amazing cakes!" opener
  - Side-by-side Free vs Premium comparison table
  - Lifetime deal pricing highlight
  - "Upgrade Now" CTA button linking to `/pricing`
- Logs results to `scheduled_task_runs` table for tracking
- No JWT verification needed (admin-triggered via service role check)

**2. Update Admin Dashboard: `src/pages/Admin.tsx`**
- Add a "Send Conversion Email" button/card in the admin panel
- Shows count of free users who would receive the email
- Confirmation dialog before sending
- Success/error toast with send count

**3. Email Template Design**
- Header: Logo + "Unlock Your Full Creative Potential"
- Section 1: "You've already created X cakes -- imagine what you could do with Premium"
- Section 2: Free vs Premium comparison (5/day vs 150/year, 20 gallery vs 30, no Party Pack vs full access)
- Section 3: Lifetime deal pricing badge (country-aware if possible, fallback to USD $49)
- Section 4: CTA button "Upgrade to Premium"
- Footer: Unsubscribe-friendly note + brand footer

### Files to Create/Modify
- **Create**: `supabase/functions/send-conversion-email/index.ts` -- new edge function
- **Modify**: `src/pages/Admin.tsx` -- add send button in admin dashboard
- **Modify**: `supabase/config.toml` -- register new function with `verify_jwt = false` (uses internal service role auth check)


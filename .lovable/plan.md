## Goal
Give admin a per-user activity view so you can see what each visitor/user did (cakes generated, gallery activity, party packs, parties, premium status) — perfect for outreach with offers.

## What you'll see

For each user (in the existing Admin → Users table), add a "View Activity" button that opens a panel/modal with:

- **Profile summary**: email, name, country, signup date, premium/founding status
- **Cakes created**: total count + list (thumbnails, occasion, recipient name, date)
- **Gallery activity**: how many they featured/starred, likes given, comments posted
- **Party packs generated**: count + list
- **Parties planned**: count + event dates
- **Page visits**: total, last seen, top pages visited
- **Generation usage**: this month's count, lifetime count
- **Engagement signal**: a simple tag like "Hot lead" (created 3+ cakes, free tier), "Active premium", "Window shopper" (visits but no cakes), "Dormant" (no activity 30+ days)

Plus a top-level **filter bar** on the Users table:
- Show only: created cakes / never created / free tier with cakes (best upsell targets) / premium / dormant
- Sort by: most cakes / most recent activity / signup date

## Outreach helper

- Each user row gets a **"Copy email"** and **"Email this user"** button
- Bulk select users matching a filter → **"Export emails as CSV"** for sending campaigns from Brevo

## Technical notes

- All data already exists in your DB (`generated_images`, `gallery_likes`, `gallery_comments`, `party_packs`, `parties`, `page_visits`, `generation_tracking`) — no new tables needed
- Admin RLS policies already grant access on these tables (or we'll add `has_role(auth.uid(),'admin')` SELECT policies where missing — only `parties`, `party_packs`, `gallery_*` need a quick check)
- New file: `src/components/admin/UserActivityPanel.tsx` (the modal)
- Edit `src/pages/Admin.tsx`: extend `loadProfiles` to also fetch aggregate counts per user in one batched query, add the filter bar and "View Activity" button
- The engagement tags are computed client-side from the aggregates

## Out of scope (ask if you want these too)

- In-app email sending (currently you'd copy emails to Brevo). I can add a "Send offer email" button later that triggers an edge function.
- Tracking *which* pages a logged-out visitor saw before signing up (would need session→user linking, which `link_session_visits_to_user` already does — so this works automatically once they sign up).
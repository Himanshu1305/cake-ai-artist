## Goal
Rewrite the Day 2 engagement email so it stops sounding like a welcome email and instead reads as a friendly "we noticed you haven't tried anything yet" nudge with multiple engagement entry points.

## Tone & Framing
- Acknowledge they already signed up (no "welcome")
- Thank them for joining / exploring
- Gently observe: "we noticed you haven't created your first cake yet, browsed the gallery, or read the blog"
- Position as helpful, not salesy — give them choices, not one CTA

## New Day 2 Email Structure

**Subject:** "Did something stop you? Here's what you're missing 🎂"
(Alt option: "Your Cake AI Artist account is waiting ✨")

**Header:** Same brand gradient + logo (unchanged)

**Body sections:**

1. **Greeting + acknowledgement** (2 lines)
   - "Hey {firstName}, thanks again for joining Cake AI Artist!"
   - "We noticed you haven't had a chance to try things out yet — totally fine, life gets busy. Here's a quick tour of what's waiting for you."

2. **"Pick where to start" — 3 feature cards** (the core change)
   Each card = icon emoji + short title + 1-line description + link button:
   - 🎂 **Design your first cake** → `/free-cake-designer` — "Type a name and occasion, get a cake in 30 seconds"
   - 🖼️ **Browse the community gallery** → `/gallery` — "See what others are creating right now"
   - 📖 **Read the blog** → `/blog` — "Cake trends, ideas & tips for every occasion"
   - 🎁 **Try the Party Pack generator** → `/party-planner` — "Matching invites, thank-you cards & more"

3. **Social proof / reviews strip**
   - "⭐⭐⭐⭐⭐ Loved by thousands of creators worldwide"
   - Link → `/gallery` (where ratings/comments live) or testimonial section on homepage

4. **Feedback nudge**
   - "Something not working? Hit reply — we read every email."
   - Optional link to `/contact` or FAQ

5. **Footer** (unchanged: unsubscribe + copyright)

## Visual Style
- Keep existing brand: warm cream `#f8f5f2` body bg, white card, party gradient header, blue `#2563EB` for links/headings
- Feature cards: light bordered boxes (`#fef9f5` bg, party-orange left border like Day 14) stacked vertically — mobile-safe
- Each card has its own small button/link in brand blue, not the big purple gradient (so we offer choices, not one dominant CTA)
- One smaller secondary "Start with a cake →" gradient button at the bottom for users who just want one click

## Files to Change
- `supabase/functions/send-engagement-drip/index.ts` — rewrite `day2Email()` only
- Subject in `SUBJECTS.day2_welcome` updated
- Internal type key `day2_welcome` stays the same (no DB migration needed; it's just an identifier)
- Redeploy edge function after edit

## Out of Scope
- Day 7 and Day 14 templates (leave as-is for now — we'll review them separately after you test Day 2)
- No DB schema changes
- No cron / admin widget changes

## Test Flow
After change: Admin → Scheduled Tasks → "Test Day 2" → review in inbox → iterate copy if needed.

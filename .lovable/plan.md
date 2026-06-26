## Goal
Hit $100+/month within 90 days via two revenue streams: **AdSense** (free traffic) + **Lifetime/subscription upgrades** (intent traffic).

Current blockers: ~2-3 visitors/day, zero paid users, articles published but not indexed/ranking yet, no remarketing.

---

## Month 1 — Traffic Foundation (Weeks 1–4)

**1. Get the 3 comparison articles indexed & ranked**
- Submit all 3 article URLs + sitemap to Google Search Console (you do this).
- Add internal links: every landing page (USA/UK/IN/CA/AU) links to the 3 comparison articles in a "Why we're better than ChatGPT/Canva/Etsy" section.
- Add 3 more comparison articles (cheap to produce, same format): **vs DALL-E**, **vs Midjourney**, **vs Local Bakery**. These target frustrated AI users who already search comparison queries.

**2. Programmatic SEO — the volume play**
The biggest unlock. Build two templated page types:
- `/birthday-cake-for-{name}` — 200 top first names (Aarav, Priya, Emma, Liam, Sophia…). Each page: H1 with name, 3 pre-generated sample cakes for that name, CTA to create your own. Targets "birthday cake with name {X}" (22k/mo IN volume splits across names).
- `/birthday-cake-{theme}` — 30 themes (unicorn, spiderman, frozen, football, etc.). Same template.

That's 230 new indexable pages, all targeting real search demand. Generated once via script, stored in DB, rendered by existing React routes + Helmet metadata.

**3. AdSense placement audit**
- Confirm ads render on: blog list, all 6 comparison articles, all 5 country landings, all programmatic pages.
- Add one in-content ad after the H2 on every article (highest RPM slot).
- Verify `ads.txt` is live.

**Month 1 target:** 100 visitors/day, first AdSense $5-15.

---

## Month 2 — Conversion (Weeks 5–8)

**4. Fix the funnel for paid conversions**
Current free→paid conversion is 0%. Likely causes:
- Free tier (5 cakes) is generous enough that nobody hits the wall.
- Upgrade prompts aren't shown at peak emotional moments.

Changes:
- Show "Upgrade to Lifetime" modal **right after** a successful cake share (peak dopamine), not on a separate pricing page.
- Add "🎁 First-week discount" — ₹999 / $19 lifetime for users in their first 7 days only. Test if low entry price unlocks the first 5-10 buyers.
- Add social proof to checkout: "Member #1247 just joined" live ticker (data already exists).

**5. WhatsApp/Instagram organic loop**
Every shared cake link has "Make yours free" CTA. Verify:
- OG preview image is the user's cake (not generic).
- CTA button visible above the fold on `/cake/{id}`.
- Track share→signup conversion. If <5%, redesign the shared page.

**6. One viral attempt**
Post the "AI Cake Generator vs ChatGPT" article on:
- r/ChatGPT, r/singularity, r/ArtificialIntelligence (organic, value-first comment)
- Hacker News (Show HN)
- Product Hunt (free launch)
- Indian parenting Facebook groups (for IN traffic)

**Month 2 target:** 300 visitors/day, 1-3 paid users ($20-150), AdSense $20-40.

---

## Month 3 — Scale What Works (Weeks 9–12)

**7. Double down based on data**
By week 9 you'll know which channel (SEO / social / programmatic) is driving signups. Kill the rest, 10x the winner.

**8. Paid acquisition test ($50)**
Only if organic shows a clear winning page with >2% signup rate. Google Ads on "birthday cake with name [name]" exact match, sending to the matching programmatic page.

**9. Email recapture**
We have 63 profiles. Send a single broadcast: "We added voice messages + 3D animations. Come make one free." Drives return visits + share loop.

**Month 3 target:** 500+ visitors/day, $100+ MRR (ads + upgrades combined).

---

## What I need from you to start
Pick the first sprint (I'd recommend #2 — programmatic SEO — it's the highest-leverage):
- **A.** Build the programmatic SEO system (#2) — name pages + theme pages. ~1 day of work, 230 pages live.
- **B.** Fix the conversion funnel first (#4) — post-share upgrade modal + first-week discount.
- **C.** Write 3 more comparison articles (#1) — vs DALL-E, vs Midjourney, vs Local Bakery.
- **D.** Do A + C in parallel (most aggressive path).

Which one?

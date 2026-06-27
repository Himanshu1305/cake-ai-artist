# AdSense Readiness Checklist — Cake AI Artist

> Submit Google AdSense **only when this checklist is fully green**. Google rejects sites with thin pages, low traffic, or missing policy pages — and a rejection bakes in a 30–90 day cooldown. Better to spend 3 weeks tightening the site than to be locked out.

---

## ✅ Already in place

- [x] Custom domain `cakeaiartist.com` with HTTPS
- [x] Original product (free AI cake designer) — clearly differentiated from auto-generated affiliate sites
- [x] Privacy Policy page (`/privacy`)
- [x] Terms of Service page (`/terms`)
- [x] Refund Policy page (`/refunds`)
- [x] Contact email (`support@cakeaiartist.com`) visible in footer
- [x] About / brand identity (Cake AI Artist Editorial Team byline on articles)
- [x] Mobile-responsive layout
- [x] Programmatic SEO (162+ pages) with deep content (~1,800 words each on hub pages)
- [x] Three long-form comparison articles (vs ChatGPT/Gemini, vs Canva, vs Etsy) — 2,000+ words each
- [x] FAQ schema, Article schema, Breadcrumb schema
- [x] Sitemap submitted to GSC
- [x] Geo-routing fixed at root (`/`) so analytics show real country distribution
- [x] **Thin pages marked `noindex, follow`** — names without deep meaning entries are now excluded from Google's index. This protects AdSense from "low-value content" rejection.

---

## 🟡 To do BEFORE submitting (estimated 3–4 weeks)

### 1. Traffic baseline (most important)
Google does not publish a minimum, but the practical floor is:
- **~500 unique visitors / month** from organic search (not paid, not referral spam)
- Stable for **at least 2 consecutive weeks** before submission
- **Action**: Check GA4 every Monday. Submit only after 2 green weeks.

### 2. Content depth audit
- [ ] Every indexable page (no `noindex`) has **800+ words of original content**
- [ ] No "Coming soon" / "Under construction" pages live
- [ ] Every blog/article page has a real author byline + dated `LAST_UPDATED`
- [ ] Comparison articles include a clear opinion / recommendation (EEAT signal)
- [ ] At least **20 indexed pages** (we already have 60+ deep pages indexed)

### 3. Policy & trust pages — visible from every page
- [x] Privacy Policy link in footer
- [x] Terms link in footer
- [ ] **Add cookie consent banner** (required for EU/UK/India DPDP traffic) — `react-cookie-consent` is sufficient
- [ ] Add a visible "About" page that names the company, location, and how AI is used

### 4. Technical AdSense prep
- [ ] `ads.txt` file at `/ads.txt` — created **after** AdSense approval (Google gives the publisher ID)
- [ ] No popups/interstitials that violate the [Better Ads Standards](https://www.betterads.org/) — our `PostShareUpgradeModal` is user-triggered, which is allowed
- [ ] No copyrighted images we don't own — verify all featured cake images are AI-generated or licensed
- [ ] No autoplay audio on root pages — cake reveal audio is gated behind a user tap ✅

### 5. Ad slot planning (build BEFORE applying — slots stay empty until approved)
Recommended placements (don't over-stuff — Google penalizes ad density):

| Page type            | Slots | Position                                    |
|----------------------|-------|---------------------------------------------|
| Named cake pages     | 2     | After hero, between message library & FAQ   |
| Themed cake pages    | 2     | After hero, between palette section & FAQ   |
| Comparison articles  | 3     | After intro, mid-article, before conclusion |
| Country landing pages| 1     | Sidebar or after testimonials               |
| Pricing / Auth pages | 0     | **Never put ads on conversion pages**       |
| Cake creator / share | 0     | **Never put ads on the core product flow**  |

**Rule of thumb**: ad slots only on SEO/content pages. Never on pages where a user is about to pay or generate a cake.

### 6. Pre-submission housekeeping
- [ ] Disable any half-finished routes that 404
- [ ] Test all forms (auth, contact, payment) end-to-end on mobile
- [ ] Lighthouse score ≥ 80 on mobile for `/`, `/ai-birthday-cake-with-name`, and one named cake page
- [ ] Search Console showing no critical coverage issues

---

## 🚀 Submission process (when ready)

1. Sign in to https://adsense.google.com with the Google account that should receive payments
2. Add site: `cakeaiartist.com`
3. Paste the AdSense `<script>` snippet into `index.html` (in `<head>`)
4. Wait — review takes **1–14 days**, sometimes 4 weeks
5. Once approved:
   - Create `ads.txt` at project root with the line Google provides
   - Add **manual ad units** (not Auto Ads) to the slot positions above using `<ins class="adsbygoogle">`
   - Monitor for "Policy violation" emails for the first 2 weeks

---

## 💰 Realistic earnings projection

| Monthly visits | Avg RPM (cake niche)        | Monthly revenue |
|----------------|-----------------------------|-----------------|
| 500            | $3 (mostly IN/PH traffic)   | $1.50           |
| 5,000          | $5 (mixed)                  | $25             |
| 25,000         | $8 (with US/UK share growth)| $200            |
| 100,000        | $10                         | $1,000          |

**Implication**: AdSense is a **slow burn**. The fast revenue path is still Party Pack + Lifetime conversions. Treat AdSense as a passive top-up that kicks in once SEO traffic is meaningful.

---

## 📅 Re-audit cadence

Re-run this checklist at the **end of each month** until submission. Once approved, re-audit every quarter to stay compliant — Google has terminated accounts for policy drift years after approval.

_Last updated: 2026-06-27_

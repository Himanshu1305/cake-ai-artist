## Plan: Premium Homepage Redesign + Remove "Exclusive Deal Ends In"

Scope: homepage hero (`src/pages/Index.tsx`) and the top urgency banner (`src/components/UrgencyBanner.tsx`). No other pages, no global token changes, no pricing strategy changes.

Direction: **Premium / elegant** — let the product breathe, lead with the cake (not the price), drop the high-pressure deal framing.

---

### 1. Remove the broken "Exclusive Deal Ends In:" everywhere on the homepage

The current `useHolidaySale` fallback renders an "EXCLUSIVE DEAL ENDS IN:" line with no countdown attached, which is what the user is seeing. The fix is to stop using it on the homepage entirely (the sale system stays intact for when a real campaign is launched).

**File: `src/components/UrgencyBanner.tsx`** — Replace contents.
- Stop reading from `useHolidaySale` for the default state.
- Render a calm, evergreen social-proof bar instead:
  - Desktop: `✨ Join {dynamicCakeCount}+ creators designing AI cakes — start free, no signup needed`
  - Mobile (truncated): `✨ {count}+ creators · Start free`
- Style: thin (~36px) cream→gold gradient, 1px gold border, no pulsing animation.
- Keep the dismiss (X) button + 24h dismissal localStorage logic.
- Click still routes to `/pricing`.
- Keep `onVisibilityChange` and `onHeightChange` props so the sticky nav offset still works.
- (When you later launch a real campaign, we can re-wire it to `useHolidaySale` with a real `endDate` and the countdown will work properly.)

**File: `src/pages/Index.tsx`** — Remove the "EXCLUSIVE DEAL ENDS IN:" pill and countdown from the hero (lines ~390–407: the `motion.div` red pill containing `<DynamicSaleLabel suffix="ENDS IN:" />` and the `<CountdownTimer />` block right below it).

### 2. Premium hero redesign

Replace the entire hero block in `Index.tsx` (~lines 380–466).

**Current problems** (from the live screenshot):
- Full-bleed photo overlay with white text on busy balloons → poor readability + mobile truncation.
- Three competing CTAs (banner, red pill, gold button) all about price.
- No cake actually visible above the fold; first-screen content is 95% sales pitch.
- Pulsing red destructive-color pill reads as alarm, not celebration.

**New layout** — calm two-column, soft cream background, no full-bleed photo:

```text
┌────────────────────────────────────────────────────────────┐
│  [eyebrow chip: ✨ AI CAKE DESIGN STUDIO]                   │
│                                                            │
│  Beautiful, personalized          ┌────────────────────┐   │
│  cakes — designed by AI,          │                    │   │
│  ready in 30 seconds.             │   Hero cake image  │   │
│                                   │   (rounded-2xl,    │   │
│  One-line subhead in muted tone   │    soft gold glow, │   │
│  describing the value.            │    gentle float)   │   │
│                                   │                    │   │
│  [ Design Your Cake Free → ]      │                    │   │
│  [ See examples ]                 └────────────────────┘   │
│                                                            │
│  ★★★★★ 4.9 · 10,000+ cakes designed · No signup to start   │
└────────────────────────────────────────────────────────────┘
```

**Specifics:**
- Background: warm cream gradient `bg-gradient-to-b from-surface via-background to-party-pink/5`. A few decorative blurred gold dots (low-opacity `<div>`s) for celebratory hint without noise. No `partyHero` photo overlay.
- Eyebrow chip: small uppercase tracked text inside a thin gold-bordered pill.
- Headline: `text-4xl md:text-6xl font-bold tracking-tight`, the word **"personalized"** styled with `bg-gradient-gold bg-clip-text text-transparent`.
- Subhead: ~18–20px, `text-muted-foreground`, single sentence.
- Primary CTA: gold gradient button with subtle shimmer (reuse existing `.btn-shimmer`), label "Design Your Cake Free →", scrolls to `#creator`.
- Secondary CTA: ghost/outline button "See examples", links to `/use-cases`.
- Hero image: existing `heroCake` asset inside a rounded card with `shadow-elegant` and a soft gold ring; `float` animation from index.css. On mobile, image stacks above text and is sized smaller.
- Social proof line: rating + dynamic cake count from `useDynamicCakeCount` (real number, not fake spots) + "no signup to start".
- **Remove from hero:** red destructive pill, `CountdownTimer`, "EXCLUSIVE DEAL ENDS IN", "$49 ONCE" callout, strikethrough regular price grid, "NEVER be repeated" red text. Pricing lives on `/pricing` and the section deeper in the page — it does not need to be the first thing a visitor sees.
- Mobile: single column, image first then text, headline `text-3xl`, generous `py-12`, no fixed photo height. Fixes prior text truncation.

### 3. Cleanup

- In `Index.tsx`, remove now-unused imports: `DynamicSaleLabel`, `CountdownTimer`, `partyHero` (and `SpotsRemainingCounter` from the hero usage; verify it's not used elsewhere on the page before removing the import).
- Quietly fix the `NodeJS` namespace TS errors flagged in build output by adding `@types/node` types reference where needed (or replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` in the four flagged files).

### Files Changed

| File | Change |
|------|--------|
| `src/components/UrgencyBanner.tsx` | Replace deal banner with calm evergreen social-proof bar; remove sale-data dependencies |
| `src/pages/Index.tsx` | Replace hero block (~lines 380–466) with premium two-column hero; remove unused imports |
| `src/components/CakeCreator.tsx`, `src/components/CursorSparkles.tsx`, `src/components/LivePurchaseNotifications.tsx`, `src/hooks/useRazorpayPayment.ts` | Quietly replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` to fix existing TS errors |

### Out of scope

- Pricing page, country landing pages, FAQ, footer, nav.
- Global design tokens in `index.css`.
- The countdown / sale data system itself — left intact for real future campaigns; the homepage just stops showing it when there's no real deal.
- Sections of the homepage below the hero (Why Choose, Party Pack, Carousel, Testimonials) — untouched in this pass.

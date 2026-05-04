# Promote Party Planner as a Premium-Only Feature

Goal: Surface the new Party Planner across the app as a clear paid-tier benefit so it acts as an upgrade pull for free users.

## 1. Navigation (src/pages/Index.tsx)

Add a "Party Planner" link in both desktop nav and mobile sheet, with a small `Premium` / `Crown` badge so free users immediately see it's a paid perk.

- Desktop nav (~line 316–328): insert between "How It Works" and "Pricing":
  ```
  Party Planner  [Premium]
  ```
  Uses the existing `Badge` component (`variant="secondary"`) plus a `Crown` icon (lucide-react) in `text-party-gold`.
- Mobile Sheet menu (~line 352–370): mirror the same link + badge.
- Click behavior:
  - Logged-in premium → `/party-planner`
  - Otherwise → `/party-planner` (the page itself already shows the upgrade gate, so the lock screen does the conversion work).

## 2. Homepage feature card (src/pages/Index.tsx)

Add a new "Introducing: AI Party Planner" highlight section just above the pricing/CTA region (after the gallery / before final CTA). Premium-styled:

- Gradient card (party-purple → party-pink), `Crown` icon + "PREMIUM" pill.
- Headline: "Plan the whole party, not just the cake"
- 3 short bullets (matching MVP scope):
  - Conversational AI Party Concierge
  - Smart checklist that adapts to your event
  - Beautiful digital invites with RSVP tracking
- Two CTAs:
  - Primary: "Try Party Planner" → `/party-planner`
  - Secondary: "See Premium Plans" → `/pricing`
- Small note: "Included with every Premium plan — Monthly, Yearly & Lifetime."

## 3. Pricing page reinforcement

- `src/components/PricingPlans.tsx`: add "AI Party Planner with concierge, checklists & RSVP invites" to every paid plan's feature list, and add it to the Free plan as a locked/grayed item ("Party Planner — Premium only") so the value gap is visible.
- `src/components/PremiumComparison.tsx`: add a row `Party Planner` → Free: ✗, Premium: ✓.

## 4. Party Planner gate copy (src/pages/PartyPlanner.tsx)

Tighten the upsell on the lock screen so it converts:
- Title: "Party Planner — Premium feature"
- Subtitle: lists the 3 MVP capabilities + "Included with all paid plans."
- Buttons: "Upgrade to Premium" (→ /pricing) + secondary "See plans & pricing".

## 5. Runtime error fix (quiet)

`PremiumComparison.tsx` (and similar) reference `e.features` / `MONTHLY_PRICE[detectedCountry]` where `detectedCountry` may be undefined on first render — guard with `detectedCountry ?? ''` and ensure the consumer doesn't render before geo is ready, addressing the `can't access property "features", e is undefined` error seen in the preview.

## Files touched

- src/pages/Index.tsx (nav + new homepage section)
- src/components/PricingPlans.tsx (feature line + locked free row)
- src/components/PremiumComparison.tsx (new row + null guard)
- src/pages/PartyPlanner.tsx (sharper upsell copy)

No DB or edge function changes; Party Planner backend is already live.

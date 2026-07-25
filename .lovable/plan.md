## Goals
1. Make the pink background actually pink (not near-white).
2. Show the top urgency banner ("#1 AI Cake Generator… Loved in 30+ countries") on every page, not just landings.
3. Restore the "fuller" feel of the homepage hero (the layout refactor from the last pass made it feel emptier and shifted the background image).

---

## 1. Deeper, warmer pink (site-wide)

In `src/index.css`:
- `--background`: `340 60% 97%` → **`340 70% 92%`** (visibly blush instead of off-white).
- `--surface`: bump saturation/darkness one step so cards still sit above the page.
- `--muted`: `340 30% 94%` → **`340 45% 88%`** so muted chips read as pink, not gray.
- `--border`: retint to `340 35% 85%` for cohesion.
- `--gradient-hero`: `linear-gradient(180deg, hsl(340 80% 90%), hsl(340 70% 94%))` — deeper top, soft fade into the new page background.
- Add a subtle `--gradient-page` band used on section wrappers so long pages get gentle pink variation instead of one flat tone.

Dark mode tokens untouched.

## 2. Global urgency banner

Currently `UrgencyBanner` is mounted individually inside `Index.tsx` and each country landing (`USALanding`, `UKLanding`, `IndiaLanding`, `CanadaLanding`, `AustraliaLanding`). Every other page (Blog, About, Gallery, Pricing, Party Planner, FAQ, name pages, etc.) has no banner.

Fix:
- Mount `<UrgencyBanner />` once in `src/App.tsx` (inside the Router, above `<Routes>`), driven by a small `BannerContext` that exposes `bannerHeight` + `isBannerVisible` so pages that still need to offset their sticky nav can read it.
- Remove the per-page `<UrgencyBanner />` instances from `Index.tsx` and the 5 country landings so it isn't rendered twice.
- Country detection stays: the global instance auto-detects country the same way the current one does; `countryCode` prop becomes optional.
- Hidden routes (e.g. `/admin`, `/auth`, embedded editor routes) get a small pathname-based opt-out inside the global mount.

## 3. Restore the "full" homepage hero

Last pass converted country landing heroes to a two-column grid, but the user is reporting the *homepage* (`Index.tsx`) also feels emptier and the background image shifted. Homepage hero itself wasn't restructured, so what changed is the background: the new near-white `--background` washes out the hero image and the decorative floating emojis are less visible.

Fix for `Index.tsx` hero section only:
- Wrap the hero in a section that uses `background: var(--gradient-hero)` (the new deeper pink fade) plus a soft radial pink glow behind the hero image, so the hero visually anchors again.
- Restore the hero image to its original position: full-bleed on the right on desktop, edge-to-edge on top on mobile, with `object-position: center 30%` so the cake stays framed after the background change.
- Re-enable the decorative confetti/emoji layer above the hero image (was rendered but invisible against near-white).
- Do not change any copy, CTAs, or the sections below the hero.

Country landings keep the two-column grid from the previous fix (that's what made their hero text readable) — only the global background gets the deeper pink.

## Files touched

- `src/index.css` — deeper pink tokens + gradients.
- `src/App.tsx` — mount global `UrgencyBanner`, add `BannerContext`.
- `src/components/UrgencyBanner.tsx` — make `countryCode` optional, self-detect if missing, respect route opt-out.
- `src/pages/Index.tsx` — remove local banner mount, restore hero background + image position.
- `src/pages/USALanding.tsx`, `UKLanding.tsx`, `IndiaLanding.tsx`, `CanadaLanding.tsx`, `AustraliaLanding.tsx` — remove local banner mount, keep two-column hero, consume `bannerHeight` from context for sticky-nav offset.

## Verification

- Build + typecheck.
- Playwright screenshot of `/`, `/blog`, `/pricing`, `/in`, `/uk` at 1280×1800 and mobile 390×844 to confirm: (a) pink is visibly pink, (b) banner is present on all five, (c) homepage hero image is back in its original spot and no longer feels empty.

## Out of scope

- No copy, pricing, or feature-logic changes.
- No dark-mode retune.
- No changes to sections below the homepage hero.
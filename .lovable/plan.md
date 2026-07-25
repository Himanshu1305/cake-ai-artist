# Fix visual consistency + homepage readability

## What's wrong (verified from live screenshots)

**1. Inconsistent backgrounds across pages**
Each page uses its own gradient wrapper, so the site feels like several different apps stitched together:
- Home (UK landing at `/`) — pink/orange balloon photo behind hero, then cream
- `/about` — peach/orange gradient
- `/blog`, `/gallery`, `/how-it-works` — purple/lavender gradient
- `/faq` — pink → purple gradient
- `/pricing` — mostly cream (this is the target look)
- Body token is already correct (`--background: 35 50% 98%` cream) — the drift comes from per-page section wrappers overriding it with `bg-gradient-*`, `from-party-*`, and full-bleed hero images.

**2. Homepage hero is unreadable (both mobile and desktop)**
On `/` (renders `UKLanding` via geo routing):
- The H1 "The UK's Favourite Free AI Cake Generator" sits directly on a bright balloon photo with no scrim → text disappears into the image.
- The "QUICK ANSWER" `AnswerBox` overlaps the hero image on mobile — it's positioned inside the hero band instead of below it.
- Large sections below the hero render nearly invisible text ("Actually Looks Good" etc.) because foreground color is too light on the pastel gradient.
- Overall the hero band is too tall on mobile, pushing all real content off-screen.

The same hero pattern is used in `USALanding`, `IndiaLanding`, `CanadaLanding`, `AustraliaLanding` — fix once, apply to all five.

## Fix plan

### A. Unify page backgrounds (site-wide)
1. Establish a single canonical page shell: cream `bg-background` with an optional subtle top gradient (`bg-gradient-surface`) — matching `/pricing`.
2. Remove per-page full-bleed color gradients from:
   - `src/pages/About.tsx`
   - `src/pages/Blog.tsx`
   - `src/pages/Gallery.tsx`
   - `src/pages/HowItWorks.tsx`
   - `src/pages/FAQ.tsx`
   - `src/pages/CommunityGallery.tsx`
   - the five landing pages (`UKLanding`, `USALanding`, `IndiaLanding`, `CanadaLanding`, `AustraliaLanding`)
3. Keep accent color only inside hero eyebrow chips, buttons, and card highlights — never as full-page backgrounds.
4. Keep `UrgencyBanner` (top pink bar) as the single site-wide color accent.

### B. Fix homepage hero readability
In the shared landing hero block (used by all five country landings):
1. Replace the full-bleed balloon photo with a contained hero: photo on the right (desktop) or as a smaller framed image below the copy (mobile), never behind the H1.
2. Give the H1/subhead a solid cream surface so text always has ≥4.5:1 contrast; drop the current gradient-over-photo treatment that makes the title fade out.
3. Move `AnswerBox` (QUICK ANSWER) out of the hero band into its own section directly below, with normal card styling — so it never overlaps the hero image on mobile.
4. Tighten hero vertical padding on mobile (`py-8` instead of the current tall band) so the fold shows the CTA + first proof section, not empty gradient.
5. Audit muted-text usage in "Why People Love This" and similar sections — swap `text-muted-foreground` on pastel backgrounds for `text-foreground` where contrast fails.

### C. Verify
- Playwright screenshot pass across `/`, `/pricing`, `/gallery`, `/blog`, `/about`, `/how-it-works`, `/faq`, `/free-ai-cake-designer` on mobile (390px) and desktop (1280px).
- Confirm: (a) every page shares the cream shell, (b) hero H1 and QUICK ANSWER never overlap the hero image, (c) all body copy is legible.

## Out of scope
- No changes to functionality, routing, SEO copy, or the design tokens themselves.
- No redesign of individual sections beyond the hero — just background unification + hero fix.
- Country geo-routing behavior stays as-is; only the shared landing hero markup changes.

## Technical notes
- Shared hero markup currently lives inline in each of the five `*Landing.tsx` files (they were forked). I'll extract the hero into a single `LandingHero` component in `src/components/` so the fix applies once and future drift is prevented.
- Backgrounds are controlled by wrapper `div`s using Tailwind gradient utilities; replacing them with `bg-background` (or removing the wrapper) is a mechanical edit per file.
- No CSS token changes needed — `--background` is already the correct cream.

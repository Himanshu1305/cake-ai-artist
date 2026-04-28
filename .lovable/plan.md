## Plan: Premium Homepage Hero + Remove "Exclusive Deal Ends In"

The previous attempt didn't actually edit the files (they're unchanged). This plan re-applies the redesign and will run as soon as you approve.

Scope: 2 files only — `src/components/UrgencyBanner.tsx` and `src/pages/Index.tsx` (hero block, lines ~380–466). Everything below the hero stays as-is.

### 1. Top banner — kill the broken "EXCLUSIVE DEAL ENDS IN:"

Rewrite `UrgencyBanner.tsx` to a calm evergreen social-proof bar. Stop reading from `useHolidaySale` for the default state (the sale system stays intact for real future campaigns).

- Copy: `✨ Join 10,000+ creators designing AI cakes — start free, no signup needed` (mobile shortens to `✨ 10,000+ creators · Start free`).
- Use `useDynamicCakeCount` for the live number when available, fallback to `10,000`.
- Style: thin (~36px), warm cream→gold gradient (`bg-gradient-gold` with reduced intensity), 1px gold border, no pulsing, no countdown, no "spots remaining".
- Keep the dismiss (X) + 24h localStorage logic.
- Click → `/pricing`.
- Keep `onVisibilityChange` and `onHeightChange` props so the sticky nav offset still works.
- Remove imports: `useHolidaySale`, `CountdownTimer`, `SpotsRemainingCounter`, `Zap`.

### 2. Hero — premium two-column redesign

Replace lines ~380–466 in `Index.tsx`. No more full-bleed balloon photo with white text on busy background.

```text
┌────────────────────────────────────────────────────────────┐
│  [✨ AI CAKE DESIGN STUDIO]                                 │
│                                                            │
│  Beautiful, personalized           ┌─────────────────┐     │
│  cakes — designed by AI,           │                 │     │
│  ready in 30 seconds.              │   Hero cake     │     │
│                                    │   (rounded,     │     │
│  Describe any occasion. Get a      │   gold glow,    │     │
│  stunning custom cake design       │   gentle float) │     │
│  you can share or order.           │                 │     │
│                                    └─────────────────┘     │
│  [ Design Your Cake Free → ]                               │
│  [ See examples ]                                          │
│                                                            │
│  ★★★★★ 4.9 · 10,000+ cakes designed · No signup to start   │
└────────────────────────────────────────────────────────────┘
```

**Specifics:**
- Background: `bg-gradient-to-b from-surface via-background to-party-pink/5`, plus 2–3 large blurred low-opacity gold circles for depth. No `partyHero` photo.
- Eyebrow: small uppercase tracked chip, gold border, cream fill.
- Headline: `text-4xl md:text-6xl font-bold tracking-tight`, "personalized" wrapped in `bg-gradient-gold bg-clip-text text-transparent`.
- Subhead: `text-lg md:text-xl text-muted-foreground`, max-w-prose.
- Primary CTA: gold gradient, label "Design Your Cake Free →", scrolls to `#creator`. Reuse `.btn-shimmer` if present.
- Secondary CTA: outline button "See examples" → `/use-cases`.
- Hero image: existing `heroCake` asset, `rounded-2xl`, `shadow-elegant`, soft gold ring, `animate-float`. Mobile: stacks below text, smaller.
- Social proof line: ★ rating + dynamic cake count (`useDynamicCakeCount`) + "no signup to start".
- **Removed from hero:** red destructive pill, `DynamicSaleLabel`, `CountdownTimer`, "Get LIFETIME ACCESS for just $X" headline, `SpotsRemainingCounter`, the 3-column strikethrough pricing grid, `partyHero` background, "NEVER be repeated" line.
- Mobile: single column, image above text, headline `text-3xl`, `py-12 md:py-20`. Fixes prior text truncation.

### 3. Cleanup

- Remove now-unused imports from `Index.tsx`: `DynamicSaleLabel`, `CountdownTimer`, `partyHero`, `SpotsRemainingCounter` (verify it's not used elsewhere in the file before removing).
- Quietly fix the runtime warnings flagged in the console (`forwardRef` on `ShareInstructions` consuming a `ref` from `Dialog`, and the `e.features undefined` guard) — wrap `ShareInstructions` in `React.forwardRef` and add an undefined check at the source of `e.features`.

### Files Changed

| File | Change |
|------|--------|
| `src/components/UrgencyBanner.tsx` | Replace deal banner with calm evergreen social-proof bar |
| `src/pages/Index.tsx` | Replace hero block with premium two-column hero; remove unused imports |
| `src/components/ShareInstructions.tsx` | Wrap in `forwardRef` to clear console warning |
| (file responsible for `e.features`) | Add undefined guard — will locate during implementation |

### Out of scope

- Pricing page, FAQ, country pages, footer, nav.
- Global tokens in `index.css`.
- Sale data system itself — left intact for real future campaigns.
- Sections of the homepage below the hero.

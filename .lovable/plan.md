# Three-Part Polish: Confetti, Hover Pop, Country SEO

Addressing all three issues you raised.

---

## 1. Confetti not appearing on homepage

**Cause:** The `@keyframes confetti-fall` and `.animate-confetti` class exist in `src/index.css`, but no component actually renders confetti pieces — so nothing falls. Only the slow `<FloatingEmojis />` runs (and it has a 2-second startup delay).

**Fix:** Create a new lightweight, CSS-only `<ConfettiRain />` component and mount it on the homepage (and country landings) just like `<FloatingEmojis />`.

- Renders ~30 colored rectangles (party-pink, party-purple, party-gold, party-coral, party-mint) using `position: fixed`, `pointer-events: none`, `z-index: 0`.
- Each piece gets a random `left%`, `animation-delay`, `animation-duration` (5–9s), and rotation — all inline styles set once on mount, no JS animation loop.
- Reuses existing `.animate-confetti` keyframe (already in `index.css`).
- Respects `prefers-reduced-motion` via the existing media query block (will add a guard).
- Generated **once** on mount (not on an interval) to keep the main thread free.

**File:** `src/components/ConfettiRain.tsx` (new) — mounted in `Index.tsx`, `IndiaLanding.tsx`, `UKLanding.tsx`, `CanadaLanding.tsx`, `AustraliaLanding.tsx`.

---

## 2. Images not popping on hover

**Cause:** `CakeWall.tsx` already has `hover:scale-105 hover:rotate-0`, but the continuous `animate-wall-bob` keyframe overwrites the `transform` property, so the hover scale is being immediately reset by the running animation. Also, `scale-105` is subtle.

**Fix:** In `src/components/CakeWall.tsx` and `src/index.css`:

1. On hover, **pause the bob animation** (`hover:[animation-play-state:paused]`) so transform changes stick.
2. Increase the pop: `hover:scale-110` (was 105), and add `hover:z-20` so the lifted tile rises above neighbors.
3. Add a colored ring/glow on hover: `hover:shadow-[0_20px_60px_-10px_hsl(var(--party-pink)/0.6)]`.
4. Add a soft "pop" transition: `transition-transform duration-300 ease-out`.
5. Make the inner image also scale slightly (`group-hover:scale-105`) for a layered zoom feel.

---

## 3. Per-country SEO variants

Currently the four country landings use generic titles like *"AI Cake Designer UK - Beautiful Personalised Cakes"*. We'll mirror the homepage's keyword strategy (*best AI cake designer*, *best personalized cakes*) with country qualifiers, and add the missing `<meta name="keywords">`, `<link rel="canonical">`, and Open Graph tags.

### New meta per country

**India** (`/india`)
- Title: `Best AI Cake Designer in India — Personalized Birthday Cakes | Cake AI Artist`
- Description: `India's best AI cake designer. Create personalized cakes for birthdays, Diwali, anniversaries in 30 seconds. Loved by 5,000+ Indian families.`
- Keywords: `best ai cake designer india, personalized cake india, birthday cake design india, diwali cake, ai cake maker india`
- Canonical: `https://cakeaiartist.com/india`
- H1 update: `India's Best AI Cake Designer for Personalized Celebrations`

**UK** (`/uk`)
- Title: `Best AI Cake Designer UK — Personalised Birthday Cakes | Cake AI Artist`
- Description: `The UK's best AI cake designer. Design personalised cakes for birthdays, weddings, garden parties in seconds. Loved by thousands across Britain.`
- Keywords: `best ai cake designer uk, personalised cake uk, birthday cake design britain, ai cake maker england`
- Canonical: `https://cakeaiartist.com/uk`

**Canada** (`/canada`)
- Title: `Best AI Cake Designer Canada — Personalized Birthday Cakes | Cake AI Artist`
- Description: `Canada's best AI cake designer. Personalized cakes for birthdays, Canada Day, hockey parties — designed by AI in 30 seconds.`
- Keywords: `best ai cake designer canada, personalized cake canada, birthday cake design toronto, ai cake maker canada`
- Canonical: `https://cakeaiartist.com/canada`

**Australia** (`/australia`)
- Title: `Best AI Cake Designer Australia — Personalised Birthday Cakes | Cake AI Artist`
- Description: `Australia's best AI cake designer. Personalised cakes for birthdays, Australia Day, beach parties — designed by AI in seconds.`
- Keywords: `best ai cake designer australia, personalised cake australia, birthday cake design sydney, ai cake maker au`
- Canonical: `https://cakeaiartist.com/australia`

Plus shared additions per page:
- `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:url">`, `<meta property="og:image">` (uses existing party hero asset)
- `<meta name="twitter:card" content="summary_large_image">`
- Update H1 visible on each page to include "Best AI Cake Designer in {Country}"

---

## Files changed

- **New:** `src/components/ConfettiRain.tsx`
- **Edited:** `src/components/CakeWall.tsx` (hover pop + pause bob)
- **Edited:** `src/index.css` (reduced-motion guard for confetti, optional)
- **Edited:** `src/pages/Index.tsx` (mount `<ConfettiRain />`)
- **Edited:** `src/pages/IndiaLanding.tsx`, `UKLanding.tsx`, `CanadaLanding.tsx`, `AustraliaLanding.tsx` (Helmet meta + mount confetti + H1 keyword update)

No backend/database changes. All animations remain CSS-only.

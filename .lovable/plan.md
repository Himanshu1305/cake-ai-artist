## Is pink "bad"? No — pink is on-brand and on-category.

Quick analysis of what's actually going on:

- **Category convention.** Cake / bakery / celebration sites overwhelmingly use warm pinks, blush, and coral (Milk Bar, Magnolia Bakery, Sprinkles, Flour Shop). A cream/white base makes the site feel like a SaaS dashboard, not a party brand.
- **SEO/brand fit.** Semrush shows your traffic comes from birthday / celebration / "cake with name" intent (`ai birthday cake`, `birthday cake and name` — 590/mo, `40th birthday cake` — 1,900/mo). Those visitors expect celebratory warmth, not neutral cream.
- **What actually broke earlier wasn't the pink.** The real problems were: (1) five different gradient themes across pages (peach on /about, purple on /blog, pink-purple on /gallery) — that inconsistency is what felt "off", not pink itself; (2) white H1 sitting on a bright photo with only a weak scrim — a contrast bug, not a color-choice bug.

So the fix is: **bring pink back, but as one consistent, restrained system** — and keep the readable stacked hero we just built.

---

## Plan

### 1. New canonical background — soft blush, not cream
Update `--background` in `src/index.css` from cream (`35 50% 98%`) to a warm blush (`340 60% 97%` — barely-there pink wash). Nudge `--surface` and `--muted` to the same hue family so cards still pop against the page. Result: every page reads as pink-tinted without any per-page gradient.

Remove the leftover `bg-gradient-celebration` / `bg-gradient-subtle` / `bg-gradient-surface` wrappers so pages inherit this one background — no more purple `/blog`, peach `/about`, lavender `/how-it-works`.

### 2. Add a "hero band" pink accent
Introduce `--gradient-hero: linear-gradient(180deg, hsl(340 75% 94%), hsl(35 50% 98%))` — a soft blush-to-cream vertical fade — and apply it only to the hero `<section>` on the 5 country landings and `/`. This gives back the celebratory pink feel at the top of the page without repeating the mistake of coloring the whole page differently everywhere.

### 3. Keep the readable hero structure (don't revert)
Keep the two-column stacked layout from the previous fix (H1 on solid surface, contained image beside/below, AnswerBox below hero). We're only changing the *color wash behind it*, not going back to white-text-on-photo.

### 4. Re-tint supporting tokens for cohesion
- `--muted-foreground`: slightly warmer to stay legible on blush.
- `--border`: shift to `340 25% 90%` so card edges tie into the pink base.
- Keep `--primary` (party-pink) and gold accents unchanged — they already work.

### 5. Sweep for lingering per-page gradients
Audit and remove/replace any remaining `bg-gradient-celebration|subtle|surface` at the top-level of pages so nothing overrides the new blush base. Section-level accent gradients (feature cards, CTAs) stay.

### 6. Verify
- Screenshot `/`, `/india`, `/uk`, `/usa`, `/blog`, `/gallery`, `/about`, `/how-it-works`, `/faq`, `/pricing` at mobile + desktop.
- Confirm: same pink base everywhere, H1 legible, hero image no longer sitting under text, AnswerBox below the hero.

---

## Technical details

**Files to edit:**
- `src/index.css` — update `:root` tokens: `--background`, `--surface`, `--muted`, `--border`, `--muted-foreground`; add `--gradient-hero`.
- `tailwind.config.ts` — add `'gradient-hero': 'var(--gradient-hero)'` under `backgroundImage`.
- `src/pages/UKLanding.tsx`, `USALanding.tsx`, `IndiaLanding.tsx`, `CanadaLanding.tsx`, `AustraliaLanding.tsx` — add `bg-gradient-hero` to the hero `<section>` wrapper.
- `src/pages/Index.tsx` — same hero-band accent if it renders its own hero at `/`.
- Sweep: `rg "bg-gradient-(celebration|subtle|surface)"` and remove any top-level page wrappers still using them; leave section-level accents alone.

**Tokens (HSL, per design system):**
```
--background: 340 60% 97%;   /* soft blush wash */
--surface:    340 40% 98%;
--muted:      340 30% 94%;
--border:     340 25% 90%;
--gradient-hero: linear-gradient(180deg, hsl(340 75% 94%), hsl(340 60% 97%));
```

**Out of scope:** no changes to typography, buttons, or component logic. Purely the color base + hero accent band.

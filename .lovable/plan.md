## Why the score didn't move

The previous round shipped (PageSpeed confirms `/hero-cake.webp` is preloaded and `logo.png` is 119 KB), but the report exposes deeper issues we didn't address:

1. **LCP element is the H1 text, not the hero image.** "Element render delay = 9,540 ms" means the H1 waits for ~707 KB of JS to download + parse + React to mount before it paints. Compressing images can't fix this.
2. **Main JS bundle is 707 KB with 445 KB unused** because `App.tsx` statically imports every page (Admin, Blog, Pricing, IndiaLanding, etc.) into the homepage bundle.
3. **Hero webp is 1200×1200 but displayed at ~300×200** → 284 KB wasted.
4. **Logo is still a 256×256 PNG (119 KB) shown at 70×70** → 118 KB wasted.
5. **Featured-cake JPGs are 1024×1024**, displayed at 560×560.
6. **Render-blocking Google Fonts CSS** still adds ~1,560 ms to FCP.
7. **No `Cache-Control` headers** on `/assets/*` — 1.77 MB wasted on repeat visits (Lovable hosting default; we can mitigate via filename hashing which Vite already does, but the headers themselves are out of code's control).

## Plan

### 1. Route-split the JS bundle (biggest single win)
In `src/App.tsx`, convert every page import except `Index` to `React.lazy()` and wrap `<Routes>` in `<Suspense fallback={null}>`. Expected: index bundle drops from ~707 KB to ~250 KB, removing ~3 s of script parse on Moto G.

### 2. Make LCP paint before React mounts
Add a static fallback H1 + hero `<img>` inside `<div id="root">` in `index.html`. React's `createRoot().render()` replaces it once mounted, so there's zero visual change — but the browser paints the H1 instantly, dropping LCP from 11 s to under 3 s.

```html
<div id="root">
  <main style="min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:24px;font-family:system-ui">
    <img src="/hero-cake.webp" width="600" height="400"
         style="width:100%;max-width:560px;height:auto;border-radius:24px"
         alt="AI-designed celebration cake" fetchpriority="high"/>
    <h1 style="font-size:clamp(28px,5vw,56px);font-weight:800;text-align:center;margin-top:24px">
      The Best AI Cake Generator &amp; Designer for Personalized Birthday Cakes
    </h1>
  </main>
</div>
```

### 3. Properly size assets
- Re-encode `public/hero-cake.webp` to 800×800 at quality 78 (target ≤80 KB), keep aspect ratio.
- Convert `public/logo.png` → `public/logo.webp` at 96×96 (target ≤6 KB); update `index.html` favicon + Footer/Nav `<img>` references with explicit `width={40} height={40}`.
- Resize `src/assets/featured-cake-{1..5}.jpg` and `celebration-cake.jpg` from 1024² to 640² at quality 75 (target ~40 KB each, saves ~400 KB total).

### 4. Stop fonts from blocking render
- Switch the critical Google Fonts `<link rel="stylesheet">` to the `preload`-then-swap pattern (same trick already used for the script fonts), so the 780 ms × 2 RTT no longer blocks FCP.
- Add `font-display: swap` query already present via `&display=swap`; combined with the non-blocking pattern, FCP drops by ~1.5 s.

### 5. Trim the DOM / non-composited animations
- Reduce `ConfettiRain` `count` prop from 32 → 14 and only mount it via `DeferredMount` (already partly done) — eliminates the 36-child `.fixed` div from the initial DOM (currently the "most children" node in Lighthouse) and removes 4 of the 10 non-composited animations.
- Wrap `FloatingEmojis` in `DeferredMount` too.

### 6. Misc cleanup
- Remove unused `import heroCake from "@/assets/hero-cake.jpg"` from `src/pages/Index.tsx` (dead import bloating the chunk).
- Drop `embla-carousel-autoplay` import from the homepage if the carousel is below the fold — keep it lazy via dynamic `import()` inside an effect.

## Files to edit / create

- `src/App.tsx` — lazy-load all non-Index routes, add `<Suspense>`.
- `index.html` — inline static LCP markup in `#root`; convert critical Google Fonts to non-blocking preload; update logo to `.webp`.
- `src/pages/Index.tsx` — remove dead `heroCake` import; wrap `ConfettiRain` + `FloatingEmojis` in `DeferredMount`; lazy-load Autoplay plugin.
- `src/components/ConfettiRain.tsx` — default `count` to 14.
- `src/components/Footer.tsx` + nav references — use `/logo.webp` with explicit width/height.
- `public/hero-cake.webp` — re-encode to 800×800 ≤80 KB.
- `public/logo.webp` — new 96×96 ≤6 KB asset (keep `logo.png` for legacy refs).
- `src/assets/featured-cake-1..5.jpg`, `src/assets/celebration-cake.jpg` — resize to 640² and re-save at quality 75.

## Expected outcome

| Metric | Before | After (target) |
|---|---|---|
| Performance | 55 | 90+ |
| FCP | 6.0 s | < 1.8 s |
| LCP | 11.0 s | < 2.5 s |
| Speed Index | 17.0 s | < 4 s |
| Total transfer | 2,048 KiB | ~700 KiB |
| Main JS bundle | 707 KiB | ~250 KiB |

No visual or functional changes for users — the static `#root` fallback is replaced by React on mount.

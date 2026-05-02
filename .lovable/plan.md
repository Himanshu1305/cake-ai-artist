## Performance Audit Findings

Current Lighthouse: **Desktop 71 / Mobile 86**. Bottlenecks identified from code & assets:

| Issue | Impact | Evidence |
|---|---|---|
| `index.html` preloads `/hero-cake.jpg` which **does not exist in `/public`** | Wasted request, delayed LCP | `public/` has no `hero-cake.jpg`; actual hero is `src/assets/hero-cake-animated.webp` (303 KB) |
| **`/public/logo.png` is 1.6 MB** | Used in nav, mobile menu, favicon, apple-touch-icon — blocks LCP | `ls -lh public/logo.png` = 1.6 MB |
| Single Google Fonts request loads **13 font families** (Fraunces, Inter, + 11 script fonts) as render-blocking CSS | ~400-600 ms render block | `index.html` line 67 |
| Heavy above-the-fold widgets render synchronously: `ExitIntentModal`, `LiveActivityFeed`, `LivePurchaseNotifications`, `FeedbackWidget`, `ConfettiRain` (36 DOM nodes), `FloatingEmojis` | Inflates TBT/SI; not needed for first paint | `src/pages/Index.tsx` lines 275-284 |
| `framer-motion` imported eagerly on Index | ~50 KB gzipped in main bundle | Index.tsx line 34 |
| Featured cakes query fires on mount (homepage) without index priority | Network waterfall | Index.tsx line 96 |
| No mobile-specific cache headers; `Cache-Control: no-cache` set globally in `index.html` | Repeat-visit performance hurt | Lines 17-19 |

LCP target on home page = the hero cake image (`hero-cake-animated.webp`). It is correctly `fetchpriority="high"` and `loading="eager"`, but it competes with the 1.6 MB logo and an invalid preload.

---

## Plan

### 1. Fix wasted/incorrect preloads (Quick win — biggest impact)
- **Remove** the broken `<link rel="preload" as="image" href="/hero-cake.jpg">` from `index.html`.
- **Add** correct preload for the actual LCP image — the animated webp — using its built (hashed) URL via a small inline `<link rel="modulepreload">` strategy. Since Vite hashes `src/assets`, instead expose the hero as a separate `<link>` injected in `HeroCakeWithFlames` via `react-helmet-async`, OR copy a **compressed static** version into `/public/hero-cake.webp` and preload that.
- Recommended: copy `hero-cake-animated.webp` → `public/hero-cake.webp`, preload it, and switch `HeroCakeWithFlames` to reference the `/public` path. Keeps hash-stable URL for preload.

### 2. Compress logo.png (Quick win)
- Regenerate `public/logo.png` at proper size (max 256×256, ~20-40 KB) using `imagemagick`/`cwebp`.
- Optionally produce `public/logo.webp` (smaller) and use it everywhere except favicon (favicon stays PNG).
- This single change saves ~1.55 MB on every page load.

### 3. Optimize Google Fonts loading
- Split into **two requests**: 
  - **Critical (render-blocking)**: only `Inter` (body) + `Fraunces` (display) with `display=swap`.
  - **Non-critical (deferred)**: 11 script fonts (Dancing Script, Pacifico, etc.) — load via `<link rel="preload" as="style" onload="this.rel='stylesheet'">` pattern so they don't block first paint. These fonts are only used inside the cake creator (text overlay), not on initial page render.
- Add `<link rel="preconnect">` (already present) — keep.

### 4. Defer non-critical UI on Index page
Convert these to lazy/dynamic imports in `src/pages/Index.tsx`, mounted **after first paint** using `requestIdleCallback` or a 1.5 s `setTimeout`:
- `ExitIntentModal`
- `LiveActivityFeed`
- `LivePurchaseNotifications`
- `FeedbackWidget`
- `ConfettiRain`
- `FloatingEmojis`

Pattern: wrap in a `<DeferredMount>` component that only renders children after idle. Keeps all functionality identical, just delays mount by ~1-2 s.

### 5. Strip unused scripts from initial HTML
- Move the **AdSense bootstrapper** `<script>` (lines 71-96 of `index.html`) into a deferred module loaded after `DOMContentLoaded` + idle. Currently runs synchronously parse-time.
- Remove `Cache-Control: no-cache` meta tags (lines 17-19) — these prevent browser caching of HTML and waste bandwidth on repeat visits. Static asset caching is handled by Vite hashing already.

### 6. Reduce homepage data fetch waterfall
- Move `loadFeaturedCakes()` behind `requestIdleCallback` (or 800ms timeout) so it doesn't compete with LCP image network.
- Add `.limit(10)` instead of `.limit(20)` if only ~10 are shown above-the-fold carousel.

### 7. Lazy-load `framer-motion` consumers
- The Index page only uses `motion.div` for entrance animations. Replace those with simple CSS `@keyframes` (already have `animate-confetti`, etc. in tailwind config) OR keep framer-motion but ensure tree-shaking by only importing `motion` not `AnimatePresence` where unused. Verify imports across pages.

### 8. Verification
After changes, re-run Lighthouse and confirm:
- LCP < 2.0 s desktop, < 2.5 s mobile
- Speed Index < 3.0 s
- No functional regression: hero animates, fonts render, ads still load on consent, exit-intent still triggers, gallery still loads.

---

## Files to be Edited

1. `index.html` — remove broken preload, fix logo refs, optimize fonts, defer AdSense, drop no-cache meta
2. `public/logo.png` — replace with compressed version (write compressed file)
3. `public/hero-cake.webp` — **new file** copied from `src/assets/hero-cake-animated.webp`
4. `src/components/HeroCakeWithFlames.tsx` — switch to `/hero-cake.webp` path
5. `src/pages/Index.tsx` — lazy/deferred mounts for non-critical widgets, defer `loadFeaturedCakes`
6. `src/components/DeferredMount.tsx` — **new** small helper component (idle-callback gate)

## Expected Result

| Metric | Before | After (target) |
|---|---|---|
| Desktop Lighthouse | 71 | 92-96 |
| Mobile Lighthouse | 86 | 94-98 |
| LCP | 3.3 s | 1.4-1.8 s |
| Speed Index | 6.7 s | 2.5-3.0 s |
| Initial transfer | ~2.2 MB | ~600-800 KB |

**Zero functional changes** — every feature continues to work identically; only mount timing and asset sizes change.

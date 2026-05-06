## Issues observed

1. **No visible "background work in progress" indicator.** After Hero arrives, only a toast announces "remaining views rendering in background." The toast auto-dismisses, leaving the empty slots looking broken. Empty slots also don't show a clear shimmer/spinner with text. User assumed generation was done with 1 view.
2. **Top-Down view is over-zoomed.** Current prompt forces "fill 80-90% of the frame" + "minimize blank space above and below" → result is a tight close-up that crops the cake's circular silhouette and looks unappetizing (screenshot 3).

## Fix 1 — Persistent in-grid progress indicator (frontend only)

`src/components/CakeCreator.tsx`

- **Track background state explicitly.** Add `bgPending: Set<number>` (slot indices still rendering) and `bgFailed: Set<number>` (slot indices with a stored `*_error`). Initialize from response (`failedViews` → pending). Update from each Realtime/poll payload. Clear pending entries the moment the corresponding `*_url` arrives; mark failed when `*_error` arrives.
- **Persistent banner above the grid** while `bgPending.size > 0`:
  > "✨ Hero view ready — rendering Side & Top-Down in the background (~30–60s)…" with a small spinner. Stays visible until pending is empty. No toast spam.
- **Per-slot overlay** (the placeholder branch already exists at lines 2424–2429). Tighten it so it always renders for slots in `bgPending`, with three states:
  - Pending: pulse + "Rendering Side View…" / "Rendering Top-Down View…" (use the actual view label).
  - Failed: muted red tint + "This view didn't render" + the existing Regenerate button surfaced (not hover-only).
  - Done: image fades in.
- **Remove the small dismissable toast** that announces background work — replaced by the persistent banner. Keep the final "All views ready!" toast.
- **Slot label cleanup.** "Project preview" tooltip on empty slots (visible in screenshot 1) is just the alt text being read by the platform overlay; ensure each img has an alt that matches the actual view name (already done) and the placeholder overlay covers it so it's not ambiguous.

## Fix 2 — Top-Down view framing (backend prompt only)

`supabase/functions/generate-complete-cake/index.ts` — both `sculptedViewAngles` and `decoratedViewAngles` `top` entries (lines 165–170 and 189–195).

Replace the "fill 80–90% of the frame" instruction with framing that gives breathing room:

> "Professional overhead (bird's-eye / top-down) food photography of a SINGLE, COMPLETE luxurious cake. Camera is **directly above the cake's center, slightly pulled back** so the FULL circular silhouette of the cake is visible with **comfortable margin (15–25%) of negative space** around it (the cake stand, table surface, scattered decorative props like petals, sprinkles, or small macarons may fill the surrounding area). The cake should occupy roughly **55–70% of the frame**, NOT crop to its edge. Sharp focus on the top surface, soft natural studio lighting, magazine-style composition. The complete top decoration (text, photo, designs) must be fully visible and centered."

Also adjust:
- `namePosition` for top view: keep "elegantly around the outer edge or on a decorative banner" but add "fully within the visible cake surface — never clipped at the rim."
- `photoPosition` for top view (decorated + sculpted): change "covering the ENTIRE top surface of the cake from edge to edge" → "centered on the top surface, occupying ~70% of the cake's top with a thin decorated border ring around it." (prevents the photo from being pushed off-frame when the camera is pulled back).

These prompt changes apply to both fresh generation and the manual Regenerate path because both go through the same `viewAngles` definitions.

## Files changed

- `src/components/CakeCreator.tsx` — add bgPending/bgFailed state, persistent banner, tighter per-slot overlay, remove redundant background-progress toast.
- `supabase/functions/generate-complete-cake/index.ts` — rewrite the two `top` view descriptions + their `namePosition` / `photoPosition`.

No DB migration. No pricing/business logic changes.

## Verification

1. Generate a cake (HQ): hero appears → persistent banner reads "rendering Side & Top-Down…" → both slots show their own labeled spinner overlay → fill in via Realtime → banner disappears.
2. Force a background failure: failed slot shows error overlay with always-visible Regenerate button; banner says "1 view needs a retry."
3. Generate a cake with a Top-Down view: result shows the full circular cake with margin around it (not zoomed-in close-up like screenshot 3).
4. Click Regenerate on Top-Down → same well-framed shot.

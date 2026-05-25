
# Issue 3 — Converging cake animation on the shared link

## Research & verdict: YES, this is very doable and a strong idea

**What competitors do today** (sharing flows for AI cake / AI birthday card tools — Cakegram, WishCake, BestWishes.ai, Greetabl, Tribute, Memmo):
- Almost all share **one static image** or a static card.
- A small premium tier (Tribute, Memmo) uses **video reveals**, but those are pre-rendered MP4s — expensive and slow.
- **Nobody** in the AI-cake space currently does a multi-image cinematic "reveal sequence" on the share page. So this would be genuinely novel and very on-brand for "AI Cake Artist."

**Why the current spinning preview feels bad** (confirmed in `CakeSpinShowcase.tsx`):
- It uses `rotateY` 3D CSS on a flat 2D image. The name/text on the cake gets horizontally squashed every half-rotation (`scaleX = |cos(angle)| * 0.85 + 0.15`), which is exactly what you're seeing — text and faces look distorted.
- It's a single image pretending to be 3D. Always going to look "off."

**Why a converging animation is a better fit:**
- All 3 images are already generated and stored — zero extra AI cost.
- It tells a mini story: "Here are 3 angles → they merge into THE cake for you." This raises perceived production value massively.
- It's silent, autoplays on every device (no video codec issues), works in OG/Twitter cards as a still fallback.
- No new heavy deps — Framer Motion (already installed) handles it.

## What I'll build

### 1. Storage: group the 3 images so the share page can fetch all of them
Currently `generated_images` stores each view as a separate row, and `SharedCake.tsx` loads only one row by id (`cake.image_url`, single string). We need a way to fetch its 2 siblings.

Add a `share_group_id uuid` column to `generated_images`. When CakeCreator saves a batch of 3, all three rows get the same `share_group_id`. (Migration + backfill via grouping by user_id + recipient_name + occasion_type + created_at minute window for old rows.)

### 2. SharedCake page: fetch the trio
In `src/pages/SharedCake.tsx`, after loading the primary cake row, also `select image_url` from `generated_images where share_group_id = ?`. Pass the array (1–3 URLs, primary first) into the new component. Falls back gracefully to single image for legacy shares.

### 3. New component: `CakeConvergeReveal.tsx` (replaces `CakeSpinShowcase` on share page)

Reveal sequence (~5.5s total, then idle showcase):

```
0.0s  Black/soft-blur stage, sparkle particles fade in
0.4s  Image A (top-down) flies in from top, tilted -8°, slight blur
0.8s  Image B (front view) flies in from bottom-left, tilted +6°
1.2s  Image C (3-quarter) flies in from bottom-right, tilted -4°
        → all three form a fanned "playing-cards" layout
2.0s  Hold 0.8s — user reads "Choosing your cake…" microcopy
2.8s  Cards rotate to flat, scale down, slide to center, stack
3.6s  Stack cross-fades into the PRIMARY image at full size
4.2s  Confetti burst + soft scale-bounce on final image
4.5s+ Final image holds with a *very subtle* 4s float (translateY 6px) — NO rotation, so name/text stays crisp
```

Implementation notes:
- Pure Framer Motion `motion.img` with `initial/animate` + `transition` (no rotateY on the final image).
- Skip button ("Skip animation →") top-right for repeat visitors; remember in localStorage.
- If only 1 image in the group (legacy share), skip straight to the float-only final state.
- Final image is the user's selected `image_url` (so issue #2's selection logic still wins at the end).
- Tap/click during reveal → jump to final state.

### 4. OG / Twitter card
Keep `og:image` = the single primary `cake.image_url` (still image, since social previews can't show animation). No change needed.

### 5. Remove the spinning download
The "Download spinning preview" WebM button on the share page is removed (it was the source of the distortion complaint). Sender-side download of the still image stays.

## Technical section

**Files changed**
- `supabase/migration` — add `share_group_id uuid` to `generated_images`, index on it, backfill query.
- `src/components/CakeCreator.tsx` — generate one `share_group_id` per batch, write it on all 3 rows in the existing `.from("generated_images").insert(...)` paths (~lines 1069, 412).
- `src/pages/SharedCake.tsx` — extend the loader to fetch sibling URLs by `share_group_id`; render `<CakeConvergeReveal images={[...]} primary={cake.image_url} />` instead of `<CakeSpinShowcase>`.
- `src/components/CakeConvergeReveal.tsx` — new component, ~150 LOC, Framer Motion only.
- `src/components/CakeSpinShowcase.tsx` — leave file (still used elsewhere? check); just stop importing on share page.

**No edge function or AI changes** — all 3 images already exist; this is pure presentation.

**Effort**: ~1 build cycle. No new dependencies.

## Out of scope (for this plan)
- Issues 1, 2, 4 — only researching/planning #3 per your request.
- The bigger "AI video reveal" / "voice-narrated reveal" ideas from earlier analysis.

## Decision needed before I build
Approve this plan, or tell me to tweak the reveal choreography (timing, order, "fanned cards" vs "spinning carousel that collapses inward" vs "3 images orbit then merge").

# Fix: "Choose which cake to share" not working

## Problem

On the result screen there are 3 generated cake views. The social share buttons (Facebook / X / WhatsApp / Instagram and the Web Share sheet behind them) always share the **first** image, no matter which tile the user picked. That's because `handleShare` in `src/components/CakeCreator.tsx` does:

```ts
const firstSelected = Array.from(selectedImages)[0];
const imageUrl = generatedImages[firstSelected];
```

`selectedImages` is a `Set<number>`; `Array.from(...)[0]` returns the lowest index in insertion order, which in practice is always View 1. The per-tile "Share this" button only updates the **magic link** target (`savedCakeImageId`) and only appears after a save, so it doesn't help here either.

## Fix

Introduce a single source of truth for "which view am I sharing right now" and surface it clearly.

1. **New state** in `CakeCreator.tsx`: `shareTargetIndex: number | null` (defaults to `null`, auto-promotes to the first selected index whenever selection changes and current target is no longer selected).
2. **Per-tile "Share this view" pill** (replaces the current hover-only "Share this" that's gated on saved images). Always visible on every non-placeholder tile. Clicking it:
   - Ensures that tile is also in `selectedImages` (so download/save remain consistent).
   - Sets `shareTargetIndex` to that index.
   - If the tile has a saved image id (`savedImageIdByIndex[index]`), also updates `savedCakeImageId` so the Magic Link share stays in sync (existing behavior preserved).
   - Shows a haptic tap + small toast: "Sharing View N".
3. **Visual indicator**: the tile matching `shareTargetIndex` shows a solid pink "Sharing this" badge (reuse existing styling at lines 2587-2613); other selected tiles show the neutral "Share this view" pill.
4. **`handleShare` change**: use `shareTargetIndex ?? Array.from(selectedImages)[0]` instead of always `Array.from(selectedImages)[0]`. Same fix for the composite image used in the Web Share API path.
5. **Helper text** under the grid updated to: "Click a checkmark to select • Click 'Share this view' to choose which one is shared".

No backend, RLS, or edge-function changes. No change to the reveal animation, jingle, magic link route, or generation pipeline.

## Files touched

- `src/components/CakeCreator.tsx`
  - Add `shareTargetIndex` state + small effect to keep it valid.
  - Update tile JSX (~lines 2557–2614) so the share-picker pill is always available and reflects `shareTargetIndex`.
  - Update `handleShare` (~line 1497) to read from `shareTargetIndex` first.
  - Update the helper caption (~line 2645).

## Verification

1. Generate 3 cake views.
2. Select all three with the checkmarks.
3. Click "Share this view" on View 2 → badge moves to View 2.
4. Click WhatsApp / Facebook / X / Instagram → downloaded composite + Web Share file is View 2 (filename and preview confirm).
5. Click "Share this view" on View 3 → repeat, confirm View 3 is shared.
6. Without picking any target, click a share button → falls back to first selected (current behavior, no regression).
7. After save, confirm the magic share link (`/cake/:id`) still points to the chosen view.

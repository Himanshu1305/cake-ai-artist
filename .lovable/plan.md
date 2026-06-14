## Issue 1 — Sequence plays while splash is up

The fix is to delay the reveal until the recipient taps the splash.

**`src/pages/SharedCake.tsx`**
- Add `enabled={opened}` to the `CakeConvergeReveal` usage.

**`src/components/CakeConvergeReveal.tsx`**
- Accept `enabled?: boolean` (default `true`).
- Both effects (preload + sequencing) become no-ops when `enabled === false`. While disabled, render a placeholder showing only the `primary` image so the card visual stays consistent.
- When `enabled` flips to `true`, the preload effect kicks off, then the sequencing effect starts at step 0. This guarantees the recipient watches all 3 images from the start.

## Issue 2 — Top view sometimes isn't last

Root cause: parallel generation → non-deterministic `created_at` order. We need a stable view tag.

### Step A — Add `view_type` to `generated_images` (migration)

- Add nullable `view_type text` column (values: `front`, `side`, `top`, `main`, `angle`, or `null` for legacy). No CHECK constraint — keep it flexible.
- Index not required (table is small and we filter by `share_group_id` anyway).
- Backfill best-effort: for each `share_group_id`, set the *latest* `created_at` row to `view_type = 'top'`, the earliest to `front`/`main`, and the middle to `side`/`angle`. Imperfect for old data but matches the current "usually-correct" behavior, so old shares don't regress.

### Step B — Save `view_type` on insert

**`src/components/CakeCreator.tsx`** — in the persist loop (around line 1215), map the `index` to a view tag based on `cakeStyle`:
- decorated: `0 → front`, `1 → side`, `2 → top`
- sculpted:  `0 → main`,  `1 → angle`, `2 → top`

Include `view_type` in the insert payload.

### Step C — Deterministic ordering in `get_public_cake`

Replace the `ORDER BY (s.id = gi.id) DESC, s.created_at ASC` with:

```sql
ORDER BY
  (s.id = gi.id) DESC,                                -- sender's selected view first
  (s.view_type = 'top') ASC,                          -- top view LAST
  COALESCE(s.view_type, '~') ASC,                     -- stable secondary
  s.created_at ASC
```

`ASC` on a boolean puts `false` before `true`, so the `top` row sinks to the end. `~` keeps null `view_type` rows from jumping ahead of tagged ones.

### Step D — Verify

1. Open the existing share link on the preview → splash shows; tap → all 3 images animate from front → side → **top**.
2. Hit Replay → same order.
3. Generate a fresh cake, share it, open the link → top still lands last regardless of which view finished first in generation.
4. Confirm old shares (legacy rows where backfill best-effort placed top last) still look reasonable.

## Files / migrations touched

- Migration: add column + backfill + replace `get_public_cake` body.
- `src/components/CakeCreator.tsx` — include `view_type` in the insert.
- `src/components/CakeConvergeReveal.tsx` — `enabled` prop + gated effects + placeholder.
- `src/pages/SharedCake.tsx` — pass `enabled={opened}`.

No other components, edge functions, or schemas affected. After merge, **Publish → Update** to push to `cakeaiartist.com`.

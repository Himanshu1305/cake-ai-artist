## Problem

4 image URLs are still duplicated across 8 existing posts (confirmed via DB query):
- `photo-1551404973` → "Northern Lights" + "Strike Gold Metallic"
- `photo-1607478900766` → "Coronation & Jubilee" + "Bold Typography"
- `photo-1601979031925` → "Northern Lights Celestial" + "Rocky Mountain Wedding"
- `photo-1599785209707` → "Retro Vintage" + "Aussie Day"

Root cause: the bulk update we ran earlier assigned from a 45-image pool to 48 posts without a uniqueness constraint, so a few collided. Also, several pool images look visually similar (multiple chocolate drip cakes), which makes even non-duplicate URLs feel repetitive on the grid.

## Fix

### Step 1 — Eliminate exact URL duplicates (SQL only)
Run a single SQL update that, for each `featured_image` appearing more than once, keeps it on the oldest post and reassigns the other(s) to a brand-new Unsplash photo not currently used anywhere in `blog_posts`.

### Step 2 — Expand the curated image pool for visual diversity
Grow the pool from 45 → ~80 URLs, deliberately mixing cake styles (white tiered, fondant, naked cakes, fruit-topped, floral, themed, kids, minimalist) so adjacent grid cards don't all look like chocolate drip cakes. Add the new URLs to `IMAGE_POOL` in `supabase/functions/generate-blog-post/index.ts`.

### Step 3 — Harden the picker against future repeats
Update `pickFeaturedImage()` in the edge function to:
- exclude every `featured_image` currently in `blog_posts` (not just the last 12)
- fall back to the no-repeat-in-last-12 logic only when the pool is exhausted

This guarantees no new AI-generated post can collide with an existing one until the entire pool is used.

### Step 4 — Verify
Re-run the duplicate-detection query; expect zero rows. Refresh `/blog` and confirm the grid shows visually distinct cakes.

## Out of scope
- Replacing existing Unsplash images with our own AI-generated cake renders (Track B, queued).
- Changing alt-text logic (already correct from previous round).

## Files touched
- One SQL update (no migration — data-only via insert tool's update path is not allowed, so I'll use a migration with `UPDATE` statements).
- `supabase/functions/generate-blog-post/index.ts` — expand `IMAGE_POOL`, harden `pickFeaturedImage()`.

No frontend changes needed.
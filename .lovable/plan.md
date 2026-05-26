## Issues confirmed

**1. Duplicate dates**: 7 newly-seeded posts all share `published_at = 2026-05-26 06:29:40`. Older batches also share timestamps (3 on May 13, 3 on May 16, etc.). Looks like a spam-publish pattern to Google.

**2. Duplicate images**: The same 4–5 Unsplash URLs repeat across many posts (e.g. `photo-1558301211` on 3+ posts, `photo-1605810230434` on 2 Indian posts, `photo-1535254973040` on 2 posts). Same image + similar alt text = weak image SEO and a "templated content farm" signal.

---

## Yes, unique images help SEO + trust

- **SEO**: Google Images is a real traffic source. Unique images with descriptive alt text (e.g. "AI-generated Diwali birthday cake with diya and rangoli design") can rank for image search. Duplicate stock photos can't.
- **Trust**: Users skimming the blog index see the same thumbnail repeated → looks auto-generated and low-effort. Unique imagery (especially AI cakes we generated ourselves) signals real content.
- **Bonus**: Using our own AI-generated cakes as featured images doubles as product demo — every blog header becomes a portfolio piece.

---

## Plan

### Step 1 — Fix dates (immediate, SQL only)
Spread `published_at` across the last ~5 months with realistic, varied timestamps. Rules:
- Newest post → today, then walk backwards
- Gap between consecutive posts: random 3–10 days
- Randomize the hour (8am–8pm) so they don't all land at 00:00:00
- One single migration, no app code changes

### Step 2 — Fix duplicate images (two-track)

**Track A — Immediate (today, no cost):**
- Curate ~25 unique high-quality cake Unsplash URLs (one per post + buffer)
- Assign a unique image to every existing post via SQL
- Match image to topic (Diwali post → diya cake photo, wedding post → tiered white cake, kids → colorful unicorn, etc.)
- Update `featured_image` column

**Track B — Generate unique AI cake images (recommended next, separate task):**
- Use our own `generate-complete-cake` flow to create 1 branded hero image per post
- Upload to `cake-images` storage bucket
- Replace stock Unsplash URLs with our own CDN-hosted images
- This is a bigger job (~20 image generations) — flag it as Phase 2

### Step 3 — Add proper alt text (SEO win)
Currently `<img alt={p.title}>` is fine but generic. Add a dedicated `image_alt` column to `blog_posts` and populate with descriptive, keyword-rich alt text per post:
- e.g. "Three-tier AI-generated wedding cake with gold floral details"
- e.g. "Diwali-themed AI cake with diya and rangoli decorations"
- Update `CountryBlogFeed.tsx` and `BlogPost.tsx` to use `image_alt` with fallback to title

### Step 4 — Prevent recurrence in AI generator
Update `generate-blog-post` edge function to:
- Stop using the same 9-image `getDefaultImage()` lookup table
- Either: (a) pick from a much larger pool of 30+ curated images with no-repeat-in-last-10 logic, or (b) call our own image generator to create a unique hero per post
- Also: set `published_at` with a small random offset, not exact `now()`, when auto-publishing

---

## Technical details

**Files / DB touched:**
- Migration: add `image_alt TEXT` column to `blog_posts`
- Insert SQL: bulk UPDATE `published_at` and `featured_image` + `image_alt` for all existing rows
- `src/components/CountryBlogFeed.tsx` — use `image_alt` with fallback
- `src/pages/Blog.tsx` and `src/pages/BlogPost.tsx` — same
- `supabase/functions/generate-blog-post/index.ts` — expand image pool, add `image_alt` field to AI prompt JSON schema, randomize publish time

**Out of scope for this round:**
- AI-generated hero images (Track B) — propose as Phase 2 after this lands
- Bulk-replacing existing 16 posts with our own AI cakes (separate task)

---

## Confirm before I build

1. Date spread strategy: **last 5 months, 3–10 day gaps, randomized hours** — OK?
2. Images: **Track A only now (curated unique Unsplash + alt text)**, queue Track B (our own AI hero images) as a follow-up — OK?
3. Should the oldest post date back to roughly **January 2026** or further (e.g. **November 2025**) to show longer publishing history?
# Fix: Community Gallery shows "No featured cakes yet"

## Root cause

The Community Gallery and homepage carousel both query the view `public_featured_images`, which selects `featured = true` rows from `generated_images`.

That view is defined with `security_invoker=true`, meaning RLS on the underlying `generated_images` table is enforced as the **calling role** (anon / authenticated user). Looking at the policies on `generated_images`, there is **no policy** that lets anon users — or any non-owner — read rows, even featured ones. So the REST API returns `[]`.

Verified via network inspection: every request to `public_featured_images` returns an empty array (`Response Body: []`), even though direct SQL as the service role returns 9 featured rows.

The homepage **looks** like it works because `Index.tsx` falls back to 3 hardcoded static images (`featuredCake1/2/3`) when the query returns empty. The Community Gallery has no such fallback, so it shows the empty state.

## Fix

Add an RLS policy on `public.generated_images` that allows **anyone** (anon + authenticated) to SELECT rows where `featured = true`. The view already restricts the column set to safe public fields (`id, image_url, created_at, occasion_type`) — no PII is exposed.

### Migration

```sql
CREATE POLICY "Anyone can view featured images"
  ON public.generated_images
  FOR SELECT
  TO anon, authenticated
  USING (featured = true);
```

This is the minimal change. Existing owner/admin policies remain untouched, so non-featured images stay private to their owner.

## After the migration

- `/community` will populate with the 9+ featured cakes already in the DB.
- The homepage carousel will start showing real featured cakes instead of the 3 static fallbacks.
- "Most Popular This Week" (`PopularCakesSection`) will also start working — it uses the same view.

## Files

- New SQL migration only. No code changes needed in `Index.tsx`, `CommunityGallery.tsx`, or `PopularCakesSection.tsx`.

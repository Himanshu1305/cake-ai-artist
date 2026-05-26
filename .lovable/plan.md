## Plan

1. **Fix the missing hero image bug on blog detail pages**
   - Update `BlogPost.tsx` so database posts use their own `featured_image` for the visible hero image and social share image.
   - This directly fixes the listed AI-generated posts that currently have an image in the database but show no image on the article page.

2. **Remove duplicate legacy blog cards in the blog grid**
   - Deduplicate `/blog` results by slug so a database article and an older hardcoded article with the same URL do not both appear.
   - This should reduce confusion where the same blog URL appears more than once with different/fallback imagery.

3. **Give the duplicate-image articles unique images and alt text**
   - Update the affected existing records, especially `ai-cake-for-kids-birthday`, with a distinct kid-birthday cake image and matching descriptive alt text.
   - Update the static legacy image entries for `creative-cake-ideas-birthday`, `cake-design-trends-2025`, `anniversary-cake-ideas`, and `holi-cake-ideas` where needed so they are not visually repeated.

4. **Verify after implementation**
   - Re-check the affected slugs in the database for duplicate or missing `featured_image` values.
   - Inspect `/blog` and at least one listed blog detail page to confirm images render and duplicates are gone.

## Technical notes

- This is mostly a frontend data-selection bug: `BlogPost.tsx` builds a `post.featuredImage` from the database, but the rendered hero currently reads from a separate `heroImage` value that only checks hardcoded image maps.
- Data-only corrections will use the backend data update tool, not a schema migration.
## Goal
Make the existing cake recipes discoverable. Recipes already live at `/recipes` (hub) and `/recipes/:slug` (12 published recipes across IN/UK/CA/AU), but nothing links to them. Add a "Recipes" entry in the main nav with a dropdown of all recipes grouped by country, surface them on each country landing page, and make the pages SEO-compliant.

## Changes

### 1. Add "Recipes" to the main navigation (`src/pages/Index.tsx`)
- **Desktop nav (around line 332–335):** Add a `Recipes` dropdown between `Examples` and `Community`. Hover/click opens a panel listing all 12 recipes grouped by country flag + name, each linking to `/recipes/:slug`. Footer of the panel: "Browse all recipes →" linking to `/recipes`.
- **Mobile sheet menu (around line 374–382):** Add a collapsible "Recipes" section with the same grouped list, plus a "View all recipes" link.
- Fetch the list once via `supabase.from('cake_recipes').select('slug,title,country').eq('is_published', true).order('country')`, cache with React Query (already in app).

### 2. Add a "Famous local cakes" section to each country landing page
Files: `src/pages/UKLanding.tsx`, `IndiaLanding.tsx`, `CanadaLanding.tsx`, `AustraliaLanding.tsx`.
- New section near the bottom (before Footer) titled e.g. "Famous British cakes you can bake at home" / "Classic Indian cakes to bake" etc.
- Renders 3 cards (the country's recipes) with hero image, title, prep time, "Read recipe →" → `/recipes/:slug`.
- Anchor link `#recipes` and a "Browse all UK recipes" CTA → `/recipes?country=UK` (already supported by `Recipes.tsx`).

### 3. SEO compliance
- **Sitemap (`public/sitemap.xml`):** Add `/recipes`, `/recipes?country=IN|UK|CA|AU`, and one `<url>` entry per published recipe slug with `lastmod`, `changefreq=monthly`, `priority=0.7`.
- **`Recipes.tsx` hub:** already has `<Helmet>` title/description/canonical. Add JSON-LD `CollectionPage` + `BreadcrumbList` (Home → Recipes [→ Country]).
- **`RecipeDetail.tsx`:** already has Recipe JSON-LD. Add `BreadcrumbList` JSON-LD (Home → Recipes → {Country} → {Title}), `og:type=article`, visible breadcrumb above the H1.
- **Country landing pages:** add a `BreadcrumbList` snippet and an internal-link block to recipes (helps both UX and SEO via internal linking).

### 4. Sitemap maintenance
The current `public/sitemap.xml` is hand-edited. Append the recipe URLs once now; note in a code comment that new recipe slugs need to be added when published. (No script migration unless you'd like one.)

## Files touched
- `src/pages/Index.tsx` — add Recipes dropdown (desktop + mobile)
- `src/pages/UKLanding.tsx`, `IndiaLanding.tsx`, `CanadaLanding.tsx`, `AustraliaLanding.tsx` — add recipes section + breadcrumb schema
- `src/pages/Recipes.tsx` — add CollectionPage + Breadcrumb JSON-LD
- `src/pages/RecipeDetail.tsx` — add Breadcrumb JSON-LD + visible breadcrumb, `og:type=article`
- `public/sitemap.xml` — add 12 recipe URLs + 4 country-filtered hub URLs + `/recipes`

## Open question
Do you want me to **auto-generate** the sitemap from the database (via a `predev`/`prebuild` script) so future recipes appear automatically, or is hand-editing fine for now?

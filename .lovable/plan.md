Three focused changes. Each is independent and can ship on its own.

## 1. Cake "rotation GIF" — CSS 3D spin showcase

Earlier I recommended a **CSS-driven 3D spin** instead of generating a real GIF, because:
- Real cake GIFs would need multi-angle AI generation per cake (slow, expensive, often inconsistent).
- A CSS spin works on every existing image, costs nothing, and looks premium.

What I'll build:
- New `CakeSpinShowcase` component: takes the user's generated cake image and renders it on a rotating 3D "turntable" (perspective + `transform: rotateY` keyframe, ~8s loop), with a soft shadow that rotates underneath and a subtle floor reflection.
- Hover → pause + slight zoom; tap on mobile → pause.
- Drop-in on: the `CakeCreator` result view (right after generation), the `SharedCake` page, and as the hero tile on `Index` (replacing the static hero cake — keeps the animated flames on top).
- A "Download spinning preview" button that records ~3 seconds of the canvas to a WebM via `MediaRecorder` so users can share an actual moving file. (No server cost.)

## 2. Weekly country blog — fix delivery, preview, length, SEO, humanization

Current state I verified:
- `generate-blog-post` runs weekly and stamps `target_country` (IN/UK/AU/CA) or null for universal.
- Posts land in `blog_posts` with `is_published = false` (admin must approve before they appear).
- Country landing pages (`IndiaLanding`, `UKLanding`, etc.) **do not display blog posts at all** — that's why nothing shows up per country.
- `Blog.tsx` lists everything; there's no per-country filter or per-country feed.
- Preview not opening = posts are unpublished, and `BlogPost.tsx` only fetches `is_published = true`.

Fixes:
- **Per-country feed on each landing page**: add a "From our [Country] kitchen" section showing the latest 3 posts where `target_country = 'IN' | 'UK' | 'AU' | 'CA'` plus universal. Link to a filtered `/blog?country=IN` view.
- **Auto-publish toggle**: add `auto_publish_ai_posts` flag in `site_settings`. When on, the edge function inserts with `is_published = true` so previews work immediately. Admin can still unpublish.
- **Admin preview for drafts**: in `BlogPost.tsx`, if the viewer is admin, fetch unpublished too and show a "DRAFT" banner. Fixes the "preview not opening" issue.
- **Shorter articles** (~400–550 words, 3–4 min read): rewrite the system prompt in `generate-blog-post` to enforce: hook (40 words) → 3 H2 sections (~120 words each) → quick-tip list → 1-line CTA. Hard cap, and reject if word count > 600.
- **Humanization pass**: add a second AI call ("humanize" pass) that rewrites the draft with contractions, varied sentence length, one personal aside, removes AI-tells ("In conclusion", "Moreover", "delve", "tapestry", "leverage"). Score it with a quick checklist; reject and retry once if any banned phrase appears.
- **SEO compliance per article**: ensure each post has unique `<title>` (≤60 chars), `meta_description` (≤160), canonical URL `https://cakeaiartist.com/blog/{slug}`, OG tags, JSON-LD `Article` schema with author/date/image, single H1, alt text on featured image. Add `BreadcrumbList` schema. Already partially in `BlogPost.tsx` — I'll audit and complete.
- **Sitemap**: regenerate `public/sitemap.xml` to include all published posts (one entry per slug) so Google indexes them.

## 3. Country-specific cake recipes hub — yes, strongly agree

Why it's a good SEO bet:
- "[Country] birthday cake recipe", "traditional [country] cake" are evergreen high-intent queries with much steadier volume than trend posts.
- Pairs naturally with the AI cake designer ("design it, then bake it") — increases time on site and gives a clear secondary CTA.
- Builds topical authority; Google rewards depth on a niche.

What I'll build:
- New table `cake_recipes` (slug, title, country, hero_image, ingredients jsonb, steps jsonb, prep_time, cook_time, servings, difficulty, story, related_cake_design_prompt, is_published, created_at). RLS: public read for published, admin write.
- New routes:
  - `/recipes` — all recipes, filterable by country.
  - `/recipes/{country}` — e.g. `/recipes/india` (Tres Leches, Mysore Pak cake, eggless chocolate, etc.), `/recipes/uk` (Victoria sponge, Battenberg, Christmas cake), `/recipes/canada` (Nanaimo bars, butter tart cake), `/recipes/australia` (Lamington, Pavlova).
  - `/recipes/{slug}` — full recipe page with `Recipe` JSON-LD schema (rich result eligible — shows star ratings/cook time in Google).
- Seed 5 recipes per country (20 total) to launch. Use `generate-blog-post`-style edge function `generate-recipe` to expand the library weekly (1 new recipe per country per week, admin-approved).
- Cross-link: each recipe page has a "Design a cake for this recipe" CTA → opens `CakeCreator` with the `related_cake_design_prompt` prefilled. Each country landing page gets a "Famous [Country] cakes you can bake" strip.
- Sitemap entries + breadcrumb schema.

## Order of work

1. Cake spin showcase (frontend only, fast).
2. Blog fixes: admin-draft preview + auto-publish flag + per-country feed on landing pages + shorter/humanized prompt + sitemap.
3. Recipes hub: migration → seed data → list/detail pages → schema + sitemap → weekly generator.

Ship 1 and 2 together, then 3 as a follow-up so I don't dump too much in one batch.

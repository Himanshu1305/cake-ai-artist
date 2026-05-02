## Keyword Coverage Audit

I checked your top GSC keywords against current site copy. Here's the gap analysis:

| GSC Keyword | In Title | In Meta Desc | In H1/H2 | In Keywords Meta | Status |
|---|---|---|---|---|---|
| cake ai | partial (brand only) | ❌ | ❌ | ❌ | **Weak** |
| ai cake generator | ❌ | ✅ ("AI birthday cake generator") | ❌ | ❌ | **Partial** |
| ai cake | ❌ | ❌ | ✅ | ❌ | **Weak** |
| ai birthday cakes | ❌ | partial | ❌ | ❌ | **Weak** |
| ai cake designer | ✅ | ❌ | ✅ | ✅ | **Good** |
| ai cake design | ❌ | ❌ | ❌ (only "AI cake design tool") | partial | **Weak** |
| birthday cake ai | ❌ | ❌ | ❌ | ❌ | **Missing** |
| ai cakes | ❌ | ❌ | ❌ | ❌ | **Missing** |
| ai cake generator free | ❌ | partial | ❌ | partial (Free page) | **Weak** |
| cake generator | ❌ | partial | ❌ | partial | **Weak** |

**Key finding**: You rank for "ai cake designer" because it's everywhere. The other 9 keywords (which are likely your highest-impression terms) are barely present. Adding them naturally — without keyword stuffing — should lift impressions and CTR significantly.

## What I'll Change

### 1. Homepage (`src/pages/Index.tsx` + `index.html`)
- **Title** (60 char limit): `AI Cake Generator — Free AI Cake Designer & Birthday Cakes` (58 chars) — covers *ai cake generator*, *ai cake designer*, *birthday cakes*
- **Meta description** (160 limit): `Free AI cake generator. Design personalized AI birthday cakes, anniversary & wedding cakes in 30 seconds. The best AI cake designer online.` (~140 chars) — covers *ai cake generator*, *ai birthday cakes*, *ai cake designer*
- **Keywords meta**: add `cake ai, ai cake, ai cakes, ai cake generator, ai cake generator free, cake generator, birthday cake ai, ai birthday cakes, ai cake design`
- **H1**: `The Best AI Cake Generator & Designer for Personalized Birthday Cakes` (covers *ai cake generator* + *ai cake designer* + *birthday cakes* in one tag)
- **Hero subheading paragraph**: weave in "AI cakes" and "birthday cake AI" naturally
- **H2 ("Why People Call Us...")**: change to `Why People Call Us the Best AI Cake Generator & Cake AI Tool`
- **JSON-LD WebApplication name/description**: add *ai cake generator* and *ai cakes*

### 2. Free Cake Designer page (`src/pages/FreeCakeDesigner.tsx`)
This page should target the **"free"** modifiers since they convert best.
- **Title**: `Free AI Cake Generator — AI Cake Designer Online` (50 chars)
- **Meta desc**: `Free AI cake generator. Design AI birthday cakes & personalized cake designs in 30 seconds. The #1 free cake generator and AI cake designer online.` (~150)
- **Keywords**: add `ai cake generator free, cake generator, ai cakes, cake ai, birthday cake ai`
- **H1**: `Free AI Cake Generator & Designer`
- **H2 sections**: include "Why our AI cake generator is free" and "How the AI cake designer works"

### 3. Localized landing pages (India, UK, Canada, Australia)
Add the short-tail keywords to titles where there's character budget:
- India: `AI Cake Generator India — Birthday Cake AI Designer` (~52)
- UK: `AI Cake Generator UK — AI Birthday Cakes Designer` (~50)
- Canada: similar pattern
- Australia: similar pattern
- Update meta descriptions to include "AI cake generator" and "AI cakes"

### 4. Other key pages (light touch)
- **HowItWorks.tsx**: add "AI cake generator" to H1/intro
- **Pricing.tsx**: add "AI cake generator" to title or description
- **CommunityGallery.tsx**: H1 → `AI Cake Gallery — Real AI Cakes from Our Community`
- **UseCases.tsx**: add "AI cakes" / "AI cake designer" variations
- **Blog.tsx**: add "AI cake" to title

### 5. JSON-LD enhancements
- Add `alternateName` array to `WebApplication` schema with: `["AI Cake Generator", "AI Cake Designer", "Cake AI", "Birthday Cake AI"]`
- Add a new FAQ entry on homepage: *"Is this AI cake generator really free?"* — captures the *free* long-tail.

### 6. Internal linking boost
- In hero CTA area, link "AI cake generator" anchor text to `/free-ai-cake-designer` (keyword-rich internal link).
- Footer: add link with anchor `Free AI Cake Generator`.

## What I Will NOT Do
- No keyword stuffing — every addition reads naturally
- No duplicate H1s on a page
- No changes to URLs/routes (preserves existing rankings)
- No edits to gallery/admin/auth pages (irrelevant to these keywords)

## Files to Edit
1. `index.html`
2. `src/pages/Index.tsx`
3. `src/pages/FreeCakeDesigner.tsx`
4. `src/pages/IndiaLanding.tsx`
5. `src/pages/UKLanding.tsx`
6. `src/pages/CanadaLanding.tsx`
7. `src/pages/AustraliaLanding.tsx`
8. `src/pages/HowItWorks.tsx`
9. `src/pages/Pricing.tsx`
10. `src/pages/CommunityGallery.tsx`
11. `src/pages/UseCases.tsx`
12. `src/pages/Blog.tsx`
13. `public/sitemap.xml` (bump `<lastmod>`)

## Expected Impact
- **Impressions**: +30–60% within 4–8 weeks for the missing keywords (Google currently shows the site for these but at low positions)
- **CTR**: +10–20% from titles that now exactly match search intent
- **No risk** to existing "ai cake designer" rankings — keyword is preserved

Approve to proceed.

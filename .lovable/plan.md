## SEO Audit Findings & Action Plan

### Audit Summary

Audited all 27 pages. Most have basic Helmet tags, but there are gaps that hurt rankings for the target keywords ("AI cake designer", "personalized cake", "best cake designs", "custom cake AI", "AI birthday cake", etc.).

**Strengths already in place:** Helmet on every public page, hreflang tags, sitemap.xml, JSON-LD on landing pages, single H1 per page.

**Issues found:**

| Page | Issue |
|---|---|
| Auth, NotFound, Gallery | Missing meta description + OG/Twitter tags |
| Privacy, Terms, Advertising | Missing OG/Twitter image + description |
| Contact, CommunityGallery | Missing OG image / twitter:card |
| About, FAQ, Blog, BlogPost | No `<meta name="keywords">` for target terms |
| 14 image instances | Generic alt: "Cake design", "Selected cake", "Community creation", "Featured user cake design" — wastes ranking opportunity |
| Sitemap | Missing `/free-ai-cake-designer`, `/auth`, `/advertising` (intentionally excluded), and `lastmod` is stale (2025-12-26) |
| robots.txt | Disallows `/gallery` — that's user-private, correct. But `/community` is allowed (good) |
| Pricing H1 | "Pricing" — generic, no keywords |
| About H1 | No primary keyword |
| Contact / Privacy / Terms / Advertising | H1 lacks "AI cake" qualifier |
| HomepageFAQ component | FAQPage JSON-LD not emitted from FAQ.tsx page (only embedded snippets) — verify and add |
| Schema | No global Organization/WebSite schema on root layout — only on individual pages |
| index.html | Solid, but `geo.region=US` could be `Worldwide`/removed since hreflang handles regions |

---

### Target Keyword Map

Each page gets a **primary keyword** + 2–3 supporting long-tails. Distributed to avoid cannibalization:

```text
/                      → best AI cake designer, personalized birthday cake, AI cake generator
/pricing               → AI cake designer pricing, lifetime AI cake design
/how-it-works          → how to design AI cake, create personalized cake online
/use-cases             → AI cake ideas, custom cake designs for every occasion
/free-ai-cake-designer → free AI cake designer, free personalized cake maker
/community             → AI cake gallery, personalized cake design ideas, custom cake inspiration
/blog                  → cake design ideas, AI cake tips, personalized cake guide
/faq                   → AI cake designer FAQ, custom cake design questions
/about                 → about Cake AI Artist, AI cake design platform
/contact               → contact AI cake designer, cake design support
/uk                    → best AI cake designer UK, personalized birthday cake UK
/india                 → AI cake designer India, personalized cake online India
/canada                → AI cake designer Canada, custom cake design Canada
/australia             → AI cake designer Australia, personalized cake AU
```

---

### Changes (file by file)

**1. `index.html`**
- Already strong. Minor: remove `geo.region=US` (misleading for global brand) or change to `WW`.
- Add `<link rel="manifest">` reference if PWA exists (optional).

**2. `src/pages/Index.tsx`** — already optimized last turn. Verify keywords meta includes "AI cake generator", "custom cake designer online".

**3. `src/pages/Pricing.tsx`**
- Title → `AI Cake Designer Pricing — Lifetime Access from $49 | Cake AI Artist`
- Description → emphasize "best AI cake designer" + value
- H1 → `AI Cake Designer Pricing — Lifetime Plans for Personalized Cakes`
- Add `<meta name="keywords">` and full OG/Twitter image set (already present, just refine copy).

**4. `src/pages/HowItWorks.tsx`** — strong already. Tighten H1 to include "AI Cake Designer".

**5. `src/pages/UseCases.tsx`**
- Title → `AI Cake Design Ideas for Every Occasion — Birthdays, Weddings & More`
- Add HowTo or ItemList JSON-LD with each use case.

**6. `src/pages/FAQ.tsx`**
- Title → `AI Cake Designer FAQ — Answers About Personalized Cake Design`
- Add `FAQPageSchema` component (already exists in SEOSchema.tsx, just wire it up with the actual FAQ array).
- Add `<meta name="keywords">`.

**7. `src/pages/Blog.tsx`**
- Title → `Cake Design Blog — AI Cake Ideas, Tips & Trends | Cake AI Artist`
- Add `<meta name="keywords">` and `Blog`/`ItemList` JSON-LD.

**8. `src/pages/BlogPost.tsx`**
- Already uses ArticleSchema. Add per-post `<meta name="keywords">` from post.tags. Ensure `og:image` uses post hero image (already does).

**9. `src/pages/About.tsx`**
- Title → `About Cake AI Artist — The Best AI Cake Designer Story`
- H1 → include "AI Cake Designer".
- Add `<meta name="keywords">`.

**10. `src/pages/Contact.tsx`**
- Title → `Contact Cake AI Artist — AI Cake Designer Support`
- Add full OG/Twitter image tags + ContactPage JSON-LD.

**11. `src/pages/CommunityGallery.tsx`**
- Title → `AI Cake Gallery — Personalized Cake Design Ideas & Inspiration`
- Description → "Browse 1000s of AI-designed personalized cakes…"
- Add OG image + twitter:card.
- Add `ImageGallery` / `CollectionPage` JSON-LD.
- **Fix alt text** on community images: use `alt={image.occasion_type ? \`Personalized ${image.occasion_type} cake designed by AI\` : "AI-designed personalized celebration cake"}` instead of bare `image.occasion_type`.

**12. `src/pages/Auth.tsx`**
- Add meta description + `noindex` (auth pages should NOT rank — already disallowed in robots.txt). Add `<meta name="robots" content="noindex,nofollow">`.

**13. `src/pages/Gallery.tsx`** (private user gallery)
- Add `<meta name="robots" content="noindex,nofollow">` (already disallowed in robots, reinforce).
- Improve fallback alt text from "Selected cake" → use prompt text.

**14. `src/pages/NotFound.tsx`**
- Add `<meta name="robots" content="noindex">` and helpful internal links to top SEO pages.

**15. `src/pages/Privacy.tsx`, `Terms.tsx`, `Advertising.tsx`**
- Add OG/Twitter image + description tags for completeness.

**16. `src/pages/FreeCakeDesigner.tsx`** — already strong. Add to sitemap.

**17. Country landing pages (`UKLanding`, `IndiaLanding`, `CanadaLanding`, `AustraliaLanding`)**
- Already optimized. **Fix alt text** on cake carousels: `"Featured user cake design"` → `"AI-designed personalized cake by Cake AI Artist user"` and `"Community creation"` → descriptive variant by occasion.

**18. Image alt text fixes — 14 instances**
- `src/pages/Index.tsx` lines 680, 777
- `src/pages/UKLanding.tsx` 522, 562
- `src/pages/CanadaLanding.tsx` 385, 415
- `src/pages/IndiaLanding.tsx` 523, 563
- `src/pages/AustraliaLanding.tsx` 385, 415
- `src/pages/Gallery.tsx` 716
- `src/pages/Admin.tsx` 1345 (internal, low priority)
- Pattern: derive alt from occasion + name, fallback to keyword-rich generic.

**19. `public/sitemap.xml`**
- Update all `lastmod` to today's date (2026-04-30).
- Add `/free-ai-cake-designer` (priority 0.8).
- Add image sitemap entries for top 5 landing pages (helps image search).

**20. `public/robots.txt`** — already correct. No changes.

**21. Global Schema (in `src/App.tsx` or wrap in main layout)**
- Add `OrganizationSchema` and `WebSite` schema with SearchAction once at the app root so every page inherits it.

**22. New helper component: `src/components/PageMeta.tsx`** (optional cleanup)
- Centralize Helmet boilerplate so all pages use a consistent OG/Twitter pattern with one prop interface.
- Reduces drift; not strictly required but recommended for maintainability.

---

### Technical Details

- All copy stays humanized per project memory (no "AI-sounding" phrasing, no specific urgency numbers/dates).
- Keep title length ≤ 60 chars where possible, descriptions 150–160 chars.
- Maintain text default color blue (#2563EB) per memory.
- No dependencies added; uses existing `react-helmet-async` and `SEOSchema.tsx`.
- Will add a `<meta name="robots" content="noindex,nofollow">` on `/auth`, `/gallery`, `/settings`, `/complete-profile`, `/admin*` pages.
- Will verify FAQ JSON-LD validates against schema.org before marking done.

---

### Out of Scope

- Backend changes / new routes
- Rewriting blog post bodies (only meta layer + keyword tags)
- Performance/Core Web Vitals work (separate concern)
- Building backlinks (off-page SEO)

After approval I will execute all changes in one pass and report a per-page diff summary.
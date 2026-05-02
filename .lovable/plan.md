# SEO Tightening: Titles, Descriptions, JSON-LD & Sitemap Submission

## Audit results

I audited all 14 main pages. Helmet is wired up everywhere, but:

**Titles too long (>60 chars):** Index (82), Pricing (81), HowItWorks (72), UseCases (68), FAQ (66), Blog (70), CommunityGallery (62), FreeCakeDesigner (77), India (91), UK (85), Canada (89), Australia (92).

**Descriptions too long (>160 chars):** Index (185), HowItWorks (172), FreeCakeDesigner (173), India (191), UK (172), Canada (173), Australia (175).

**Schema gaps:** UseCases, India/UK/Canada/Australia landings have NO `BreadcrumbSchema`, `FAQSchema`, or `ProductSchema`. Pricing has `ProductSchema` but no `FAQSchema`. Country pages should also have `ProductSchema` with localized currency.

**Index.html** also has the long 82-char default title.

## What I'll change

### 1. Rewrite titles to ≤60 chars and descriptions to ≤160 chars
Keep target keywords (*AI cake designer*, *personalized birthday cake*, *AI birthday cake generator*, country names where applicable). Examples:

| Page | New title (chars) |
|---|---|
| Index | `AI Cake Designer — Personalized Birthday Cakes` (47) |
| Pricing | `AI Cake Designer Pricing — Lifetime Plans` (42) |
| HowItWorks | `How to Design an AI Cake in 30 Seconds` (40) |
| FAQ | `AI Cake Designer FAQ — Your Questions Answered` (47) |
| Blog | `AI Cake Design Blog — Tips & Inspiration` (41) |
| CommunityGallery | `AI Cake Gallery — Personalized Cake Ideas` (42) |
| FreeCakeDesigner | `Free AI Cake Designer — Make a Cake in 30s` (43) |
| UseCases | `AI Cake Ideas for Birthdays, Weddings & More` (45) |
| India | `Best AI Cake Designer in India — Free Online` (45) |
| UK | `Best AI Cake Designer UK — Personalised Cakes` (46) |
| Canada | `AI Cake Designer Canada — Personalized Cakes` (44) |
| Australia | `AI Cake Designer Australia — Personalised Cakes` (47) |

All descriptions rewritten to 140–158 chars retaining target keywords.

### 2. Add missing JSON-LD schemas

- **UseCases**: `BreadcrumbSchema` + `FAQSchema` (occasion-specific FAQs already on the page).
- **Pricing**: add `FAQSchema` for pricing FAQs.
- **India/UK/Canada/Australia landings**: add `BreadcrumbSchema` + `ProductSchema` with local currency (INR, GBP, CAD, AUD) + `FAQSchema`.
- **Index**: confirm existing `ProductReviewSchema` + `FAQSchema` + `BreadcrumbSchema` stay (already good).

### 3. Tighten `index.html` defaults
Shorten the default `<title>`, `<meta description>`, OG/Twitter title+description to fit limits — these are what Google indexes for any page that doesn't override them.

### 4. Sitemap.xml — already good
The sitemap is comprehensive (all main + country + free-tool pages, with hreflang & images) and `robots.txt` references it. Bump `<lastmod>` to today's date.

### 5. Search engine submission (manual — you must do)
I cannot submit the sitemap for you, but I'll add a clear post-deploy checklist:

- **Google Search Console** → https://search.google.com/search-console → add `cakeaiartist.com` → verify (DNS or HTML tag — I can add a meta verification tag if you give me the code) → Sitemaps → submit `https://cakeaiartist.com/sitemap.xml`.
- **Bing Webmaster Tools** → https://www.bing.com/webmasters → add site → import from Google Search Console (1-click) OR submit sitemap manually.
- **IndexNow** (optional, instant indexing on Bing): I can add a small token file to `/public` if you want.

## Files I'll change

- `index.html` (default meta)
- `src/pages/Index.tsx`
- `src/pages/Pricing.tsx`
- `src/pages/HowItWorks.tsx`
- `src/pages/UseCases.tsx`
- `src/pages/FAQ.tsx`
- `src/pages/Blog.tsx`
- `src/pages/CommunityGallery.tsx`
- `src/pages/FreeCakeDesigner.tsx`
- `src/pages/IndiaLanding.tsx`
- `src/pages/UKLanding.tsx`
- `src/pages/CanadaLanding.tsx`
- `src/pages/AustraliaLanding.tsx`
- `public/sitemap.xml` (date refresh)

About, Contact already pass — won't touch.

## What I need from you (one-time, after deploy)
1. Approve this plan so I can apply the changes.
2. After deploy, paste your Google Search Console verification meta tag (if you want me to add it), then submit the sitemap from GSC dashboard.

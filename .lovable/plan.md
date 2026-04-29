# Option A: Birthday-led + "& Celebration" widening

Apply the chosen direction across homepage and 4 country landing pages. Birthday stays the lead keyword (highest search volume + your core hook), but every page now explicitly invites non-birthday visitors so we capture anniversary / wedding / baby shower / Diwali searches without diluting the main ranking signal.

---

## 1. Homepage (`src/pages/Index.tsx` + `index.html`)

**`<title>`** (both files)
> Best AI Cake Designer — Personalized Birthday & Celebration Cakes | Cake AI Artist

**`<meta description>`** (both files)
> Cake AI Artist is the best AI cake designer for personalized birthday cakes & every occasion — anniversaries, weddings, baby showers, Diwali & more. Designed in 30 seconds, free to try.

**`<meta keywords>`** — add: `anniversary cake design, wedding cake AI, baby shower cake, diwali cake` alongside existing birthday terms.

**Open Graph + Twitter** — mirror the new title/description.

**Visible H1** (line 419)
> The Best **AI Cake Designer** for Personalized Birthday Cakes & Every Celebration

**Sub-headline** (line 427)
> Birthdays, anniversaries, weddings, baby showers, Diwali, retirements — design any personalized cake in 30 seconds. Just type a name, pick the occasion, and get a stunning cake you can share, save, or take to your local baker.

---

## 2. Country pages (Helmet meta only — keep their conversion-focused price H1s)

Each page's `<title>`, `<meta description>`, OG, and Twitter tags get the same widening pattern with the country-specific local occasion already in place.

| Page | New title |
|---|---|
| `/india` | Best AI Cake Designer in India — Personalized Birthday & Celebration Cakes \| Cake AI Artist |
| `/uk` | Best AI Cake Designer UK — Personalised Birthday & Celebration Cakes \| Cake AI Artist |
| `/canada` | Best AI Cake Designer Canada — Personalized Birthday & Celebration Cakes \| Cake AI Artist |
| `/australia` | Best AI Cake Designer Australia — Personalised Birthday & Celebration Cakes \| Cake AI Artist |

Descriptions add "& every celebration" and list 2–3 country-relevant occasions (Diwali for India, royal/garden parties for UK, Canada Day for Canada, Australia Day for Australia).

Keywords arrays append: `anniversary cake, wedding cake design, baby shower cake` (+ local occasion keyword already present).

---

## 3. Add one FAQ entry to capture non-birthday searches

In `src/components/HomepageFAQ.tsx` add:

**Q:** Can I design cakes for occasions other than birthdays?
**A:** Yes — Cake AI Artist designs personalized cakes for any occasion: anniversaries, weddings, baby showers, retirements, Diwali, Holi, Christmas, graduation parties and more. Pick your occasion in the creator and the AI tailors the cake design, message and decorations to match.

This also flows into the existing `FAQSchema` so it shows in Google's rich-result FAQ snippets.

---

## Files edited

- `src/pages/Index.tsx` — Helmet block + H1 + sub-headline
- `index.html` — title, description, keywords, OG, Twitter
- `src/pages/IndiaLanding.tsx` — Helmet block
- `src/pages/UKLanding.tsx` — Helmet block
- `src/pages/CanadaLanding.tsx` — Helmet block
- `src/pages/AustraliaLanding.tsx` — Helmet block
- `src/components/HomepageFAQ.tsx` — append one FAQ entry

No design, layout, animation, or backend changes. Pure copy + meta updates.

# Fix post-login redirect + add menu bar across the site

## 1. Country-aware post-login redirect

Replace every `navigate("/free-ai-cake-designer"...)` in the auth flow with a redirect to the user's regional home page.

- Add a small helper `getCountryHomePath()` that reads the same signals already used by `Footer` and `GeoRedirectWrapper`:
  - `user_country_preference` from localStorage (explicit choice)
  - `detectedCountry` from `GeoContext`
  - Falls back to `/`
  - Mapping: `US → /`, `GB/UK → /uk`, `CA → /canada`, `AU → /australia`, `IN → /india`
- Update redirects in:
  - `src/pages/Auth.tsx` — 4 places (sign-in success, OAuth callback, existing-session check, signup success). Preserve the `?welcome=true` query on first signup.
  - `src/pages/CompleteProfile.tsx` — 2 places (existing-profile skip, profile completion). Preserve `?welcome=true` on the post-completion redirect.
- Leave the `/dashboard → /free-ai-cake-designer` route alone (separate intent: a direct dashboard shortcut).

## 2. Shared `SiteHeader` component on all public pages

Currently only `Index.tsx` has the full nav menu (How It Works, Party Planner, Pricing, Examples, Community, Blog, FAQ). Every other page shows only the logo + brand name, which is what the user is complaining about.

- Create `src/components/SiteHeader.tsx`:
  - Lifts the desktop + mobile nav markup straight out of `Index.tsx` (lines ~297–390) into a reusable component.
  - Props: `variant?: "transparent" | "solid"` (so it can sit on gradient hero sections or plain backgrounds) and optional `hideOn?: string[]` for items to omit on a given page.
  - Uses the same country-aware `pricingHref` logic already in `Footer` so the Pricing link points to `/pricing?country=XX` for the active region.
  - Includes a "Sign in" / account button on the right (mirrors current Index behaviour if present; otherwise a simple link to `/auth`).
- Refactor `Index.tsx` to render `<SiteHeader />` instead of its inline nav (no visual change).
- Add `<SiteHeader />` to every public page that currently has only the logo block, replacing the local logo header:
  - `FreeCakeDesigner`, `AiCakeGeneratorFree`, `ThreeDCakeDesigner`, `AiBirthdayCakeWithName`
  - `Gallery`, `CommunityGallery`
  - `Pricing`, `About`, `FAQ`, `Contact`, `HowItWorks`, `UseCases`
  - `Blog`, `BlogPost`, `Recipes`, `RecipeDetail`
  - `PartyPlanner`, `PartyPlannerDetail`
  - `Privacy`, `Terms`, `Advertising`
  - Country landings: `UKLanding`, `CanadaLanding`, `AustraliaLanding`, `IndiaLanding`, `USALanding`
- Do NOT add it to: `Auth`, `CompleteProfile`, `Admin`, `AdminLogoGenerator`, `AdminBlogAnalytics`, `Settings`, `PartyRSVP`, `SharedCake`, `BlogUnsubscribe`, `EmbedGalleryPage`, `NotFound` (auth/admin/embed/utility flows).

## Technical notes

- No backend, schema, or business-logic changes.
- No styling redesign — the new `SiteHeader` is the existing Index nav extracted verbatim so the look stays consistent.
- Country detection reuses existing `GeoContext` + `countryRouting` utils; no new geo logic.
- Mobile nav (sheet/drawer) is included in `SiteHeader` from day one so every page gets a working mobile menu, not just desktop.


## Problem

Pages use 5 different background treatments today, so the pink homepage feel doesn't carry across. Audit result:

- `bg-gradient-celebration` (pink/purple/gold — the homepage look): Index, FreeCakeDesigner, Auth, Privacy, NotFound
- `bg-gradient-surface` (pale pink): AiCakeGeneratorFree, AiBirthdayCakeWithName, AnniversaryCakeDesigner, EgglessCakeDesign, EidCakeDesigner, GraduationCakeDesigner, NamedCakePage, Occasions, PersonalizedCakeOnline, PhotoCakeMaker, Pricing, RakhiCakeIdeas, ThemedCakePage, ThreeDCakeDesigner, WeddingCakeDesigner
- `bg-gradient-subtle` (undefined token → falls back to nothing): Contact, Terms, UseCases, BlogPost
- Flat `bg-background`: About, Advertising, Blog, CommunityGallery, FAQ, HowItWorks, PartyPlanner, Recipes, and every country landing (USA/UK/India/Canada/Australia)
- Ad‑hoc: BlogUnsubscribe (`from-background to-muted`), SharedCake (`from-muted to-background`)

`ai-cake-generator-free` looks different because it uses `bg-gradient-surface` while Index uses `bg-gradient-celebration`.

## Goal

One consistent pink celebration background site-wide — same as the homepage — with the same-tone lighter variant for utility screens so text stays readable.

## Approach

1. Collapse the background tokens in `src/index.css` so every gradient resolves to the same pink family:
   - Keep `--gradient-celebration` as the canonical page background (homepage look).
   - Redefine `--gradient-surface` and `--gradient-subtle` to visually match `--gradient-celebration` (same hues, slightly softer) so any page already using them auto-inherits the homepage look with no per-file edits.
   - Leave `--gradient-party` (the vivid CTA/button gradient) untouched.

2. Update the content pages that currently use flat `bg-background` to `bg-gradient-celebration` so they match the homepage:
   - Country landings: `USALanding`, `UKLanding`, `IndiaLanding`, `CanadaLanding`, `AustraliaLanding`
   - Content hubs: `About`, `Advertising`, `Blog`, `CommunityGallery`, `FAQ`, `HowItWorks`, `PartyPlanner`, `Recipes`, `Gallery`

3. Normalize the two ad‑hoc gradients (`BlogUnsubscribe`, `SharedCake`) to `bg-gradient-celebration`.

4. Leave alone (intentionally neutral):
   - Admin surfaces: `Admin`, `AdminBlogAnalytics`, `AdminLogoGenerator`
   - Account/utility flows: `Settings`, `CompleteProfile`, `PartyRSVP`, `PublicParty`, `PartyPlannerDetail`, `RecipeDetail`
   These are dashboards/forms where a strong pink hurts legibility.

5. Verify build + type-check, then spot-check `/ai-cake-generator-free`, `/pricing`, `/blog`, `/usa`, `/uk` to confirm they now match `/`.

## Technical notes

- Token redefinition happens once in `:root` inside `src/index.css` — no Tailwind config change needed since `bg-gradient-surface` / `bg-gradient-celebration` / `bg-gradient-subtle` are already mapped in `tailwind.config.ts`.
- `bg-gradient-subtle` currently has no CSS variable, so pages using it render as transparent (falls through to body). Defining it fixes them automatically.
- Only presentation classes change; no business logic touched.

## Out of scope

- Section-level gradients inside pages (hero cards, CTA bands) stay as-is.
- Dark mode tokens untouched.

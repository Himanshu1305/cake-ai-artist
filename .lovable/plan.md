## Problem

`/anniversary-cake-designer` uses `bg-gradient-surface` on its root wrapper (line 99). Even though `--gradient-surface` and `--gradient-celebration` currently resolve to the same CSS string, several other pages still reference `bg-gradient-surface` too — and any future tweak to one token silently desyncs them from the homepage. The user is reading a real visual difference on this page, so we should normalize it to the canonical homepage class.

A quick audit shows the same drift on other content pages still using `bg-gradient-surface`:

- AiCakeGeneratorFree
- AiBirthdayCakeWithName
- AnniversaryCakeDesigner
- EgglessCakeDesign
- EidCakeDesigner
- GraduationCakeDesigner
- NamedCakePage
- Occasions
- PersonalizedCakeOnline
- PhotoCakeMaker
- Pricing
- RakhiCakeIdeas
- ThemedCakePage
- ThreeDCakeDesigner
- WeddingCakeDesigner

## Goal

One canonical pink background class site-wide so no page can drift again.

## Approach

1. Replace `bg-gradient-surface` with `bg-gradient-celebration` on the root wrapper of each page listed above (single-line class swap per file, presentation only).
2. Leave `--gradient-surface` defined in `index.css` (kept in sync with celebration) so any stray usage elsewhere still renders correctly.
3. No token, tailwind config, or component logic changes.

## Verification

- Build + typecheck.
- Spot-check `/anniversary-cake-designer`, `/pricing`, `/ai-cake-generator-free` against `/` — backgrounds should be visually identical.

## Out of scope

- Section-level gradients inside heroes/CTA bands.
- Dark mode.
- Any content or layout changes on these pages.

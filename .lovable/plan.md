## Goal
Fix two visual issues in the Day 2 engagement email so it matches the homepage brand (warm cream + gold, not purple) and the header banner feels balanced instead of empty.

## Issues
1. **Header banner** — currently a tall purple/pink/orange gradient block with just a small logo + "Cake AI Artist" + tagline. Lots of dead space, looks incomplete.
2. **Background / overall vibe** — body uses `#f8f5f2` cream (fine) but the header gradient (`#8B5CF6 → #D946EF → #F97316`) and the bottom CTA button (purple→pink gradient) make the email read as "purple". Homepage is warm cream + gold/amber + dark text, with pink only as a small accent.

## Fixes (Day 2 only — `day2Email()` + `emailLayout()` shared header/footer used only here for now, OR introduce a Day 2-specific layout to avoid affecting Day 7/14)

### Header banner redesign
- Replace the tall purple gradient with a **warm cream → soft gold gradient** (e.g. `#fdf8f0 → #fcecc9`) with a thin gold bottom border (`#E5B547`).
- Make it more compact (less vertical padding) and visually complete by adding:
  - Logo on the left (slightly larger, 56px)
  - Brand name "Cake AI Artist" in dark serif-style heading next to logo (left-aligned, not centered)
  - Right side: a small gold pill/badge "🎂 AI Cake Studio" or "⭐ 4.9 · Loved in 30+ countries" so the right half isn't empty
  - Remove the "AI-Powered Cake Design" subline (redundant once right badge is added)
- Header text color switches from white to dark (`#1a1a2e`) since background is now light.

### Color palette alignment with homepage
- Body bg: keep `#f8f5f2` (already correct).
- Card bg: keep white.
- Accent: switch from purple/pink to **gold/amber** (`#E5B547` / `#F59E0B`) for borders, the feature card left-border, and the bottom CTA button gradient (`#F59E0B → #E5B547` instead of purple→pink).
- Links: keep `#2563EB` blue (per project Core memory).
- Reviews strip bg: change from `#fff7ed` to a very light gold `#fdf6e3`.
- Feature card left border: change from `#F97316` orange to gold `#E5B547` to match homepage tone.
- Footer link color: change unsubscribe link from purple `#8B5CF6` to blue `#2563EB`.

### Scope
- Edit only the Day 2 visual rendering in `supabase/functions/send-engagement-drip/index.ts`.
- Since `emailLayout()` is shared with Day 7 and Day 14, introduce a **separate `day2Layout()`** wrapper (or pass a `theme` arg) so Day 7/14 stay untouched per earlier scope agreement.
- Redeploy `send-engagement-drip` after edit.

## Out of Scope
- Day 7 and Day 14 templates and their headers.
- Logo asset changes, copy changes, link changes (copy stays as-is).
- No DB / cron / admin widget changes.

## Test
Admin → Scheduled Tasks → "Test Day 2" → confirm header is balanced (logo left, badge right, light gold gradient) and overall email reads as cream/gold rather than purple.

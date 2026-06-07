
## The gap (yes, I agree)

Today `CharacterPicker` has ~55 options across 12 categories — **every single one is a kids/pop-culture character** (Disney, Marvel, anime, Peppa Pig, Chhota Bheem…). Meanwhile the occasion dropdown now offers 22 occasions, most of which are adult/non-character contexts:

- Wedding, Anniversary, Baby Shower, Valentine's, Mother's/Father's Day, Farewell, Congratulations
- Eid, Diwali, Holi, Christmas, Easter, Thanksgiving, Halloween, Dussehra, Raksha Bandhan, New Year

A bride looking for a wedding cake currently sees "Pikachu" and "Hulk" as her only "character" options. That's a clear mismatch and a missed personalization lever.

## What competitors actually do

Quick scan of the cake-design space (Bakingo, FlowerAura, FNP, Cake2Home, Etsy AI-cake tools, Midjourney cake prompts, Pinterest cake taxonomies) — the dominant adult/occasion "themes" are **motifs and aesthetics**, not licensed characters:

- **Wedding:** floral cascades, monogram, two-tier, lace, gold leaf, bride & groom toppers, ring & doves
- **Anniversary:** roses, hearts, "Mr & Mrs", years milestone, champagne flutes, photo memory
- **Baby shower:** teddy bear, baby booties, stork, pram, "It's a boy/girl", baby clouds, rattles, gender-neutral pastels
- **Valentine's:** red roses, cupid, heart, love letters, lock-and-key
- **Mother's / Father's Day:** flowers + "Mom" lettering, tie/moustache/tools "Dad" themes
- **Religious — Eid:** crescent moon, lanterns, mosque silhouette, dates & henna
- **Religious — Diwali:** diyas, rangoli, marigold, fireworks
- **Christmas:** Santa, reindeer, snowman, tree, wreath, gingerbread
- **Halloween:** pumpkin, ghost, witch, spider web, skull
- **Thanksgiving:** turkey, cornucopia, autumn leaves
- **Holi:** color splash, gulaal, pichkari
- **Raksha Bandhan:** rakhi, sibling motif
- **Farewell / Congratulations / Graduation:** cap & scroll, "Good Luck" banner, suitcase, trophy
- **New Year:** fireworks, champagne, "Cheers 2026", clock at midnight

These map cleanly onto our existing `THEME_MAP` in `generate-invite-artwork` — we already speak this vocabulary on the invite side, just not on the cake side.

## The fix

Rename the field intent from "Character" to **"Theme / Character"** and expand `CHARACTER_CATEGORIES` with motif-based options grouped by occasion. Then **filter visible categories based on the selected occasion** so the picker stays short and relevant.

### New categories to add

1. **💍 Wedding & Engagement** — Floral cascade, Two-tier classic, Monogram, Bride & Groom toppers, Ring & doves, Lace & pearls, Gold leaf elegance
2. **❤️ Anniversary & Love** — Roses & hearts, Mr & Mrs, Milestone years (25/50), Champagne toast, Photo memory, Lock & key
3. **👶 Baby Shower** — Teddy bear, Baby booties & rattle, Stork delivery, "It's a Boy" blue, "It's a Girl" pink, Gender-neutral clouds, Pram & moon
4. **💐 Valentine's & Romance** — Red roses, Cupid, Heart bouquet, Love letters
5. **🌷 Mother's Day** — Flower bouquet for Mom, "Best Mom" elegant, Tea & pearls
6. **👔 Father's Day** — Tie & moustache, Tools & toolbox, "Best Dad" rustic
7. **🌙 Eid Mubarak** — Crescent & lantern, Mosque silhouette, Dates & henna, Geometric gold
8. **🪔 Diwali** — Diyas & rangoli, Marigold garland, Fireworks night, Lakshmi gold
9. **🎨 Holi** — Color splash, Gulaal swirl, Pichkari fun
10. **🎄 Christmas** — Santa, Reindeer & sleigh, Snowman, Christmas tree, Wreath, Gingerbread house
11. **🎃 Halloween (adult)** — Pumpkin patch, Ghost & spider, Witch's brew, Skull & roses *(merge with existing Jack Skellington)*
12. **🦃 Thanksgiving** — Turkey & feast, Cornucopia, Autumn leaves
13. **🎓 Graduation & Achievement** — Cap & scroll, Trophy, "Class of 2026", Books & apple
14. **✈️ Farewell & Congratulations** — Suitcase & globe, "Bon Voyage", "Congrats" banner, Champagne celebration
15. **🎆 New Year** — Fireworks, Champagne toast, Clock at midnight, Gold confetti
16. **🪢 Raksha Bandhan** — Rakhi & sibling, Sister-brother bond
17. **🏵️ Dussehra / Festive India** — Marigold, Traditional gold, Festive elegance
18. **🌸 Easter** — Bunny & eggs, Pastel pastoral, Spring blooms

Plus a top-level **"✨ Elegant Adult Themes"** evergreen group:
- Floral elegance, Minimalist gold, Vintage romance, Modern geometric, Watercolor pastel

### Occasion → category filtering

Add an `occasions: string[]` field on each category. When `occasion` is selected in `CakeCreator`, the picker:
- Pins matching categories to the top (e.g. selecting Wedding promotes "Wedding & Engagement" + "Elegant Adult Themes")
- Keeps "🆓 Free Characters" and full list available below a divider ("Show all themes")
- For child occasions (Birthday, age < 13), keeps current behavior unchanged

If no occasion is selected, show all categories as today.

### Premium gating

- 3 free options per major adult category (e.g. Wedding: Floral cascade, Roses & hearts, Classic two-tier are free; rest premium)
- Matches existing model — keeps free tier viable across occasions, not just kids

### Free-tier expansion (small but important)

Add to the existing "🆓 Free Characters" group: **Floral elegance, Roses & hearts, Teddy bear, Pumpkin, Christmas tree** — so every major occasion has at least one free starter theme.

## Technical scope

**Files to change (frontend only — no backend/business logic):**

1. `src/components/CharacterPicker.tsx`
   - Rename label from "Character" to "Theme or Character" (UI copy)
   - Extend `Character` type with optional `occasions?: string[]`
   - Extend `CharacterCategory` with optional `occasions?: string[]`
   - Add ~18 new categories with ~80 new entries
   - Add `occasion?: string` prop
   - Sort categories: matching-occasion first, then "Free", then rest (collapsible "Show all themes" toggle)

2. `src/components/CakeCreator.tsx`
   - Pass `occasion` prop into `<CharacterPicker />` (line ~1717 area)
   - Update label text "Character" → "Theme or Character (optional)"

3. Prompt-side awareness (light touch — same file):
   - Where the prompt is composed (line 1062: `${character ? \` with ${character}\` : ''}`), no change needed — values like `floral-cascade-wedding` are already descriptive enough. The image model will render them as cake decoration motifs.

**Out of scope (this change):**
- No DB migration — `character` is already a free-text string
- No edge function changes
- No new images/assets
- Gallery filtering, search, or analytics around new themes

## Open questions (will default if not answered)

1. **Free vs premium split** — confirm "3 free per category" or prefer "1 free per category, rest premium"? *Default: 3 free per major category.*
2. **Filtering strictness** — when Wedding is selected, hide kids categories entirely, or just demote them? *Default: demote behind a "Show all themes" toggle so users can still mix.*
3. **Label rename** — "Theme or Character" vs "Cake Theme" vs keep as "Character"? *Default: "Theme or Character (optional)".*

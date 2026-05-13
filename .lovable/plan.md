## Remove all Character-Shaped / Sculpted cake code from the frontend

Hold the entire sculpted/character-shaped cake feature for a future Premium launch. Today it promises 4 images but only delivers 3, and the standalone "sculpted" mode adds complexity for no current revenue. After this change, the app generates exactly **3 decorated views** (Front, Side, Top-Down) every time. No sculpted-mode toggle, no character-shaped 4th image, no related UI or code paths.

Characters can still be selected as **decorations/toppers on the decorated cake** — only the sculpted full-cake output and sculpted-mode toggle are removed.

### Scope (frontend only)

**File: `src/components/CakeCreator.tsx`**

1. **Remove `cakeStyle` state and toggle entirely**
   - Delete `const [cakeStyle, setCakeStyle] = useState<"decorated" | "sculpted">("decorated");` (line ~59).
   - Remove the UI control that lets users pick decorated vs sculpted (search for `setCakeStyle` and the surrounding card/toggle JSX) and delete that block.
   - Remove all `cakeStyle === "sculpted"` / `cakeStyle === "decorated"` conditionals — collapse to the decorated branch everywhere (e.g., lines ~185, 200–203, 223, 1971, 1987–1990, 2245 area, 2591).

2. **Force 3-view generation** (line ~656)
   - Replace `const viewCount = character ? 4 : (cakeStyle === 'sculpted' ? 2 : 3);` with `const viewCount = 3;`.
   - Drop the `character ? 4` and sculpted-only branches in the same handler.

3. **Remove the "Both Cake Styles Included!" promo card** (lines ~1629–1673)
   - Delete the entire `{character && (...)}` info block promising "4 images: 3 decorated + 1 character-shaped".

4. **Remove the Character-Shaped result tile section** (lines ~2420–2511)
   - Delete the "Sculpted Style Section" that renders `generatedImages[3]`.
   - Remove the parent split-view conditional (around line ~2513) and always render the standard 3-up grid.

5. **Clean up labels, comments, and arrays referencing the 4th image / sculpted views**
   - Lines ~180–198: regenerate-handler comments and the `if (character) { … viewIndex===3 sculpted }` branch.
   - Line ~243: drop `'Character-Shaped'` from the labels array → keep `['Front (Decorated)', 'Side (Decorated)', 'Top-Down (Decorated)']` (or simpler `['Front', 'Side', 'Top-Down']`).
   - Line ~2389, 2534, 2556, 2593: remove `"3/4 View"` / `"Main View"` / sculpted label fallbacks — only Front/Side/Top-Down remain.
   - Line ~752: update the comment that mentions "decorated front/side/top OR sculpted main/angle/top".

6. **Other references in the file** — grep within `CakeCreator.tsx` for `sculpted`, `Sculpted`, `Character-Shaped`, `character &&` (where it gates the 4-image flow specifically) and remove every remaining reference. Keep `character` (the CharacterPicker selection) intact for use as a decoration only.

### Project-wide check
- `rg -n "sculpted|Character-Shaped|cakeStyle" src/` to confirm no other component, page, or hook reads `cakeStyle` or expects a 4th image. If any are found (e.g., in `PartyPackGenerator`, share/preview components, or storage utils), remove those branches too.
- Edge function `generate-complete-cake` — leave as-is (it accepts `viewStyle`/`viewCount` parameters; we just stop sending the sculpted ones). No backend changes.

### What we are NOT touching
- `CharacterPicker` component — characters remain selectable as cake-top decorations.
- Edge functions, Supabase tables, pricing, copy elsewhere on the site.
- The 3-view decorated generation pipeline itself.

### Verification
- Cake creator shows no decorated/sculpted style toggle.
- Selecting a character no longer shows the "Both Cake Styles Included" banner.
- Every generation produces exactly 3 tiles labeled Front / Side / Top-Down.
- No 4th tile, no sculpted-only 2-tile layout, no stuck spinners on a phantom 4th image.
- Regenerate-view works on all 3 tiles.
- `rg -i "sculpted|character-shaped" src/` returns zero matches (or only inside `CharacterPicker` itself, which is unrelated).

### Future
When ready to monetize, reintroduce sculpted character cakes as a Premium-gated add-on with a tuned prompt and clear paywall — built fresh, not revived from this dead code.

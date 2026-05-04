## Analysis

I agree. Looking at the current `buildPrompt` in `generate-invite-artwork/index.ts`, several theme palettes are intentionally muted/editorial — which reads as "dull" rather than "celebratory":

- **Garden / Floral** → "sage, blush and ivory" (very soft, low energy)
- **Minimalist** → "warm stone, bone and soft taupe" (deliberately neutral)
- **Tea & Roses** → "dusty rose, ivory and antique brass" (vintage, low saturation)
- **Rustic** → "warm amber, oat and forest" (earthy, not festive)
- Generic fallback → "warm neutrals with one quiet accent colour" (literally tells the AI to be quiet)

Combined with prompt language like "painterly", "editorial", "magazine-quality", and "tasteful", the model leans toward subdued still-life photography. Great for a luxury magazine, weak for a celebration.

The fix is to inject **celebratory warmth and energy** without sliding back into childish/cartoonish territory.

## Plan

Edit only `supabase/functions/generate-invite-artwork/index.ts`:

1. **Warm up every theme palette.** Re-tune each entry in `THEME_MAP` so the dominant tones are warm and inviting, with at least one festive accent (gold, copper, blush, amber, candle-glow, soft coral, deep wine, etc.). Examples:
   - Garden → keep florals but shift palette to "blush, peach and warm ivory with soft gold light"
   - Minimalist → "warm cream and champagne with a single warm accent" (not stone/taupe)
   - Tea & Roses → "rose, peach and warm gold" (drop the dustiness)
   - Rustic → "amber, terracotta and candle-gold" (drop forest green dominance)
   - Starlit → keep navy but add "warm candle glow and brushed gold" emphasis
   - Generic fallback → "warm celebratory palette: champagne, blush and gold accents"

2. **Add celebratory atmospherics to motifs.** Append subtle festive cues across motif variants where appropriate: soft bokeh light, warm candlelight, glints of gold, gentle confetti shadows, fairy-light glow, sun-warmed highlights. No emoji, no balloons-as-clipart, no cartoonish elements — just warm light and sparkle.

3. **Rewrite the global prompt language** for the adult and generic branches:
   - Replace "magazine-quality editorial" / "painterly photographic" with "warm, inviting, celebratory editorial photography with golden-hour light and a sense of joyful occasion".
   - Add explicit instruction: "the image must feel warm, festive and welcoming — never cold, dull, washed-out, grey, or overly neutral".
   - Keep existing negative prompts (no people, no text, no clipart, no cartoon) intact.

4. **Tone gate stays.** Adult = elegant + warm. Kids = playful + warm. Both branches now share the "warm & celebratory" instruction; only the styling band differs.

5. **Bump variation seed** so users who already have artwork auto-regenerate once with the new warmer prompt. Done by adding a `promptVersion: "v2-warm"` field to `metaJson`; the existing stale-meta check in `PartyPlannerDetail.tsx` will trigger a single refresh.

No DB changes, no UI changes, no email template changes, no new themes.

## Files

| File | Change |
|---|---|
| `supabase/functions/generate-invite-artwork/index.ts` | Warm up all theme palettes, add festive light cues to motifs, rewrite adult/generic prompt language to emphasise warmth and celebration, add `promptVersion` to meta to trigger one auto-refresh. |

## Out of scope

- No new themes, no new UI controls, no schema changes, no email/copy changes.

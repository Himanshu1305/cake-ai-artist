## Goal

Let users put whatever they want on the cake. Remove the warning that flags inputs like "Love you Dad" as invalid in the name field.

## Changes (single file: `src/components/CakeCreator.tsx`)

1. **Remove the `MESSAGE_PHRASE_REGEX` validation** from the Zod schema (lines ~37–49). Keep only the `min(1)` / `max(30)` length checks.
2. **Remove the inline red warning** rendered below the input (lines ~1700–1709), and drop the `aria-invalid` prop tied to the regex.
3. **Soften the helper text** under the input from a restrictive "Don't put messages here…" to a neutral hint, e.g. "This text will appear on the cake. Use a name, nickname, or a short phrase like 'Happy Birthday Aarav'."
4. Delete the now-unused `MESSAGE_PHRASE_REGEX` constant.

## Out of scope

- No change to the generation edge function, occasion/relation fields, or the previously fixed cross-cake context leak.
- No change to placeholder examples or label.

## Verification

- Type "Love you Dad" in the name field → no red warning appears, submit button stays enabled.
- Type a plain name like "Aarav" → still works as before.

## What's happening

This isn't a bug in the image model and it isn't leakage from a previous cake. You typed `Love you Dad` into the "special person's name" field. The cake generator takes whatever is in that field and tells the image model to render it on the cake as the name, alongside the occasion text (`Welcome Baby`). So all three views correctly rendered:

- `Welcome Baby` (occasion text for baby-shower)
- `Love you Dad` (treated as the name)

The field is labeled `🎯 Enter the special person's name...` which is too vague — users can easily think it's the message line.

## Fix

Two-part fix, all on the frontend form (no change to the image-generation backend logic):

1. **Clarify the field** in `src/components/CakeCreator.tsx`:
   - Label: `Recipient's name` with a small helper line: `Just the person's name (e.g. Aarav, Baby Riya). Don't put messages here — the cake message is generated separately below.`
   - Placeholder: `e.g. Aarav, Riya, Baby` (drop the vague "special person").

2. **Validate the name** before submit (and on blur with an inline error):
   - Max 30 chars (already 50, tighten it).
   - Reject obvious message phrases. If the value contains any of these tokens (case-insensitive, whole-word): `love you`, `happy`, `welcome`, `congrats`, `congratulations`, `merry`, `wishes`, `wishing`, `best wishes`, `dear`, `to my`, `from`, show an inline error:
     > "This looks like a message, not a name. Please enter just the recipient's name — the cake message is generated for you below."
   - Block submission until corrected. No silent rewriting (don't auto-strip — the user should see what's wrong).
   - Add the same regex check to the Zod schema (`nameSchema`) so it runs in one place.

3. **Optional safety on the prompt** (small, low-risk): in `supabase/functions/generate-complete-cake/index.ts`, when building the cake image prompt, hard-cap `name` to 30 chars and strip newlines before interpolation. This is defensive only; the real fix is the input validation above.

## Out of scope

- No change to occasion text, message generation, photo overlay, or job/polling logic.
- No reset of unrelated form state between generations.

## Technical notes

- File touched: `src/components/CakeCreator.tsx` (label, placeholder, helper text around line 1677–1682; Zod `name` schema around line 39; submit handler error surface).
- Optional second file: `supabase/functions/generate-complete-cake/index.ts` (sanitize `name` near line 141 before it's used in `buildMessages`).
- No DB migration, no new dependency.
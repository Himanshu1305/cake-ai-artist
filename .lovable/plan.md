## Issue 1 — Custom message overwritten by AI message on the share page

**Root cause:** In `src/components/CakeCreator.tsx`, the realtime/polling handler for `cake_generation_jobs` (around lines 977-980) unconditionally overwrites the on-screen message with the AI-generated `greeting_message` from the job row:

```ts
if (row.greeting_message) {
  setGeneratedMessage(row.greeting_message);
  setDisplayedMessage(row.greeting_message);   // ← clobbers user's custom text
}
```

The user picks "✍️ Custom" and types text → `displayedMessage` is correctly set to the custom message during submit. But moments later the background job finishes generating its own AI greeting and writes it back to `cake_generation_jobs.greeting_message`. The subscriber overwrites `displayedMessage`, so by the time the user clicks "Save to Gallery", the row is persisted with the AI message — and that's what `get_public_cake` returns on `/cake/:id`. Also the edge function (`generate-complete-cake/index.ts`, line 731) generates an AI greeting on every run even when the user supplied a custom one — wasted credits.

**Fix:**

1. `src/components/CakeCreator.tsx` — guard the realtime update:
   ```ts
   if (row.greeting_message && !(useCustomMessage && customMessage.trim())) {
     setGeneratedMessage(row.greeting_message);
     setDisplayedMessage(row.greeting_message);
   }
   ```
2. `src/components/CakeCreator.tsx` — pass the custom message to the edge function in the request body when `useCustomMessage && customMessage.trim()` is true (new field `customMessage`).
3. `supabase/functions/generate-complete-cake/index.ts` — when `customMessage` is present:
   - seed `greeting_message` in the initial job-row insert with the custom text,
   - skip the `generateMessageAsync()` call entirely (no AI message, no credits spent),
   - return `greetingMessage: customMessage` in the response payload.

This guarantees the custom text survives all the way to `generated_images.message` and therefore to the public share page.

## Issue 2 — Fast vs High Quality share URL difference

I need one detail before fixing this one. From your earlier reply: "Fast has got an image as part of URL but High Quality does not." Could you confirm which of these you mean (I'll ask again in chat after the plan):

- **WhatsApp link preview**: Fast cake shows a thumbnail card, HQ shows only text — i.e. the Open Graph image is missing for HQ.
- **The text WhatsApp pastes**: Fast pastes an image URL alongside the link, HQ pastes only the link.
- **The Magic Share Link string itself** looks different between the two modes.

Most likely it's the first one: HQ saves a row whose `image_url` is a still-rendering placeholder (or hero hadn't finished when "Save to Gallery" fired), so the share page has no OG image. Once you confirm, the fix is either:
- block "Save to Gallery" until the hero view is ready, or
- on the SharedCake page, fall back to a sibling image when `image_url` is a placeholder.

I'll lock down Issue 2's fix after your confirmation, but Issue 1 is unambiguous and can be implemented now.

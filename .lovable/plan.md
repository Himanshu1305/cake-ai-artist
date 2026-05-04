## Fixes

### 1. "Regenerate suggestion" button does nothing

Cause: `applyInviteSuggestion` cycles through a hard-coded `INVITE_COPY` map. For most themes (e.g. **Jungle Safari**) there is exactly **one** default variant and no occasion-specific variant, so `index % 1` always resolves to the same line — clicking the button silently sets the same text and looks broken.

Fix:
- Wire the button to a new edge function `generate-invite-copy` that uses Lovable AI (`google/gemini-2.5-flash`) to produce a fresh, on-brand headline + 2–3-sentence message based on `theme`, `occasion`, `title`, host name, and event date. Returns JSON via tool calling so it's safe to parse.
- Frontend flow:
  - Button shows a spinner while generating.
  - On success → set headline/message, increment suggestion index (so cache-busting `key` on `InvitePreview` still re-renders), set `inviteEdited = false`.
  - On 429 / 402 / network error → fall back to the existing local `getSuggestedInvite` cycling so the button still does *something* visible.
  - Pass an `avoid` array (the previous headline) so the AI doesn't return the exact same line.

### 2. Invite copy ignores occasion (jungle/lions used for a Marriage Anniversary)

Same root cause: when the user picks a kid-leaning theme but the occasion is anniversary/wedding/engagement/baby shower/housewarming/retirement, the local map has no occasion override and falls back to the childish default.

Fix:
- The new `generate-invite-copy` function takes occasion as a first-class input and is prompted to:
  - Match the **occasion tone** (warm/romantic for anniversaries, gentle for showers, etc.) even when the theme is playful — re-interpreting theme motifs tastefully (e.g. "jungle" → "wild ride of years together" instead of "lions, tigers, and cake").
  - Avoid kid imagery for adult occasions.
  - Stay 1 short headline + 2–3 sentence message, plain text, no emojis spam, no markdown.
- Auto-call this function (instead of the local lookup) on first load of the Invite tab when:
  - There's no saved `invite_headline`/`invite_message`, or
  - The previously saved copy was generated for a different theme/occasion (we already track this — extend the existing "stale leak" check to also trigger a regeneration when occasion is romantic/elegant but copy contains kid keywords like `lions, tigers, scrunchies, dinos, paw patrol, unicorn, rainbow, glitter, pups, vroom, dig` etc.).
- Keep the local `INVITE_COPY` map only as the offline fallback.

### 3. Footer text on the invite is barely visible

In `InvitePreview.tsx` (L846–851), the footer uses `color: "#777"` and `#999` on a cream/white background and a faint `dashed` border — invisible in the screenshot.

Fix:
- Replace with darker, theme-aware colors: `color: t.accent` for the brand line and `#444` for the URL line.
- Make font slightly bolder (`fontWeight: 600` for the "Crafted with" line) and font sizes 13/12.
- Replace dashed border with a solid `1px solid ${t.accent}33` so it reads as a real divider.
- Same change applied to the email-rendered version inside `send-party-invite/index.ts` if it duplicates these styles (verify and update so the email matches).

## Files to change

| File | Change |
|---|---|
| `supabase/functions/generate-invite-copy/index.ts` (new) | AI-powered invite copy generator with theme + occasion + avoid-list, structured tool-call output. |
| `supabase/config.toml` | Register new function (default `verify_jwt = true`). |
| `src/pages/PartyPlannerDetail.tsx` | Make "Regenerate suggestion" call the edge function with loading state + fallback; auto-call on first invite load when copy is missing or mismatched (extended leak detection); add `inviteGenerating` state. |
| `src/components/InvitePreview.tsx` | Darker, more visible footer colors + solid divider + bolder weight. |
| `supabase/functions/send-party-invite/index.ts` | Mirror the footer color/weight change in the email HTML so sent invites match. |

## Out of scope
- No DB schema changes.
- No new themes (already added in previous round).
- Local `INVITE_COPY` map stays as offline fallback; not removing existing entries.
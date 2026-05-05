I found two separate issues:

1. The greeting message prompt is technically asking for warmth, but it still allows “polished greeting-card” language. It needs stronger relationship-specific tone rules: friend should sound casual and emotionally real; colleague should stay warm but respectful/professional.
2. High Quality is likely timing out before it can return. The client currently waits 3 minutes, but the backend can spend up to about 105 seconds per image attempt, and because there is one retry enabled on the client, the visible failure can happen even while the backend/model is still slow or being restarted. Also, High Quality currently uses the slowest image model for all 3 parallel views, which increases timeout risk.

Plan:

1. Humanize the AI message generator
   - Update the backend message prompt in `generate-complete-cake`.
   - Add a small `getToneProfile(relation)` helper with separate tone rules:
     - Friend: casual, affectionate, specific-feeling, light, natural; contractions allowed; avoid formal words like “wishing you continued success”.
     - Colleague: warm and encouraging but not overly intimate; professional respect without corporate-sounding language.
     - Family/partner: more emotionally expressive and personal.
   - Add hard “avoid” rules for robotic/formal phrases such as “on this special occasion”, “may your day be filled”, “wishing you continued success”, “heartfelt congratulations”, unless the relationship genuinely calls for it.
   - Keep the output at 2 short sentences so it feels like a real WhatsApp/card note, not a formal letter.
   - Add better examples for `friend + congratulations`, `friend + birthday`, and `colleague + congratulations`.

2. Make High Quality reliable without hurting Standard mode
   - Keep Standard exactly on the current fast path: 3 images, parallel, target ~30 seconds.
   - Change High Quality from “slowest model for all 3 views” to a safer premium-quality path:
     - Use the faster pro-level image model as the primary model for High Quality as well.
     - Strengthen the High Quality prompt with more detail/quality instructions instead of relying only on the slowest model.
     - Use the slowest pro model only as an optional fallback for a single failed view/regeneration later, not for the initial 3-image generation.
   - This preserves the “3 images” promise and avoids the repeated timeout shown in your screenshot.

3. Fix timeout/retry behavior
   - Remove automatic retry for full cake generation. Retrying the whole 3-image job doubles the time and cost, and can make users wait only to fail again.
   - Keep a longer client timeout for High Quality only, but align it with the backend budget.
   - Improve error text so High Quality timeout says something like: “High Quality is taking longer than usual. Please try Standard or regenerate the missing view,” instead of the generic “AI service may be busy.”

4. Keep partial success behavior
   - If High Quality returns 1–2 views successfully, still show them instead of failing the whole cake.
   - Keep `failedViews` so the user can retry the missing view.

5. Deploy and test
   - Redeploy the `generate-complete-cake` backend function.
   - Test Standard to confirm it still returns 3 images quickly.
   - Test High Quality to confirm it no longer hits the timeout path as easily and returns partial/successful output instead of the red failure toast.

No database changes are needed.
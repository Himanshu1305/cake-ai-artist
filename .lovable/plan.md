## Diagnosis (confirmed from your DB + code)

Last 3 `cake_generation_jobs` rows (16:00–17:02 UTC today) all failed identically:

```
status = partial_failed
hero_error = side_error = top_error = "Image generation failed: 403"
```

403 on every single image call means the request reached the gateway but the model was rejected — this happens when the `vendor/model` id is not in the current catalog allowlist.

Grepping the codebase for the stale ids:

- `supabase/functions/generate-complete-cake/index.ts:176` → `google/gemini-3.1-flash-image-preview` (primary)
- `supabase/functions/generate-complete-cake/index.ts:178` → `google/gemini-3-pro-image-preview` (high-quality fallback)
- `supabase/functions/generate-logo/index.ts:39` → `google/gemini-3-pro-image-preview`

The current Lovable AI image model catalog has these under new names (the `-preview` suffix was dropped):

| Old (rejected, 403) | New (in catalog) |
|---|---|
| `google/gemini-3.1-flash-image-preview` | `google/gemini-3.1-flash-image` |
| `google/gemini-3-pro-image-preview` | `google/gemini-3-pro-image` |

The fast fallback `google/gemini-2.5-flash-image` is still correct, so no change there.

## Fix (minimal, targeted)

Two files, three edits:

1. **`supabase/functions/generate-complete-cake/index.ts`**
   - Line 176: `'google/gemini-3.1-flash-image-preview'` → `'google/gemini-3.1-flash-image'`
   - Line 178: `'google/gemini-3-pro-image-preview'` → `'google/gemini-3-pro-image'`
   - Line 170 comment: update the id reference so it stays accurate.

2. **`supabase/functions/generate-logo/index.ts`**
   - Line 39: `"google/gemini-3-pro-image-preview"` → `"google/gemini-3-pro-image"`

Both edge functions are Lovable-managed and redeploy automatically after the edit.

## Verify the fix

1. Immediately after the edit, run one real generation from the UI (fast mode).
2. Query the DB to confirm the new row has `status = 'completed'` and no `hero_error` / `side_error` / `top_error`.
3. Watch the watchdog — the 1-hour failure rate should drop back toward 0% at the next 10-minute run, and the alert email will stop.

## Why this happened (context, not action)

Lovable's AI Gateway is an allowlist — model ids must match the catalog exactly. When Google promotes a preview model to GA, the gateway drops the `-preview` suffix and starts rejecting the old id with 403. This is the second-most-common cause of a sudden "100% failure" spike on image generation (the first being a `LOVABLE_API_KEY` rotation). The AI Gateway logs showing 0 requests in the last 7 days is a separate diagnostic quirk (logs sometimes lag on preview-tier requests) and doesn't indicate a key problem — the 403 response body itself confirms the model-id cause, not an auth cause.

## Not doing (out of scope for this fix)

- No key rotation. The 403 is model-shaped, not auth-shaped; rotating would be a wasted spend of a rotation quota.
- No watchdog / alert threshold changes — they worked exactly as designed and told you within the hour.
- No party-planner or other feature changes; the previously approved Party Planner vendor discovery plan resumes after this hotfix.

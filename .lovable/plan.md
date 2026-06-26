## Approach: diagnose first, then fix

You're right that the policy worked before — I won't rewrite it. Instead I'll add a small one-time diagnostic to the upload path so the next failed attempt tells us exactly what's wrong. No policy changes yet.

## What I'll add (diagnostic only)

In `src/components/AudioRecorder.tsx`, right before calling `supabase.storage.from('cake-audio').upload(...)`:

1. Read the current session and log (to browser console + a toast on failure):
   - `auth.uid()` as seen by the client (`session.user.id`).
   - The `userId` prop being used to build the path.
   - The full storage path the upload will use.
   - Token expiry (`session.expires_at`) and seconds-to-expiry.
   - Blob size and mime type.
2. Force a session refresh (`supabase.auth.refreshSession()`) if the token expires in under 60s, then re-read the session.
3. On RLS failure, surface a debug-friendly toast: "RLS failed. uid=… path=… expires_in=…s" so you can screenshot it on mobile and share.

No storage policy, no database, no business-logic changes.

## Why this is the right next step

The same three possibilities all produce the identical "new row violates row-level security policy" message:

- Stale/expired JWT → `auth.uid()` is null at the storage edge.
- `userId` prop drifted from the actual logged-in user → folder check fails.
- A different user/session is uploading into someone else's folder (e.g. after re-login on the same page).

The diagnostic distinguishes them in one failed attempt. After we see the values, the fix is either a one-line session refresh, a path correction, or — only if neither — a policy review.

## After we see the diagnostic output

I'll come back with a targeted fix (likely a single line change) and remove the extra logging. No migrations needed at this stage.
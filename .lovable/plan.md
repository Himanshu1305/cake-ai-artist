## Problem
Mobile users get `Couldn't save voice message — new row violates RLS policy` when recording a voice note. Two possible failing writes:

1. **Storage upload** to `cake-audio` bucket (INSERT on `storage.objects`)
2. **DB update** on `generated_images` (UPDATE with `WITH CHECK auth.uid() = user_id`)

## Diagnosis findings
- `cake-audio` policies look correct: INSERT/UPDATE/DELETE all require `auth.uid()::text = foldername[1]`.
- `generated_images` UPDATE policy correct: `auth.uid() = user_id`.
- The bulk update path uses `.eq("share_group_id", groupId)`. If **any** sibling row in that group has a `user_id` not equal to `auth.uid()` (e.g. legacy admin-granted row, or a row created by a service-role process with a different user_id), PostgREST returns "new row violates row-level security policy" for the whole batch — even if only one row mismatches.
- On mobile Safari, session refresh can race with the upload. If the access token expired mid-recording, `auth.uid()` becomes null and the storage INSERT WITH CHECK fails.

## Fix plan

### 1. Make the DB update RLS-safe (highest-value fix)
In `src/components/AudioRecorder.tsx`, scope the sibling update to **only rows the current user owns**:

```ts
.update({ audio_url, audio_duration_seconds, audio_mime_type })
.eq("share_group_id", groupId)
.eq("user_id", userId)   // ← add this
```

This prevents one stray sibling row from poisoning the whole batch.

### 2. Refresh the session right before save
At the top of `saveAudio()`, call `await supabase.auth.getSession()` and abort with a clear "Please sign in again" toast if there's no session. This eliminates the expired-token failure mode on mobile.

### 3. Surface the exact failing step to the user
Right now the toast just shows `e.message`. Wrap each step (storage upload, sibling lookup, group update, single update) with its own try/catch and prefix the toast with the failing step (e.g. `Storage upload failed: …`). That makes future mobile reports diagnosable without a console.

### 4. Audit sibling ownership (one-time read)
Run a quick query to confirm whether any `share_group_id` groups contain rows with mixed `user_id`. If yes, this confirms the root cause and we add a one-time backfill.

### 5. Verify
After deploy, ask the user to re-test on the same cake. The toast will now name the exact step that fails if anything still breaks.

## Out of scope
- No changes to storage policies (they're correct).
- No schema migration needed unless the audit in step 4 reveals mixed ownership.
## Root cause (confirmed from edge function logs)

The backend function is now being reached successfully, but Supabase Storage rejects the upload with:

```
StorageApiError: mime type audio/mp4;codecs=mp4a.40.2 is not supported (status 415)
```

iOS Safari records audio as `audio/mp4;codecs=mp4a.40.2`. The `cake-audio` bucket's `allowed_mime_types` list contains `audio/mp4` but NOT the variant with the `;codecs=...` parameter, so Storage treats them as different types and rejects it. This is the entire remaining blocker — RLS is no longer involved.

## Fix

Two small, safe changes in `supabase/functions/save-cake-audio/index.ts`:

1. **Normalize the MIME type before uploading** — strip any `;codecs=...` parameter so `audio/mp4;codecs=mp4a.40.2` becomes `audio/mp4`, `audio/webm;codecs=opus` becomes `audio/webm`, etc. The actual audio bytes are unchanged; only the declared `contentType` passed to Storage is cleaned.
2. **Map the normalized MIME to a safe file extension** (`.m4a` for `audio/mp4`, `.webm` for `audio/webm`, `.mp3`, `.wav`, `.ogg`) instead of relying on the raw subtype, so iOS recordings get a `.m4a` extension that plays everywhere.

Also widen the bucket's `allowed_mime_types` as a belt-and-suspenders measure to include `audio/mp4`, `audio/m4a`, `audio/x-m4a`, `audio/webm`, `audio/ogg`, `audio/mpeg`, `audio/wav` (the normalized list — no codec params).

No client/UI changes needed. After this, iOS voice recordings save successfully.

## Why this will work

The edge function log is unambiguous: upload reaches Storage, Storage returns 415 specifically because of the codec-suffixed MIME. Removing the suffix is the documented Supabase-recommended fix for this exact error, and it also matches what the bucket already permits.

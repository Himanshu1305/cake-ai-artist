## Goal

Fix the share link "made this just for you" line so it shows the sender's real name instead of the email prefix, both for you and for everyone else.

## Step 1 — Update your two profiles

Use the data tool to set:
- `himanshu1305@gmail.com` → first_name=`Himanshu`, last_name=`Dixit`
- `himanshu1305.author@gmail.com` → first_name=`Himanshu`, last_name=`Dixit`

Your shared cakes (and all future ones) will then say "Himanshu made this just for you 💝".

## Step 2 — Backfill all other users from auth metadata

47 of 63 profiles have no `first_name`, but 61 of 63 `auth.users` rows have a name in `raw_user_meta_data` (Google OAuth stores it as `full_name` / `name`). Backfill via a one-shot update:

```sql
UPDATE public.profiles p
SET first_name = COALESCE(
      NULLIF(u.raw_user_meta_data->>'first_name',''),
      NULLIF(u.raw_user_meta_data->>'given_name',''),
      split_part(COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name',''), ' ', 1)
    ),
    last_name = COALESCE(
      NULLIF(u.raw_user_meta_data->>'last_name',''),
      NULLIF(u.raw_user_meta_data->>'family_name',''),
      NULLIF(NULLIF(regexp_replace(COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name',''), '^\S+\s*', ''), ''), ' ')
    )
FROM auth.users u
WHERE u.id = p.id
  AND (p.first_name IS NULL OR TRIM(p.first_name) = '');
```

Existing populated profiles stay untouched.

## Step 3 — Fix `handle_new_user` for future Google sign-ups

The current trigger only reads `first_name`/`last_name` from metadata. Update it to also fall back to Google's `given_name` / `family_name` / `full_name` / `name`, so new Google sign-ups land in `profiles` with a real name and the share-card kicker works out of the box.

Migration replaces the function body — no schema/permissions change, no other tables touched.

## Step 4 — Verify

- Re-open the existing share link → "Himanshu made this just for you 💝".
- Spot-check 3 other recently-active users' profiles → first_name populated.
- New Google sign-up (or manual test of trigger) → first_name set from metadata.

No UI changes, no edge-function changes, no frontend code changes. Then **Publish → Update** is **not** required (this is data + trigger only, takes effect immediately).

## Files / tools touched

- Data update via insert tool — your 2 profiles + backfill.
- Migration — updated `handle_new_user` function.

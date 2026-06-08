Findings so far:
- Last successful cake job: Jun 7 12:24 UTC, Eid Mubarak, completed normally.
- After that: page visits continued, but there are no new cake jobs, no generation tracking rows, and no new user profiles.
- Live browser test shows public page requests now fail with `401 permission denied for function has_role`.
- The failure maps to the Jun 6 auth-hardening migration that revoked anonymous access to `has_role`, while public policies/views still evaluate `has_role` for recipes and featured images.
- Earlier table-grant theory for `cake_generation_jobs` is not supported by the evidence.

Plan:
1. Fix the public policy regression
   - Add a migration that removes `has_role` from anonymous/public read paths.
   - Split public and admin policies instead of using `is_published = true OR has_role(...)` in one policy.
   - Make admin-only policies apply only to authenticated users so anonymous users never evaluate `has_role`.
   - Add/repair the public featured-image read policy used by `public_featured_images`.

2. Verify the homepage/landing data path
   - Re-test `/india` and confirm `cake_recipes` and `public_featured_images` no longer return 401.
   - Confirm public browsing still works without exposing private/non-featured user images.

3. Add hard evidence around cake generation start
   - Add client-side logging around the exact `generate-complete-cake` invoke phase.
   - Add a hard timeout for the initial job-start request so the UI cannot sit at simulated 75% forever.
   - Surface the true phase to users: starting request, job queued, waiting for first cake view, or backend error.

4. Improve job polling failure handling
   - Make polling inspect and report read errors from `cake_generation_jobs` instead of silently ignoring them.
   - If a job cannot be read, stop the indefinite loading state and show a retry path.

5. Validate end-to-end stability
   - Use a logged-in test attempt or live preview session to confirm a generation request creates a job row quickly.
   - Check that the UI moves past 75% when a job starts, or fails clearly with a real error if the function/auth path is blocked.

Technical note:
The immediate confirmed regression is not missing grants on `cake_generation_jobs`; it is the `has_role` permission change interacting with public RLS/view policies. The generation stuck symptom still needs validation after that fix because its request is authenticated and JWT-gated, but the absence of new jobs proves the failure happens before job creation.
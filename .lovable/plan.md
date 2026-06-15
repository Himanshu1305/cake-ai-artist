# Fix: "Sign-in successful" toast appears but page never navigates

## What's happening (evidence)

Your auth logs show that on `cakeaiartist.com` between 12:31 and 12:35 you successfully completed sign-in **six times in a row** (each `/token` returned 200). The toast said "Logged in successfully!" each time, but the Auth page never navigated, so you kept clicking sign-in. The session was actually being created every time — the UI just refused to leave `/auth`.

The cause is in `src/pages/Auth.tsx`. Navigation after login is delegated **entirely** to the `onAuthStateChange` `SIGNED_IN` handler. That handler has two ways to silently fail:

1. **`mountedRef` bug (lines 45–54).** A separate `useEffect` with `[]` deps owns `mountedRef`, and its cleanup sets `mountedRef.current = false`. Under React StrictMode (and in any case where the Auth component remounts), the second mount never resets it back to `true`. Every subsequent `if (!mountedRef.current) return;` inside the SIGNED_IN handler then short-circuits before `navigate(...)` is called — so login succeeds but the page stays put.
2. **Listener-only navigation is fragile.** Even setting (1) aside, depending on a deferred `setTimeout(... navigate ...)` inside an event listener for a *primary* user action ("I clicked Sign In") is brittle. Any thrown error, slow `profiles` query, or unmount cancels navigation with no visible feedback.

## Fix (two small changes, frontend only)

### Change 1 — Navigate directly inside `handleAuth` after `signInWithPassword` succeeds
File: `src/pages/Auth.tsx` (around line 254–262)

- After `signInWithPassword` resolves without error, immediately:
  - Read `profiles.country` for `data.user.id`.
  - If country is missing → `navigate('/complete-profile')`.
  - Otherwise → `navigate(getCountryHomePath(detectedCountry))`.
- Keep the toast.
- Remove the comment "Navigation is handled by onAuthStateChange listener".

This makes password login deterministic: the same function that started the sign-in finishes it.

### Change 2 — Fix the `mountedRef` lifecycle
File: `src/pages/Auth.tsx` (lines 45–54)

- Initialize `mountedRef` with `useRef(true)`.
- Inside the **same** `useEffect` that uses it (the big one starting line 90), set `mountedRef.current = true;` at the top of the effect body, and `mountedRef.current = false;` in its cleanup.
- Delete the redundant cleanup in the small `[]`-deps `useEffect` at lines 47–54 (keep only the `?mode=reset` logic there).

This guarantees `mountedRef` reflects the real mount state on every (re)mount, so the OAuth/SIGNED_IN path (still needed for Google login) keeps working.

### What stays the same
- `onAuthStateChange` listener stays — Google OAuth still needs it (OAuth flow returns via redirect, not via `handleAuth`).
- Password-recovery branch unchanged.
- `getSession()` "already logged in" redirect unchanged.
- No backend, RLS, or edge-function changes.
- No changes to the cake-generation work from earlier today.

## Verification
1. Hard reload `cakeaiartist.com/auth` on mobile.
2. Enter email + password, tap Sign In once.
3. Expected: toast appears **and** the page leaves `/auth` to either the country landing page or `/complete-profile` on the first attempt.
4. Repeat with Google sign-in to confirm OAuth path still navigates (it goes through the listener; the `mountedRef` fix is what protects it).

## Out of scope
- No changes to the cake generator, attempt-logging table, or watchdog.
- No header/profile UI changes.
- No auth provider configuration changes.

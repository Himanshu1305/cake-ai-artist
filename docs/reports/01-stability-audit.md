# Phase 1: Stability Audit Report

**Date:** 2026-07-13  
**Branch:** overnight-work  
**Files scanned:** src/ (all .tsx/.ts), supabase/functions/ (all index.ts)

---

## Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| Critical | 3 | 3 |
| High | 4 | 4 |
| Medium | 2 | 2 |
| Low | 3 | noted |

---

## Fixes Applied

### Fix 1 — `totalGenerations` double-count (Critical)
**File:** `src/components/CakeCreator.tsx`  
**Issue:** `generation_tracking` has two row types: yearly (`month IS NULL`) and monthly (`month = 1-12`). The quota check fetched ALL rows and summed `count`, so a user with 3 monthly rows + 1 yearly row was seen as having 4× their actual yearly total.  
**Fix:** Added `.is("month", null)` filter so only the yearly aggregate row is summed.

### Fix 2 — Hardcoded "5 free designs" string (High)
**File:** `src/pages/FreeCakeDesigner.tsx`  
**Issue:** The free limit (5) was hardcoded as a string literal in 4 places. Any change to the limit required hunting every occurrence.  
**Fix:** Added `const FREE_TOTAL_LIMIT = 5` at the top; all 4 instances now reference the constant.

### Fix 3 — SharedCake email capture silent failure (Critical)
**File:** `src/pages/SharedCake.tsx`  
**Issue:** `setEmailSubmitted(true)` was called unconditionally after the Brevo invoke, outside the try block. A failed API call showed the success state anyway, and the localStorage "already captured" flag was set — permanently preventing retry.  
**Fix:** Moved `setEmailSubmitted(true)` and localStorage write inside the success branch only. Errors now show a destructive toast.

### Fix 4 — Auth password minimum 6 → 8 characters (Medium)
**File:** `src/pages/Auth.tsx`  
**Issue:** Supabase default minimum is 6, but 6-char passwords are weak. The signup schema and password-reset handler both used 6.  
**Fix:** Updated Zod schema (`min(8)`), reset handler check, and both `minLength` input attributes to 8.

### Fix 5 — Gallery delete without confirmation (High)
**File:** `src/pages/Gallery.tsx`  
**Issue:** Clicking "Delete" on a gallery image called `deleteImage()` directly with no confirmation. A misclick permanently deleted the image.  
**Fix:** Added `deleteDialog` state; delete button now opens an AlertDialog. The actual delete runs only on "Delete" confirm.

### Fix 6 — Admin.tsx `window.confirm` → AlertDialog (High)
**File:** `src/pages/Admin.tsx`  
**Issue:** `deleteImage()` used the native browser `confirm()` dialog which can't be styled, is blocked by some browsers in iframes, and doesn't match app UX.  
**Fix:** Converted to `deleteImageDialog` state + AlertDialog (matching existing `removePremiumDialog` pattern). Added `confirmDeleteImage()` helper; `deleteImage()` now just opens the dialog.

### Fix 7 — Admin analytics full row-fetch with `select('*')` (Medium)
**File:** `src/pages/Admin.tsx`  
**Issue:** `loadAnalytics()` fetched `select('*').limit(500)` for profiles and images, transferring all columns including large ones (image URLs, full prompts, etc.) when only a subset was needed.  
**Fix:** Narrowed selects to only required columns:
- `profiles`: `id, email, is_premium, is_founding_member, created_at`
- `generated_images`: `id, user_id, created_at, occasion_type, prompt, featured, message_type`
- `blog_subscribers`: `subscribed_at, is_active`
- Limit raised to 1000 to compensate for accurate counts.

### Fix 8 — add-contact-to-brevo: anonymous SharedCake flow + IP rate limiting (Critical)
**File:** `supabase/functions/add-contact-to-brevo/index.ts`  
**Issue:** The function required an `Authorization` header. SharedCake recipients are not logged in — the `supabase.functions.invoke` call was returning a 401 silently, yet `SharedCake.tsx` showed success (now fixed by Fix 3). There was also no abuse protection for the anonymous path.  
**Fix:**
- Added `anonymous?: boolean` body flag. When `true`, skips JWT check.
- Added IP-based rate limiting for anonymous calls: max 5 per IP per hour via `brevo_anon_rate_limits` table (migration: `20260713000001_brevo_anon_rate_limits.sql`).
- Added basic email format validation.

### Fix 9 — save-image-to-storage: security hardening (High)
**File:** `supabase/functions/save-image-to-storage/index.ts`  
**Issue:** The function fetched any HTTPS URL without restriction, making it an open proxy. No size cap meant a large URL response could consume significant memory and storage. No content-type check meant non-images could be saved.  
**Fix:**
- Domain allowlist: only permits known AI CDN hosts (`openrouter.ai`, `cdn.openai.com`, `oaidalleapiprodscus.blob.core.windows.net`, `storage.googleapis.com`, `generativelanguage.googleapis.com`, `replicate.delivery`).
- 10 MB size cap for both external downloads and base64 data URLs.
- Content-type validation: external URL response must return `image/*`; base64 data URL content-type must also be `image/*`.

---

## Issues Found — Not Yet Fixed

### Low: `check-payment-status/index.ts` — hardcoded fallback key
`rzp_live_Rp0dR29v14TRpM` appears as a fallback when the env var is missing. This is a live Razorpay key ID (not secret) but should still come from env. Low urgency since it's only a key ID, not the secret.

### Low: Admin.tsx `select('*')` in `loadImages()` (separate from Fix 7)
`loadImages()` also fetches `select('id, image_url, featured, created_at, prompt, profiles(email), featured_page, featured_pages, occasion_type')` which is already fairly narrow — acceptable for now.

### Low: No ErrorBoundary on heavy components
`CakeCreator`, `PartyPackGenerator`, `PartyPlannerDetail` render without an ErrorBoundary. A React render error in these would blank the page rather than showing a recovery UI. Addressed in Phase 2.

---

## Not Actionable / By Design

- `verify-razorpay-payment`: HMAC SHA256 verification is correct; 23505 duplicate handling is correct.
- `razorpay-webhook`: Signature verification present; handles both `payment.captured` and subscription events.
- `create-razorpay-order`: First-week discount is server-side enforced (correct). JWT validation present.
- Auth.tsx navigation logic: POST_LOGIN_DESTINATION constant pattern is clean; no issues.

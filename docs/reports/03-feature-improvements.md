# Phase 3: Feature Improvement Analysis

**Date:** 2026-07-13  
**Method:** Static analysis of src/ and supabase/functions/  

---

## Overview

The codebase covers: AI cake generation, gallery, party pack (invite/banner/topper), party planner (checklists, RSVP, vendor outreach), blog, SharedCake link sharing, and subscription billing. The following improvements are ordered by estimated user impact vs. engineering effort.

---

## Quick Wins (< 1 day each)

### 1. CakeCreator: Show remaining free quota on the form, not just on upgrade nudge
**Current:** The generation limit counter only appears after a failed attempt or in `GenerationLimitTracker`. Users don't see "2 of 5 used" while filling the form.  
**Improvement:** Show a subtle progress indicator at the top of CakeCreator before the first generate. This reduces confusion about limits and improves expectation setting.  
**Files:** `src/components/CakeCreator.tsx`, `src/components/GenerationLimitTracker.tsx`

### 2. SharedCake: Auto-scroll to email capture on page load
**Current:** The email capture form is below the fold. Many visitors don't see it.  
**Improvement:** After a 2–3 second delay (letting them see the cake), smooth-scroll to the email capture section.  
**Files:** `src/pages/SharedCake.tsx`

### 3. Gallery: Bulk download selected cakes
**Current:** Users can only download one cake at a time via the share menu.  
**Improvement:** Add a multi-select mode and a "Download all selected" button that triggers sequential downloads. Already have the download logic — just needs a selection UI.  
**Files:** `src/pages/Gallery.tsx`

### 4. Auth: Social login buttons (Google)
**Current:** Auth page has email/password and magic link, but Google OAuth isn't surfaced prominently.  
**Improvement:** Add a prominent "Continue with Google" button above the email form. Supabase already supports it; it just needs the button + `supabase.auth.signInWithOAuth({ provider: 'google' })`.  
**Files:** `src/pages/Auth.tsx`

### 5. Admin: Real-time watchdog alert display
**Current:** The watchdog sends emails but the Admin page has no alert panel.  
**Improvement:** Add an "Alerts" tab to Admin that queries the last 10 `cake_generation_watchdog_runs` (if such a table exists) or shows recent jobs stuck in `in_progress`.  
**Files:** `src/pages/Admin.tsx`

---

## Medium Impact (1–3 days each)

### 6. CakeCreator: Cake style gallery / inspiration picker
**Current:** Users type free-form descriptions. Many don't know what styles are available.  
**Improvement:** Add an "Inspiration" panel with 12–16 preset style thumbnails (generated and curated). Clicking one pre-fills the style input. Dramatically improves first-generation quality for new users.  
**Files:** `src/components/CakeCreator.tsx` + new `src/data/cakeStylePresets.ts`

### 7. Party Planner: In-app RSVP tracker table
**Current:** RSVP responses are stored but only viewable via the public party page or raw Supabase data.  
**Improvement:** Add an RSVP dashboard tab in `PartyPlannerDetail.tsx` showing respondent list, headcount, dietary notes, sortable by response date.  
**Files:** `src/pages/PartyPlannerDetail.tsx`

### 8. CakeCreator: Photo-to-cake style extraction
**Current:** `analyze-cake-photo` edge function exists but is only used to suggest a style string. The user still has to read the suggestion and type it.  
**Improvement:** When a photo is uploaded, auto-populate the style, colour, and theme fields from the AI analysis. One click should pre-fill everything.  
**Files:** `src/components/CakeCreator.tsx`, `supabase/functions/analyze-cake-photo/index.ts`

### 9. Gallery: AI-generated captions for sharing
**Current:** When sharing to WhatsApp/Instagram, users share just the image URL.  
**Improvement:** Generate a short caption ("Here's the cake I designed for Sarah's 5th birthday! 🎂") automatically and copy it to the clipboard alongside the link.  
**Files:** `src/pages/Gallery.tsx`

### 10. Party Pack: PDF export
**Current:** Party pack assets (invites, banners, toppers) are individual PNGs.  
**Improvement:** Add "Export as PDF" that compiles all assets into a single print-ready PDF using a client-side library (e.g., jsPDF + html2canvas). Premium-only feature.  
**Files:** `src/components/PartyPackGenerator.tsx`

---

## High Impact (> 3 days each)

### 11. Occasion reminder engine: front-end experience
**Current:** `send-anniversary-reminders` runs server-side, but there's no in-app way for users to see or manage their saved occasions.  
**Improvement:** Add an "Occasions" page (`/occasions`) listing all saved events with countdown timers. Users can add, edit, and delete. Pre-generate a cake design 7 days before each occasion.  
**Estimated effort:** 2 days. High conversion driver — keeps users returning.

### 12. Multi-language support (i18n)
**Current:** All UI is English.  
**Improvement:** Add Hindi and Spanish as priority languages (large user bases for Indian and LatAm markets). Use `react-i18next`. Start with CakeCreator and pricing pages only.  
**Estimated effort:** 3–4 days for infrastructure + first two languages.

### 13. Collaborative cake design (shared editing link)
**Current:** SharedCake is read-only. Recipients can view but not iterate.  
**Improvement:** Allow the cake creator to generate a "co-design" link that lets the recipient suggest changes (add a note, change a colour). The creator gets a notification and can accept/reject.  
**Estimated effort:** 4–5 days. Strong sharing/virality mechanic.

### 14. Push notifications for generation complete
**Current:** Users must keep the tab open while generation runs (~30s).  
**Improvement:** Use Web Push API (service worker) to send a browser notification when generation completes. Users can close the tab and come back.  
**Estimated effort:** 2 days. High retention impact.

### 15. Subscription pause / downgrade flow
**Current:** Cancellation happens via Razorpay subscription cancel; there's no pause option.  
**Improvement:** Add "Pause for 1 month" which suspends billing without losing premium access for that month. Reduces cancellation-intent churn.  
**Estimated effort:** 2–3 days (Razorpay supports pause natively).

---

## Technical Debt Worth Addressing

| Area | Issue | Suggested Fix |
|------|-------|---------------|
| `CakeCreator.tsx` (3515 lines) | Monolithic component; hard to reason about | Extract view-generation, polling, audio, and share logic into separate hooks |
| `PartyPlannerDetail.tsx` (1942 lines) | Same — oversized | Extract `usePartyTasks`, `useRSVP`, `useVendors` hooks |
| Generation polling | `setInterval` polling every 3s forever | Switch to Supabase Realtime channel on `cake_generation_jobs` for zero-polling updates |
| `check-payment-status` | Hardcoded fallback Razorpay key ID | Move to `RAZORPAY_KEY_ID` env var |
| No e2e tests | Critical flows (auth → generate → download) have no automated coverage | Add Playwright tests for the golden path |

---

## Priority Matrix

| Item | User Impact | Effort | Priority |
|------|-------------|--------|----------|
| Inspiration gallery (#6) | High | Medium | **P1** |
| Push notifications (#14) | High | Low | **P1** |
| Occasions page (#11) | High | Medium | **P1** |
| Bulk download (#3) | Medium | Low | **P2** |
| Social login (#4) | Medium | Low | **P2** |
| RSVP tracker (#7) | Medium | Medium | **P2** |
| Photo auto-fill (#8) | Medium | Low | **P2** |
| PDF export (#10) | Medium | Medium | **P3** |
| Multi-language (#12) | High | High | **P3** |
| Co-design link (#13) | High | High | **P3** |

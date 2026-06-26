## Goal
Make the logged-in user path obvious and reliable: users should land where they can create a cake, see post-generation actions on one screen, add a voice message without first manually saving to gallery, and share a working animated/music/voice link.

## What I found
- `/india` is an SEO landing page, not the creation tool. After desktop login, users can land there and only see “See Plans”, so the create flow feels hidden.
- The current voice flow depends on `savedCakeImageId`, so users must first click “Save to Gallery” before the voice recorder and magic share link appear.
- The RLS error in your screenshot happens at “Saving to cake” while updating `generated_images`, not at microphone recording. The safest fix is to make ownership explicit and also move voice/share to the same auto-save flow.
- For animated/music/share links, yes: the generated images need to be persisted somewhere. A share URL cannot safely point to browser-only temporary image URLs. Best practice is to auto-save a share bundle when the cake is generated, while keeping “Save to Gallery” as a separate user-facing gallery action if desired.

## Plan

### 1. Fix login destination and India CTA
- Change post-login redirect to send users to `/free-ai-cake-designer?welcome=true` instead of the country landing page when the profile is complete.
- On `/india`, replace the primary hero CTA with “Create Free Cake” linking directly to `/free-ai-cake-designer?ref=india`.
- Keep a secondary “See Plans” CTA so pricing still remains reachable, but creation becomes the main action.

### 2. Auto-create the share bundle after generation
- After at least one real generated cake view exists, automatically save the generated cake views needed for sharing.
- Use the existing `share_group_id` behavior so one share link can include all generated views for the reveal animation.
- Keep this separate from “Gallery” language in the UI: internally it persists the share bundle, but the user should experience it as “Preparing your share link”.

### 3. Make voice available immediately after cakes are created
- Move “Add voice message” into the main post-generation action area and show it as soon as the share bundle is ready.
- If the user taps voice before the auto-save finishes, show a short “Preparing your share link…” state instead of forcing “Save to Gallery first”.
- Remove the current teaser that says users must save to gallery first.

### 4. Fix the RLS voice-save failure properly
- Add/adjust backend access rules for `generated_images` so authenticated owners can update audio fields on their own generated cake rows.
- Keep it scoped to ownership only; no public write access.
- Keep the client-side `.eq("user_id", userId)` guard, but also verify the target cake row belongs to the current user before update.

### 5. Improve one-screen post-generation UX
- Convert the post-generation area from several stacked cards into one compact action panel:
  - Copy magic link
  - WhatsApp share
  - Add/Re-record voice
  - Download
  - Save to gallery / View gallery
- Keep party-pack and party-planner upsells below the main share actions so they don’t push the primary workflow out of view.
- Ensure the dialog has an accessible title to remove the console warning.

### 6. Validate
- Check the logged-in redirect path.
- Check desktop/mobile post-generation layout.
- Verify voice upload reaches the audio update step without the RLS error.
- Verify the copied `/cake/{id}` link still loads the animation/music/voice flow.

## Recommendation on “mandatory save”
It is mandatory to persist the images for a durable share link, but it should not require a manual “Save to Gallery” click. The best practice here is: auto-save a private share bundle immediately after generation, then let the user optionally save/feature/manage in Gallery later.
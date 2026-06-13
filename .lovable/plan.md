## The bug

The animated share link (`/cake/:id`) — the page that plays the staged 3-image reveal + birthday jingle on the receiver's side — still works fine. The SharedCake route, animation, candles, jingle and OG meta are all intact.

What's actually broken is **discoverability**: the only button in the UI that copies the magic `/cake/:id` link is hidden inside the "Voice message" panel and is gated on `audioUrl` being present (CakeCreator.tsx line ~2860, label *"Copy share link with voice message"*). If the sender doesn't record a voice note, that button never renders, so there's no way to copy/share the animated link.

All other "Share" buttons on the result screen (Facebook, X, WhatsApp, Instagram, the Web Share API in `handleShare`, and `SuccessCelebration` → `onShare`) share the **downloaded JPG composite**, not the `/cake/:id` URL. So from the sender's perspective the magic-link feature has effectively disappeared.

## Fix

Add a prominent, always-visible "Magic Link" block in `CakeCreator.tsx`, shown as soon as `savedCakeImageId` exists (independent of voice message). It will be placed right above the existing "Share Your Cake Card 🎉" social row, so it's the first share affordance the sender sees.

### Block contents

```text
┌───────────────────────────────────────────────────────┐
│ ✨ Magic share link                                   │
│ Recipients see an animated reveal + birthday song     │
│                                                       │
│ https://cakeaiartist.com/cake/<id>      [ Copy ]      │
│                                                       │
│ [ 📱 WhatsApp ]  [ 🔗 Share… ]  [ 👁 Preview ]        │
│                                                       │
│ 💡 Tip: Record a voice message above and it plays    │
│    inside the link too.                               │
└───────────────────────────────────────────────────────┘
```

- **Copy** — `navigator.clipboard.writeText(url)` + toast (same pattern as the existing voice-link button).
- **WhatsApp** — opens `https://wa.me/?text=<encoded message + url>`.
- **Share…** — uses `navigator.share({ title, text, url })` when available, otherwise falls back to copy.
- **Preview** — opens `/cake/<id>` in a new tab so the sender can verify the reveal/jingle themselves.

### Secondary touch-ups

1. Rename the existing in-voice-panel button from *"Copy share link with voice message"* to *"Copy link (includes voice message)"* so it's clearly the same link, just enriched.
2. In `SuccessCelebration`, change the primary **"Share Your Creation"** button so that when a `savedCakeImageId` is available the parent passes a handler that shares the `/cake/:id` URL via the Web Share API (falling back to copy), instead of running the image-file `handleShare` flow. The image-file social buttons stay where they are on the result screen for users who want a static image post.

### Out of scope

- No backend / RLS / RPC changes (the `get_public_cake` RPC + SharedCake page already work).
- No changes to the reveal animation, jingle, or `BirthdayJingle` utility.
- No changes to the cake-generation pipeline or the watchdog/monitoring system from the previous turn.

## Verification

1. Generate a cake → save → confirm the new "Magic share link" block appears immediately (no voice recording needed).
2. Click Copy → paste into a new tab → confirm the SharedCake page loads with the 3-image reveal and the jingle starts on first click.
3. Repeat with a voice message recorded → confirm the same link now also plays the voice note.
4. On mobile, confirm the WhatsApp button opens WhatsApp with the URL prefilled and the Web Share sheet appears on "Share…".

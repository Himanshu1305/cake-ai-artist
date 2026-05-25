# Combined fix plan — reveal + audio + jingle + candles + share-page copy

All changes batched into one build so nothing reoccurs.

## 1. Slower reveal + Replay button (`CakeConvergeReveal.tsx`, `SharedCake.tsx`)

- Stretch reveal timings: fan-in ~2.0s, hold fanned ~2.0s, converge ~1.2s, final ~0.8s (total ~6–6.5s vs current 4.4s).
- Keep existing "Skip →" button.
- Add a **🔄 Replay** button on `SharedCake.tsx` next to the cake. On click: clear the `sessionStorage` "seen" flag, bump a React `key` to remount `CakeConvergeReveal`, restart from phase 0.

## 2. Fix voice playback (no sound) (`SharedCake.tsx`, `AudioRecorder.tsx`)

- Wrap `audio.play()` in `.catch()` and surface a toast/inline error when autoplay or decode fails.
- Replace `display:none` audio element with a visible `<audio controls>` fallback (sr-only wrapper hidden visually but interactive), so iOS users always have a working native control as backup.
- On `MediaRecorder.stop()`, call `recorder.requestData()` first to flush the final chunk (prevents 0-byte / unplayable files on some browsers).
- Recorder MIME priority already favors `audio/mp4` (m4a/AAC) — keep, but also store `audio_mime_type` so the share page can set `<source type=...>` explicitly for Safari decoding.

## 3. Birthday jingle background music (`SharedCake.tsx`, new asset)

- Add a short royalty-free instrumental loop at `src/assets/jingle/birthday-jingle.mp3` (~15–25s, soft).
- Start playback on first user interaction (tap anywhere / Replay / Blow candles) to bypass autoplay rules.
- Behavior:
  - If a voice message exists → jingle plays at low volume; pauses when voice plays; resumes (low vol) on voice `pause`/`ended`.
  - If no voice message → jingle plays once (no loop) and stops.
- Add a small **🔊/🔇 mute** toggle in the corner. Always stop on unmount.

## 4. Actually extinguish candles on "Blow out candles" (`CandleRow.tsx`, `AnimatedFlame.tsx`)

- Add `blown?: boolean` prop to `CandleRow` and `AnimatedFlame`.
- When `blown` is true: hide the flame + halo; render a CSS-only rising smoke wisp (translucent gray, scale up + drift up + fade) above each candle stick. Slightly desaturate sticks.
- In `SharedCake.tsx`, when `handleBlowCandles` fires, pass `blown={candlesBlown}` to the visible `CandleRow`. State already exists.

## 5. Share page copy fixes (`SharedCake.tsx`)

**a) Generic bottom CTA**
- Replace occasion-aware "🎂 Make a Birthday cake for someone →" with a single generic line for both desktop and sticky mobile CTAs:
  - **"🎂 Make a cake for someone you love →"**
- `ctaHref` → `/free-ai-cake-designer?ref=shared_cake` (drop `occasion=` param). Remove unused `occasionLabel` / `ctaText` branching.

**b) Personalize the top kicker chip with sender's name**
- `cake.sender_name` already comes from the `get_public_cake` RPC.
- If non-empty: chip reads **"{sender_name} made this just for you 💝"** (e.g. "Priya made this just for you 💝").
- Fallback when missing: keep existing **"Someone special made this for you"**.
- Styling, icon, layout unchanged.

## Out of scope

- No backend / RPC / migration changes.
- No changes to generation, default-selection, or save logic (those landed in the previous build).

## Files touched

- `src/pages/SharedCake.tsx`
- `src/components/CakeConvergeReveal.tsx`
- `src/components/AudioRecorder.tsx`
- `src/components/CandleRow.tsx`
- `src/components/AnimatedFlame.tsx`
- New: `src/assets/jingle/birthday-jingle.mp3`

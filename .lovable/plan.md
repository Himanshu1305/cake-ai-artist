## Root causes

**Issue 2 — Only the front view animates.** When a recipient opens the same share link twice in the same browser session, two sessionStorage caches kick in and skip the reveal:

- `src/pages/SharedCake.tsx` line 81–86: `sessionStorage.getItem('reveal_seen_${id}')` jumps the outer stage straight to 4.
- `src/components/CakeConvergeReveal.tsx` line 49–50 + 76–80: `sessionStorage.getItem('cake_reveal_seen_${cake.id}_${revealKey}')` jumps the inner reveal straight to the final image — which is the primary/front view.

Combined, the second open shows only the primary image. The DB row is healthy (3 distinct sibling URLs, all 200 OK), so the data is not the problem. Replay was supposed to clear these but `Replay` is only fired manually.

Also, current sequence order is `[other1, other2, primary]`, so primary (front) appears last. If the message/confetti at stages 3–4 pull the user's attention down before primary renders, they perceive only the front view animating.

**Issue 1 — Chrome opens to a blank/black screen.** The stage‑0 overlay (`bg-gradient-to-br from-gray-900 to-black`, z‑50) is gated on `revealStage === 0` and is only dismissed when the staged reveal effect (line 79) runs and bumps the stage. Two ways it can get stuck on Chrome:

1. The reveal effect schedules `setTimeout(..., 300/700/6800/7400)` only after `cake` is set. If the `get_public_cake` RPC fails on Chrome (extension/cookie blocking, or transient network), `cake` stays null AND `notFound` may stay false (errors swallowed) — the loading spinner branch returns. But once `cake` loads, if any one `setTimeout` is dropped by Chrome (throttling, GC of background tab) the overlay never exits.
2. There is no hard fail‑safe: the overlay has no maximum lifetime. If anything in the chain fails, the screen stays black forever.

## Fix plan (one focused batch)

### A. Always play the full reveal, primary first

`src/components/CakeConvergeReveal.tsx`:

1. Remove the `cake_reveal_seen_*` sessionStorage skip entirely. The reveal is short (~6 s) and is the whole emotional payoff of the shared link — it should play every time the recipient lands on the page. Replays via the button continue to work without the cache‑bump dance.
2. Change the sequence order so the primary (sender‑selected) view is shown **first**, then the other angles: `sequence = [primary, ...others]` (deduped, capped at 3). This guarantees the recipient sees the sender's chosen view even if they look away later.
3. Keep the 2.5 s preload safety, but also lower per‑image hold from 2600 ms → 2000 ms so the full sequence finishes inside the existing 6800 ms stage‑3 budget.

### B. Always advance the outer stage; never trap on black

`src/pages/SharedCake.tsx`:

4. Remove the `reveal_seen_${id}` sessionStorage skip on the outer stage as well — the staged kicker/card animation is part of the experience and is only ~700 ms before content is visible. (It is, however, the thing currently making the overlay vanish on a second open — once we delete the skip, the timers always run.)
5. Add a hard safety: if `revealStage` is still `0` 1500 ms after `cake` loads, force it to `1`. Implemented as a single extra `setTimeout` inside the existing reveal effect. Guarantees no Chrome user is stuck on the black overlay.
6. Surface RPC errors instead of swallowing them: in the load effect (line 56–68), if `error` is set, log it and set `notFound = true` so the user sees the "Cake not found" fallback rather than an infinite loading spinner.
7. As an additional Chrome‑friendliness fix, add `visibilitychange` handling: when the tab becomes visible after being hidden, if `revealStage === 0`, jump to `1` (covers the case where Chrome throttled the original 300 ms timer in a background tab).

### C. Verification

After deploying:
- Open the same `/cake/<id>` link in a brand‑new Chrome tab → confirm the black overlay disappears and the cake card animates in. Re‑open the link in the same session → confirm the 3‑view reveal still plays each time, starting with the primary.
- Open in Firefox/Safari → same behavior, no regressions.
- Hit the in‑page Replay button → confirm the reveal restarts cleanly.
- Force the RPC to fail (DevTools offline) → confirm "Cake not found" instead of stuck loader.

### Files touched

- `src/components/CakeConvergeReveal.tsx` — drop skip cache, reorder sequence, tune timing.
- `src/pages/SharedCake.tsx` — drop outer skip cache, add overlay safety timer + visibility fallback, surface RPC errors.

No backend, schema, or edge‑function changes needed.
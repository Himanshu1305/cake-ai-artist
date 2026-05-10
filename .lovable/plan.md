I found the actual issue: the backend did generate and save all 3 views quickly. The latest job completed with all 3 image URLs in about 9 seconds after the hero response. The problem is in the frontend race handling: background updates can arrive before the React image grid is fully initialized, so the UI can incorrectly decide the missing slots need regeneration and then stop polling.

Plan:

1. Fix the frontend race in `CakeCreator.tsx`
   - Initialize the hero + placeholder grid before subscribing to background updates.
   - Change the background row merge logic so it always writes incoming `side_url` and `top_url` into a stable local `latestImages` array, even if React state has not committed yet.
   - Re-render the grid from `latestImages` instead of relying on the previous `generatedImages` length.

2. Stop false “needs retry” messages
   - Do not show “2 views need a retry” just because a terminal status arrived before the UI merged the URLs.
   - Only mark a slot failed when the backend has a real `side_error` / `top_error`, or when the 4-minute watchdog expires.
   - If status is `completed` but the UI has not merged all URLs yet, immediately fetch the job row once more and keep polling instead of stopping.

3. Make missed realtime updates harmless
   - Add an immediate job-row fetch right after subscription starts.
   - Reduce the fallback polling delay from 15 seconds to a shorter interval so completed views appear quickly even if realtime misses an event.
   - Cleanup polling only after all expected image slots are actually filled, or a real failure is confirmed.

4. Keep backend generation unchanged
   - No database migration needed.
   - No API/cost changes.
   - The deployed backend logs already show all 3 HQ views are being generated and stored; the fix is to make the UI reliably pick them up.

Verification after implementation:
- Generate a High Quality cake.
- Confirm hero appears first.
- Confirm side/top appear automatically without clicking Regenerate.
- Confirm no “needs retry” message appears while generation is still in progress.
- Confirm final “All 3 views ready” appears only after all 3 image slots are filled.

<lov-actions>
<lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>
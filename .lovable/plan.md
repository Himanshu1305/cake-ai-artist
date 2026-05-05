I found why High Quality is still timing out:

1. The app is still asking the backend to create all High Quality views in one request.
2. Each view can take up to 60s primary + 60s fallback in the backend.
3. The frontend timeout is 150s, but if the backend has 3 views and any fallback path is slow, the request can exceed that. The frontend then gives up and shows the red timeout toast before any result can be displayed.
4. Also, the current High Quality fallback uses the slowest model. That can make the problem worse during a full 3-image generation.

Plan to fix it properly:

1. Make High Quality generate fewer images initially
   - For High Quality, generate only the most important first view in the initial request.
   - For decorated cakes: generate the Front view first.
   - For sculpted cakes: generate the Main view first.
   - This makes High Quality much more likely to complete instead of timing out.

2. Keep Standard mode unchanged
   - Standard will continue creating all views in parallel, targeting around 30 seconds.
   - No change to the Standard path that is now working.

3. Add a clear High Quality follow-up flow
   - After the first High Quality image is created, show it immediately.
   - Keep the existing regenerate/specific-view flow so the user can create the missing Side/Top views one by one.
   - Update the success/partial message so it does not feel like a failure when High Quality intentionally returns one premium image first.

4. Adjust High Quality backend fallback
   - Use the fast pro-level image model for the initial High Quality generation.
   - Avoid using the slowest premium model as automatic fallback during the initial full generation path.
   - Reserve the slower premium model only for manual single-view regeneration if needed.

5. Fix frontend timeout/error wording
   - Increase or align the High Quality client wait budget for single-view generation.
   - Replace the generic red toast wording with clearer wording, for example: “High Quality is taking longer than usual. Standard is faster, or try generating this view again.”

6. Deploy and verify
   - Redeploy the `generate-complete-cake` backend function.
   - Test High Quality from the preview to confirm it returns at least the first premium image instead of timing out.
   - Confirm Standard still returns all views quickly.

Files to update:
- `supabase/functions/generate-complete-cake/index.ts`
- `src/components/CakeCreator.tsx`

No database changes are needed.
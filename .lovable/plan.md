## Make Message Options toggle clearly show both choices

**Problem:** The current control is a single `Switch` with a small dynamic label that flips between "AI Generated" and "Custom". Users can't see both options exist — it looks like a generic on/off toggle, and the inactive choice is invisible.

**Fix:** Replace the switch with a segmented 2-button pill that always shows **both** "✨ AI Generated" and "✍️ Custom" side-by-side, with the active one highlighted in the party-purple/pink gradient and the inactive one muted-but-readable. This is a common, instantly-understood pattern (think iOS-style segmented control).

### Scope (frontend only)

**File: `src/components/CakeCreator.tsx`** — lines ~1983–1998

Replace the `flex items-center justify-between` header containing the `<Switch>` with:
- Keep the "Message Options" label on the left (or move it above on narrow widths).
- On the right, render a segmented control: a rounded container with two buttons:
  - **AI Generated** — `setUseCustomMessage(false)`, active when `!useCustomMessage`
  - **Custom** — `setUseCustomMessage(true)`, active when `useCustomMessage`
- Active state: solid gradient background (party-purple → party-pink), white text, soft shadow.
- Inactive state: transparent bg, foreground text, hover lightens.
- Both buttons disabled while `isLoading`.
- Uses semantic tokens (`bg-primary`, `text-primary-foreground`, `border-border`) — no raw colors.
- Mobile (<640px): segmented control wraps below the label so neither truncates.

No state shape changes — `useCustomMessage` boolean stays the same; only the input UI changes.

### Out of scope
- The body content below the toggle (Textarea / "AI Magic Activated!" callout) stays as-is.
- No backend, no copy changes elsewhere.
- The two unrelated console errors (AdSense `availableWidth=0`, Firefox extension `features` undefined) are not caused by app code.

### Verification
- Both "AI Generated" and "Custom" labels are visible at all times on the same row.
- Clicking either switches the body content (textarea ↔ AI magic callout) instantly.
- Active option is visually distinct (filled gradient + white text); inactive is clearly clickable.
- Works at 946px viewport and at <640px (label + segmented control don't overlap).
- Disabled appearance applies during generation.

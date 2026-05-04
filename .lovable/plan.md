## Why these are missing

Both features were planned in the previous turn but never wired into `PartyPlannerDetail.tsx`:
- The expanded theme list and `THEME_STYLES` were added to `src/components/InvitePreview.tsx`, but `TRENDING_THEMES` in the page still has only the original 17 themes.
- There's no `partyTitle` state, no "Party Name" input, no 5th tab, and `InvitePreview` is never imported or rendered.

## Changes

### 1. `src/pages/PartyPlannerDetail.tsx`

**Imports**
- Add `Textarea` from `@/components/ui/textarea`.
- Add `import { InvitePreview } from "@/components/InvitePreview";`.
- Add `Eye` icon (or reuse `Mail`) for the Invite tab.

**Theme list** — replace `TRENDING_THEMES` with the expanded list that matches keys in `THEME_STYLES` (Space / Astronaut, Iron Man / Avengers, Star Wars, Frozen / Elsa, Peppa Pig, Paw Patrol, Dinosaur / Jurassic, Mermaid / Under the Sea, Construction / Trucks, Jungle Safari, Pokemon, Minecraft, Princess / Royal, Garden Tea Party, Carnival / Circus, Wonder Woman, Hot Wheels, plus the existing ones), keeping `Custom` last.

**State**
```ts
const [partyTitle, setPartyTitle] = useState("");
const [inviteHeadline, setInviteHeadline] = useState("");
const [inviteMessage, setInviteMessage] = useState("");
const [savingInvite, setSavingInvite] = useState(false);
```
Hydrate in `loadAll`: `setPartyTitle(p.title || "")`, `setInviteHeadline((p as any).invite_headline || "")`, `setInviteMessage((p as any).invite_message || "")`.

**Party Name input** — add as the first field inside the Event Details card (above the Date row):
```tsx
<div className="space-y-2">
  <Label>Party Name</Label>
  <Input value={partyTitle} onChange={(e) => setPartyTitle(e.target.value)} placeholder="e.g. Aarav's 5th Birthday" />
</div>
```
Update `saveDetails` payload with `title: partyTitle.trim() || party.title` and guard against empty.

**Tabs** — change `grid-cols-4` to `grid-cols-5` and add:
```tsx
<TabsTrigger value="invite">🎟️ Invite</TabsTrigger>
```

**New TabsContent `value="invite"`** — two-column on desktop:
- Left: editable fields
  - `Custom invite headline` Input (placeholder = `You're invited to {party.title}`)
  - `Personal note` Textarea
  - `Save invite` button (calls `saveInvite` → updates `parties` with `invite_headline`, `invite_message`, then `loadAll`)
- Right: live preview
```tsx
<InvitePreview
  party={{ ...party, title: partyTitle || party.title, theme: themePick === "Custom" ? customTheme : themePick }}
  hostName="You"
  guestName="Guest"
  headline={inviteHeadline}
  message={inviteMessage}
/>
```

### 2. `supabase/functions/send-party-invite/index.ts`
Update the email template to use `party.invite_headline` and `party.invite_message` when present, and to apply the theme gradient/emoji from a small inline `THEME_STYLES` map (same keys as the component) so the email matches the in-app preview. Fall back to current pink/purple defaults when theme is unknown.

### Out of scope
- Editing the title from the header `<h1>` directly — it will reflect after save via `loadAll`.
- Image/cake attachment toggle in the preview (deferred — keep the optional `cakeImageUrl` prop unused for v1).

## Files touched
- `src/pages/PartyPlannerDetail.tsx` (edit)
- `supabase/functions/send-party-invite/index.ts` (edit, themed email)

# Global Reach — Simple Version

## 1. Banner update

In `src/components/UrgencyBanner.tsx`, append "🌍 Loved in 30+ countries" to the existing copy.

- Hardcoded "30+" string (evergreen, no data fetch).
- Desktop: `#1 AI Cake Generator — design birthday, wedding & anniversary cakes · Free · 🌍 Loved in 30+ countries`
- Mobile: `#1 AI Cake Generator · Free · 🌍 30+ countries`

That's it for the banner. No DB, no fetch.

## 2. World map widget on homepage

New component `src/components/GlobalReachWidget.tsx`, mounted in `src/pages/Index.tsx` between hero and pricing.

- Lightweight inline SVG world map (no new dependency).
- Top countries shaded in `party-pink` gradient by intensity.
- Below map: 5–6 country chips with flag + % (e.g. 🇺🇸 USA 44% · 🇨🇦 Canada 12% · 🇬🇧 UK 9% · 🇩🇪 Germany 8% · 🇦🇺 Australia 6% · 🌍 Others 21%).
- Reads percentages from `site_settings` key `country_stats` (single row).
- If row missing or `enabled = false` → widget hidden.
- No raw user counts ever shown.

## 3. Admin tab — manual control

New section in `src/pages/Admin.tsx`: **"Global Reach Stats"**.

- Shows the same `page_visits` country breakdown the admin already sees (live data, % only).
- A simple editable table: `Country code | % shown on site` — admin can tweak numbers (e.g. boost US visibility) before approving.
- "Enabled on homepage" toggle.
- "Save & publish" button → writes to `site_settings.country_stats`:
  ```json
  { "enabled": true, "top": [{"code":"US","name":"USA","flag":"🇺🇸","pct":44}, ...], "others_pct": 21 }
  ```
- Homepage widget reads this same row → updates instantly after admin saves.

No cron, no edge function, no pending/published split. Admin manually reviews + publishes whenever they want.

## Technical notes

Files touched:
- `src/components/UrgencyBanner.tsx` — append country string.
- `src/components/GlobalReachWidget.tsx` — new (SVG map + chips, reads `site_settings`).
- `src/pages/Index.tsx` — mount widget.
- `src/pages/Admin.tsx` — new admin section (live country breakdown + editable % table + save button).

DB: no schema changes. One new row in existing `site_settings` table (`key = 'country_stats'`). Existing RLS already allows admins to write and everyone to read.
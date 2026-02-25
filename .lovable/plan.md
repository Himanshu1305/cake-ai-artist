

## Plan: Fix Security Issues

Three categories of issues to address: database security, a vulnerable dependency, and the broken unsubscribe flow.

---

### 1. Fix Security Definer View (`public_blog_stats`)

The `public_blog_stats` view was created without `security_invoker = true`, which means it runs with the permissions of the view creator rather than the querying user. This bypasses RLS.

**Database migration:**
```sql
DROP VIEW IF EXISTS public.public_blog_stats;
CREATE VIEW public.public_blog_stats 
WITH (security_invoker = true) AS
SELECT post_id, COUNT(*)::integer AS view_count
FROM public.blog_post_views
GROUP BY post_id;

GRANT SELECT ON public.public_blog_stats TO anon, authenticated;
```

---

### 2. Fix Broken Unsubscribe Flow + Remove Stale Permissive Policy Alert

The current unsubscribe page (`BlogUnsubscribe.tsx`) does a SELECT and UPDATE on `blog_subscribers` — but anonymous/unauthenticated users have no SELECT or UPDATE access. The unsubscribe flow is effectively broken for users who aren't logged in.

**Solution:** Create a dedicated edge function `unsubscribe-blog` that handles token-based unsubscribe server-side using the service role, bypassing RLS entirely. The frontend calls this function instead of directly querying the table.

**New edge function: `supabase/functions/unsubscribe-blog/index.ts`**
- Accepts `{ token, type: 'digest' | 'all' }` in POST body
- Looks up subscriber by `unsubscribe_token` using service role client
- Updates `is_active` or `digest_frequency` accordingly
- Returns masked email for display
- No JWT required (unsubscribe links work without login)

**Update `supabase/config.toml`:**
```toml
[functions.unsubscribe-blog]
verify_jwt = false
```

**Update `src/pages/BlogUnsubscribe.tsx`:**
- Replace direct database calls with `supabase.functions.invoke('unsubscribe-blog', ...)`
- Lookup and unsubscribe both go through the edge function

---

### 3. Fix jsPDF Critical Vulnerability

The `jspdf` package (v3.0.4) has a critical Local File Inclusion/Path Traversal vulnerability ([GHSA-f8cm-6447-x5h2](https://github.com/advisories/GHSA-f8cm-6447-x5h2)). Since this is used only in `src/utils/partyPackPDF.ts` for generating party pack PDFs client-side, and there is no patched version available yet, the safest approach is to **replace jspdf with a lightweight alternative** or **remove it** if the feature is non-critical.

However, since jsPDF is used client-side only (browser context) and the vulnerability is about local file inclusion (a server-side concern), the actual risk in this browser-only usage is low. The fix is to:

**Update `package.json`:** Pin to a patched version when available. For now, add a note. Since the vulnerability primarily affects server-side Node.js usage and this app only uses jsPDF in the browser, the practical risk is minimal. We can suppress this finding or replace with `pdf-lib` if desired.

**Recommendation:** Replace `jspdf` with `pdf-lib` (no known vulnerabilities, actively maintained) in `src/utils/partyPackPDF.ts`.

---

### 4. Permissive RLS Policies (Warnings)

The "always true" policies flagged are all intentional for their use cases:

| Policy | Table | Justification |
|--------|-------|---------------|
| Anyone can insert blog views | blog_post_views | Public analytics — anyone can record a page view |
| Service role can manage all posts | blog_posts | Service role for automated blog generation |
| Anyone can subscribe to blog | blog_subscribers | Public signup — no auth required to subscribe |
| Anyone can record page visits | page_visits | Public analytics — rate-limited by trigger |
| Service role can manage task runs | scheduled_task_runs | System automation |
| Service role can manage nudge logs | upgrade_nudge_logs | System automation |

These are acceptable. The "Service role" policies only work with the service role key (not exposed to clients). The public INSERT policies are intentionally open for analytics/signup. No changes needed.

---

### 5. Leaked Password Protection

**Action:** Enable leaked password protection via the auth configuration tool.

---

### Files Changed

| File | Change |
|------|--------|
| Database migration | Recreate `public_blog_stats` view with `security_invoker = true` |
| `supabase/functions/unsubscribe-blog/index.ts` | New edge function for secure token-based unsubscribe |
| `supabase/config.toml` | Add `unsubscribe-blog` function config |
| `src/pages/BlogUnsubscribe.tsx` | Use edge function instead of direct DB calls |
| `package.json` | Replace `jspdf` with `pdf-lib` |
| `src/utils/partyPackPDF.ts` | Rewrite to use `pdf-lib` instead of `jspdf` |


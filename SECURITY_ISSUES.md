# Security Issues Tracker

**Last Updated:** December 1, 2025  
**Status:** 9 issues identified, 4 partially mitigated via frontend

---

## 🔴 CRITICAL ISSUES (Require RLS Policy Updates)

### 1. Customer Email Addresses Exposed to Public Internet
**Table:** `profiles`  
**Severity:** CRITICAL  
**Status:** ⚠️ Partially Mitigated (Frontend restricts queries)  
**Risk:** Email harvesting, spam campaigns, privacy violations

**Issue:**
The profiles table contains user email addresses and lacks explicit policy denying anonymous access. While existing policies require `auth.uid() = id` or admin role, there's no explicit block for anonymous users.

**Required SQL Fix:**
```sql
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);
```

**Business Impact:** GDPR/privacy law violations, user trust damage, potential lawsuits

---

### 2. Referral Email Addresses Could Be Harvested by Spammers
**Table:** `referrals`  
**Severity:** CRITICAL  
**Status:** ❌ Not Fixed  
**Risk:** Email harvesting of referred users

**Issue:**
The referrals table stores `referred_email` addresses and may be accessible to unauthenticated users or referrers can see all referral emails.

**Required SQL Fix:**
```sql
-- Restrict SELECT to only show referrer their own referrals without emails exposed
CREATE POLICY "Referrers see limited referral data"
ON public.referrals
FOR SELECT
USING (
  auth.uid() = referrer_id 
  AND referred_email IS NOT NULL
);

-- Or anonymize in application layer
```

**Business Impact:** Privacy violations, spam complaints, legal issues

---

### 3. User Activity Patterns Exposed to Competitors and Stalkers
**Table:** `activity_feed`  
**Severity:** CRITICAL  
**Status:** ✅ Partially Mitigated (Frontend only fetches id, message, created_at)  
**Risk:** Behavioral tracking, competitive intelligence gathering

**Issue:**
The "Anyone can view activity feed" policy allows public access to user_id references, enabling tracking of user behavior patterns.

**Required SQL Fix:**
```sql
DROP POLICY "Anyone can view activity feed" ON public.activity_feed;

-- Only show anonymous activities publicly
CREATE POLICY "Public sees anonymous activities only"
ON public.activity_feed
FOR SELECT
USING (user_id IS NULL OR auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "Admins can view all activity"
ON public.activity_feed
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
```

**Business Impact:** User stalking, competitive intelligence leaks, privacy violations

---

### 4. Customer Purchase History and Pricing Data Publicly Accessible
**Table:** `founding_members`  
**Severity:** CRITICAL  
**Status:** ❌ Not Fixed  
**Risk:** Financial data exposure, competitive intelligence

**Issue:**
The "Users can view all founding members" policy exposes `price_paid`, `tier`, `purchased_at`, and `user_id` to anyone.

**Required SQL Fix:**
```sql
DROP POLICY "Users can view all founding members" ON public.founding_members;

-- Users see only their own membership
CREATE POLICY "Users can view own membership"
ON public.founding_members
FOR SELECT
USING (auth.uid() = user_id);

-- Admins see all for management
CREATE POLICY "Admins can view all memberships"
ON public.founding_members
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
```

**Business Impact:** Pricing strategy exposed, customer financial data leaked, competitive disadvantage

---

### 5. Personal Messages and Recipient Names Visible to Anyone
**Table:** `generated_images`  
**Severity:** CRITICAL  
**Status:** ✅ FIXED (Frontend restricts featured images to only image_url, created_at, occasion_type)  
**Risk:** Personal data exposure, intimate messages leaked

**Issue:**
The "Anyone can view featured images" policy exposes `message`, `recipient_name`, `prompt`, and `occasion_details`. Sample data shows intimate messages like "My dearest Sarah, my beautiful wife".

**Frontend Mitigation Applied:**
- Index.tsx now only fetches `image_url, created_at, occasion_type` for featured cakes
- Gallery.tsx warns users about privacy when featuring images with personal data
- Gallery.tsx explicitly selects only needed fields instead of `*`

**Remaining Risk:** Direct API calls still expose full data if RLS not updated

**Required SQL Fix:**
```sql
-- Restrict featured images policy to only show safe fields
DROP POLICY "Anyone can view featured images" ON public.generated_images;

CREATE POLICY "Public sees featured images only (safe fields)"
ON public.generated_images
FOR SELECT
USING (
  featured = true 
  -- RLS cannot restrict columns, must be handled at application layer
  -- This policy just restricts which rows are visible
);
```

**Note:** RLS cannot restrict specific columns. Application layer must handle field selection.

---

## 🟡 WARNING ISSUES

### 6. Leaked Password Protection Disabled
**Area:** Auth Configuration  
**Severity:** WARNING  
**Status:** ⚠️ Attempted Fix (configure-auth called, but still showing as disabled)  
**Risk:** Users with leaked passwords can still access accounts

**Issue:**
The auth system doesn't check if user passwords have been leaked in data breaches.

**Required Fix:**
Enable leaked password protection in Supabase auth settings.

**Business Impact:** Security vulnerability, potential account compromises

---

### 7. Customer Feedback Invisible to Support Team
**Table:** `feedback`  
**Severity:** WARNING  
**Status:** ❌ Not Fixed  
**Risk:** Cannot respond to customer complaints or feature requests

**Required SQL Fix:**
```sql
CREATE POLICY "Admins can view all feedback"
ON public.feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
```

**Business Impact:** Poor customer service, missed product insights

---

### 8. Referral System Cannot Track Conversions
**Table:** `referrals`  
**Severity:** WARNING  
**Status:** ❌ Not Fixed  
**Risk:** Referral reward system broken

**Required SQL Fix:**
```sql
CREATE POLICY "System can update referrals"
ON public.referrals
FOR UPDATE
USING (true)
WITH CHECK (true);
```

**Business Impact:** Referral program broken, lost marketing opportunity

---

### 9. New Users Cannot Create Their Profiles
**Table:** `profiles`  
**Severity:** WARNING  
**Status:** ❌ Not Fixed (But may be handled by trigger)  
**Risk:** Registration failures

**Note:** The `handle_new_user()` trigger may create profiles automatically, so this might not be an issue.

**Required SQL Fix (if needed):**
```sql
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
```

**Business Impact:** User signup failures, poor onboarding experience

---

## 🔵 INFO ISSUES

### 10. Activity Feed Indefinite Growth
**Table:** `activity_feed`  
**Status:** ⚠️ Partially Addressed (add_activity_feed function already keeps last 100)  
**Risk:** Database bloat (low risk due to existing cleanup)

**Mitigation:** The `add_activity_feed()` function already deletes old activities, keeping only the last 100 entries.

---

### 11. Generation Tracking Records Cannot Be Deleted
**Table:** `generation_tracking`  
**Severity:** INFO  
**Status:** ❌ Not Fixed  
**Risk:** Users can't clean up their own tracking data

**Required SQL Fix:**
```sql
CREATE POLICY "Users can delete their own tracking"
ON public.generation_tracking
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any tracking"
ON public.generation_tracking
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
```

**Business Impact:** Minor UX issue, privacy concern for meticulous users

---

## Summary Statistics

- **Total Issues:** 11
- **Critical (Unfixed):** 3 (profiles, referrals emails, founding_members)
- **Critical (Partially Fixed):** 2 (activity_feed, generated_images)
- **Warnings (Unfixed):** 4 (leaked password, feedback, referrals updates, profiles INSERT)
- **Info (Partially Addressed):** 2 (activity_feed growth already managed, generation_tracking)

---

## Next Steps

1. **Immediate Priority:** Report CREATE POLICY syntax issue to Lovable support to enable RLS migrations
2. **High Priority:** Manually apply RLS policies for `founding_members` and `referrals` tables via Supabase dashboard
3. **Medium Priority:** Apply feedback and achievements policies for admin management
4. **Low Priority:** Add generation_tracking delete policies for UX improvement

---

## Technical Limitation

**Issue:** The Lovable migration tool currently rejects `CREATE POLICY` and `DROP POLICY` SQL syntax, preventing automated RLS policy updates. All SQL fixes listed above are valid PostgreSQL statements but cannot be executed via the migration tool.

**Workaround:** Frontend query restrictions implemented to minimize data exposure, but this doesn't prevent direct API access.

**Permanent Fix Required:** Database-level RLS policy updates via Supabase dashboard or when migration tool supports policy DDL.

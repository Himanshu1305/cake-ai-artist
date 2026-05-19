-- Security hardening: tighten RLS policies on profiles, founding_members, and referrals.
-- Safe to re-run: all drops use IF EXISTS.

-- ============================================================
-- profiles: block anon access entirely; users see only own row
-- ============================================================

-- Revoke any accidental anon SELECT grant
REVOKE SELECT ON public.profiles FROM anon;

-- Ensure only authenticated users can SELECT their own row (idempotent)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- founding_members: block anon; users see own row; admins see all
-- ============================================================

REVOKE SELECT ON public.founding_members FROM anon;

DROP POLICY IF EXISTS "Users can view all founding members" ON public.founding_members;
DROP POLICY IF EXISTS "Users can view their own founding member record" ON public.founding_members;
DROP POLICY IF EXISTS "Admins can view all founding members" ON public.founding_members;

CREATE POLICY "Users can view their own founding member record"
  ON public.founding_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all founding members"
  ON public.founding_members FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- referrals: users can read/insert own rows; service_role can update
-- ============================================================

DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated users can create their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Service role can update referrals" ON public.referrals;

CREATE POLICY "Authenticated users can create their own referrals"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Authenticated users can view their own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

-- Allow the service_role (edge functions) to update referrals when tracking conversions
CREATE POLICY "Service role can update referrals"
  ON public.referrals FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

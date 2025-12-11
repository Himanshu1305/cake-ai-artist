-- Drop the existing tier constraint
ALTER TABLE public.founding_members 
DROP CONSTRAINT IF EXISTS founding_members_tier_check;

-- Add new constraint with all valid tier values
ALTER TABLE public.founding_members 
ADD CONSTRAINT founding_members_tier_check 
CHECK (tier = ANY (ARRAY[
  'tier_1_49'::text, 
  'tier_2_99'::text, 
  'admin_grant'::text,
  'monthly_inr'::text,
  'monthly_gbp'::text,
  'monthly_cad'::text,
  'monthly_aud'::text,
  'monthly_usd'::text,
  'monthly_subscription'::text
]));
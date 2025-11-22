-- Create founding_members table
CREATE TABLE public.founding_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_number integer NOT NULL UNIQUE,
  tier text NOT NULL CHECK (tier IN ('tier_1_49', 'tier_2_99')),
  price_paid decimal(10,2) NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  display_on_wall boolean DEFAULT true,
  special_badge text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founding_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all founding members" 
  ON public.founding_members 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can insert founding members" 
  ON public.founding_members 
  FOR INSERT 
  WITH CHECK (true);

-- Update profiles table
ALTER TABLE public.profiles 
  ADD COLUMN is_founding_member boolean DEFAULT false,
  ADD COLUMN founding_member_number integer,
  ADD COLUMN founding_tier text,
  ADD COLUMN lifetime_access boolean DEFAULT false,
  ADD COLUMN purchased_date timestamptz;

-- Create function to get available spots
CREATE OR REPLACE FUNCTION public.get_available_spots()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  tier_1_sold integer;
  tier_2_sold integer;
BEGIN
  SELECT COUNT(*) INTO tier_1_sold FROM public.founding_members WHERE tier = 'tier_1_49';
  SELECT COUNT(*) INTO tier_2_sold FROM public.founding_members WHERE tier = 'tier_2_99';
  
  RETURN json_build_object(
    'tier_1_available', GREATEST(0, 50 - tier_1_sold),
    'tier_1_sold', tier_1_sold,
    'tier_2_available', GREATEST(0, 150 - tier_2_sold),
    'tier_2_sold', tier_2_sold,
    'total_available', GREATEST(0, 200 - tier_1_sold - tier_2_sold)
  );
END;
$$;

-- Enable realtime for live purchase notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.founding_members;
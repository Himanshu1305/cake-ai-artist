-- Add country column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.country IS 'User country code (e.g., IN, US, UK). Manually set by admin or auto-detected.';

-- Create function to link anonymous page visits to user after signup
CREATE OR REPLACE FUNCTION public.link_session_visits_to_user(
  p_user_id uuid,
  p_session_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.page_visits
  SET user_id = p_user_id
  WHERE session_id = p_session_id
    AND user_id IS NULL;
END;
$$;
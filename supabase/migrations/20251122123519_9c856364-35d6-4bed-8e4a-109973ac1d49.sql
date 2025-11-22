-- Fix function search path for add_activity_feed
CREATE OR REPLACE FUNCTION public.add_activity_feed(
  p_activity_type TEXT,
  p_message TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_feed (activity_type, message)
  VALUES (p_activity_type, p_message);
  
  -- Keep only last 100 activities
  DELETE FROM public.activity_feed
  WHERE id NOT IN (
    SELECT id FROM public.activity_feed
    ORDER BY created_at DESC
    LIMIT 100
  );
END;
$$;
-- Allow new pricing tiers while keeping legacy grandfathered values working.
-- The columns are TEXT, no CHECK constraints currently, so this is essentially a no-op
-- for schema, but we update get_available_spots to no longer cap.

CREATE OR REPLACE FUNCTION public.get_available_spots()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Spot caps removed — pricing model no longer uses limited founder spots.
  RETURN json_build_object(
    'tier_1_available', 9999,
    'tier_1_sold', 0,
    'tier_2_available', 9999,
    'tier_2_sold', 0,
    'total_available', 9999
  );
END;
$function$;
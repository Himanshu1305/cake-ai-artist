-- Data API grants so the browser (authenticated role) can read its own cake job rows.
-- Without this, RLS policies are effectively ignored and PostgREST returns "permission denied",
-- causing the generation UI to get stuck at 75% even though the job finishes server-side.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cake_generation_jobs TO authenticated;
GRANT ALL ON public.cake_generation_jobs TO service_role;

-- Same fix for the tracing table (read by edge function with service role, but harmless to grant).
GRANT ALL ON public.cake_generation_events TO service_role;
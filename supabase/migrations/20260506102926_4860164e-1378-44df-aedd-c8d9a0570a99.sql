
-- Add per-slot error tracking and expected view count to cake_generation_jobs
ALTER TABLE public.cake_generation_jobs
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS hero_error text,
  ADD COLUMN IF NOT EXISTS side_error text,
  ADD COLUMN IF NOT EXISTS top_error text;

-- Ensure full row payloads broadcast on UPDATE so partial column changes are visible to clients
ALTER TABLE public.cake_generation_jobs REPLICA IDENTITY FULL;

-- Make sure the table is in the realtime publication (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'cake_generation_jobs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.cake_generation_jobs';
  END IF;
END $$;

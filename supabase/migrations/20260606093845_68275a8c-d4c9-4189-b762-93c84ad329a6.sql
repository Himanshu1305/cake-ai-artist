
-- 1. Remove cake_generation_jobs from realtime publication (was broadcasting to all subscribers)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'cake_generation_jobs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.cake_generation_jobs';
  END IF;
END $$;

-- 2. Explicit owner-scoped write policies on cake_generation_jobs
DROP POLICY IF EXISTS "Users can insert their own generation jobs" ON public.cake_generation_jobs;
CREATE POLICY "Users can insert their own generation jobs"
  ON public.cake_generation_jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own generation jobs" ON public.cake_generation_jobs;
CREATE POLICY "Users can update their own generation jobs"
  ON public.cake_generation_jobs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own generation jobs" ON public.cake_generation_jobs;
CREATE POLICY "Users can delete their own generation jobs"
  ON public.cake_generation_jobs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages generation jobs" ON public.cake_generation_jobs;
CREATE POLICY "Service role manages generation jobs"
  ON public.cake_generation_jobs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 3. page_visits: tighten INSERT to require null or matching user_id
DROP POLICY IF EXISTS "Anyone can record page visits" ON public.page_visits;
CREATE POLICY "Anyone can record page visits"
  ON public.page_visits FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  );

-- 4. blog_subscribers: tighten INSERT — anon cannot set user_id; authenticated must match
DROP POLICY IF EXISTS "Anyone can subscribe to blog" ON public.blog_subscribers;
CREATE POLICY "Anyone can subscribe to blog"
  ON public.blog_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  );

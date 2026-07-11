CREATE TABLE public.vendor_search_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, date)
);

GRANT SELECT ON public.vendor_search_usage TO authenticated;
GRANT ALL ON public.vendor_search_usage TO service_role;

ALTER TABLE public.vendor_search_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vendor search usage"
  ON public.vendor_search_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX vendor_search_usage_date_idx ON public.vendor_search_usage (date);
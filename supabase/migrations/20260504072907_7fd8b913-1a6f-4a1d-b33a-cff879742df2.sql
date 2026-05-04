ALTER TABLE public.party_tasks
  ADD COLUMN IF NOT EXISTS vendor_name text,
  ADD COLUMN IF NOT EXISTS vendor_email text,
  ADD COLUMN IF NOT EXISTS vendor_phone text,
  ADD COLUMN IF NOT EXISTS vendor_notes text,
  ADD COLUMN IF NOT EXISTS vendor_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS vendor_status text NOT NULL DEFAULT 'not_contacted';
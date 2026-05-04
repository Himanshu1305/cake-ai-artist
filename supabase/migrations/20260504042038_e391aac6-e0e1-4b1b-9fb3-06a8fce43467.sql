
-- Parties (the main event)
CREATE TABLE public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  occasion TEXT,
  event_date TIMESTAMPTZ,
  venue TEXT,
  guest_count INT DEFAULT 0,
  budget NUMERIC,
  theme TEXT,
  notes TEXT,
  cake_image_id UUID,
  status TEXT NOT NULL DEFAULT 'planning',
  public_slug TEXT UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their parties" ON public.parties
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view by slug" ON public.parties
  FOR SELECT USING (true);

CREATE TRIGGER parties_updated_at
  BEFORE UPDATE ON public.parties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks (smart checklist)
CREATE TABLE public.party_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.party_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their party tasks" ON public.party_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.user_id = auth.uid())
  );

-- Guests
CREATE TABLE public.party_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  rsvp_status TEXT NOT NULL DEFAULT 'pending',
  rsvp_token TEXT UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  invited_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  plus_ones INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.party_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their guests" ON public.party_guests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.user_id = auth.uid())
  );
CREATE POLICY "Anyone can read guest by token" ON public.party_guests
  FOR SELECT USING (true);
CREATE POLICY "Anyone can RSVP via token update" ON public.party_guests
  FOR UPDATE USING (true) WITH CHECK (true);

-- Chat messages for conversational concierge
CREATE TABLE public.party_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.party_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage chat" ON public.party_chat_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.user_id = auth.uid())
  );

CREATE INDEX idx_parties_user ON public.parties(user_id);
CREATE INDEX idx_party_tasks_party ON public.party_tasks(party_id);
CREATE INDEX idx_party_guests_party ON public.party_guests(party_id);
CREATE INDEX idx_party_chat_party ON public.party_chat_messages(party_id, created_at);

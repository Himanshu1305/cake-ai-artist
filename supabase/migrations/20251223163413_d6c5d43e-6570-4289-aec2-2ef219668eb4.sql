ALTER TABLE public.founding_members 
ADD CONSTRAINT unique_user_founding_member UNIQUE (user_id);
CREATE TABLE public.cake_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  country TEXT NOT NULL,
  hero_image TEXT,
  excerpt TEXT,
  story TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  prep_time TEXT,
  cook_time TEXT,
  servings TEXT,
  difficulty TEXT,
  related_cake_design_prompt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cake_recipes_country ON public.cake_recipes(country);
CREATE INDEX idx_cake_recipes_published ON public.cake_recipes(is_published);

ALTER TABLE public.cake_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published recipes"
  ON public.cake_recipes FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert recipes"
  ON public.cake_recipes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update recipes"
  ON public.cake_recipes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete recipes"
  ON public.cake_recipes FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cake_recipes_updated_at
  BEFORE UPDATE ON public.cake_recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
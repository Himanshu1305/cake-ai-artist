-- Phase 1 (Overnight SEO Overhaul): CTR-focused title + meta_description rewrites
-- for high-impression / low-CTR blog posts. Content upgrades live in the separate
-- 20260723093000_blog_content_upgrades.sql migration.
--
-- SAFE TO RUN: only UPDATEs title + meta_description on 5 existing rows. Idempotent.
-- The public BlogPost page renders <title>{title} | Cake AI Artist Blog</title> and
-- <meta name="description" content={meta_description}>, so these two columns drive the
-- search snippet.

-- 1. funny-birthday-cake-ideas-for-adults  (846 impr / 15 clicks / 1.8% CTR)
--    Intent: "funny birthday cake ideas [for adults]" — listicle. Promise a count + laughs.
UPDATE public.blog_posts SET
  title = '45 Funny Birthday Cake Ideas for Adults (2026)',
  meta_description = '45 hilarious birthday cake ideas for adults — savage age jokes, over-the-hill gags and cheeky designs. See the funniest ideas and make your own free with AI.'
WHERE slug = 'funny-birthday-cake-ideas-for-adults';

-- 2. meaning-behind-candles-icing-cake-colors  (564 impr / 4 clicks / 0.7% CTR — title failing)
--    Shows for "candle color meaning" / "cake color meaning". Retitle to promise the answer.
UPDATE public.blog_posts SET
  title = 'What Birthday Candle & Cake Colors Mean (Guide)',
  meta_description = 'What do birthday candles and cake icing colors mean? A simple guide to the symbolism of candle colors, icing shades and cake traditions — answered directly.'
WHERE slug = 'meaning-behind-candles-icing-cake-colors';

-- 3. cake-design-ideas-2026  (360 impr / 7 clicks / 1.9% CTR)
--    Intent: "cake design ideas 2026" — trend listicle. Add count + "trending".
UPDATE public.blog_posts SET
  title = '30 Cake Design Ideas for 2026 (Trending Now)',
  meta_description = '30 trending cake design ideas for 2026 — minimalist, retro, metallic drip, sculpted and more. See every trend and design your own free with AI in 30 seconds.'
WHERE slug = 'cake-design-ideas-2026';

-- 4. world-cake-report-2026  (290 impr / 2 clicks / 0.7% CTR)
--    Retitle toward "cake statistics 2026" / "cake industry trends" — stats-forward.
UPDATE public.blog_posts SET
  title = 'Cake Statistics 2026: Trends, Data & Industry Report',
  meta_description = 'Cake statistics for 2026: market size, most-searched flavors, top birthday cake trends and AI cake data — the key numbers in one quick report.'
WHERE slug = 'world-cake-report-2026';

-- 5. ai-cake-generator-vs-chatgpt-gemini-midjourney  (212 impr / 3 clicks / 1.4% CTR)
--    Title was the weak point; keep the strong existing meta_description, sharpen the title.
UPDATE public.blog_posts SET
  title = 'AI Cake Generator vs ChatGPT, Gemini & Midjourney (2026)',
  meta_description = 'Can ChatGPT, Gemini or Midjourney design a cake with a name? We tested all three against a purpose-built AI cake generator — see which spells names right.'
WHERE slug = 'ai-cake-generator-vs-chatgpt-gemini-midjourney';

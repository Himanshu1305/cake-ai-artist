-- ============================================================================
-- Keyword-driven blog topic selection (2026-10-31)
--
-- Replaces the hardcoded topicPools guesswork in generate-blog-post with
-- topics ranked from REAL Search Console demand.
--
-- WHY: the 60 pool topics were chosen by hand and had no relationship to what
-- the site ranks for. Measured over 2026-07-28..2026-10-27, the 35 longest
-- posts (2,300+ words, nearly all from those pools — Navratri cakes, Wimbledon
-- cakes, Canada Day cakes) averaged 154 impressions each, while the two best
-- posts on the site averaged 4,577. The difference was topic demand, not
-- length or effort.
--
-- SCORING: score = sqrt(impressions) * 10 * movable + ctrGap * impressions * 2
--   movable  1.4 at position 8-20 (realistically reachable from page 2)
--            1.0 at position <=7
--            0.5 below 20 (a post will not move these)
--   ctrGap   expected CTR at that position minus actual — unmet intent
--
-- BUCKETS
--   striking_distance  pos 8-20, impressions >=150 — closest wins
--   intent_mismatch    impressions >=400, CTR <2%, pos <=9 — ranks, doesn't land
--   authority_cluster  pos <=3, 20-150 impressions — proven topical trust
--   commercial_intent  how/best/vs/make queries with >=80 impressions
--
-- SEASONALITY: season_months stops a Rakhi post being written in November.
-- NULL means evergreen.
--
-- VETOED: queries that rank but can never convert are stored with
-- status='vetoed' and a reason, so they are not silently rediscovered later.
-- ============================================================================

create table if not exists keyword_opportunities (
  id uuid primary key default gen_random_uuid(),
  query text not null unique,
  impressions int not null default 0,
  clicks int not null default 0,
  ctr numeric(6,4) not null default 0,
  position numeric(6,2) not null default 0,
  bucket text not null check (bucket in ('striking_distance','intent_mismatch','authority_cluster','commercial_intent')),
  score numeric(10,2) not null default 0,
  season_months int[],
  target_country text,
  status text not null default 'available' check (status in ('available','used','vetoed')),
  vetoed_reason text,
  used_by_slug text,
  source_window text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table keyword_opportunities is 'Blog topics ranked from real Search Console demand. generate-blog-post picks the highest-scoring available row whose season matches. Refresh by re-importing a GSC export.';
comment on column keyword_opportunities.season_months is 'Months (1-12) when this query has demand. NULL = evergreen.';
comment on column keyword_opportunities.score is 'Higher = write sooner. Weighted on impressions, how movable the position is, and the CTR gap.';

alter table keyword_opportunities enable row level security;

create policy "Admins manage keyword opportunities" on keyword_opportunities
  for all to authenticated
  using (exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'::app_role));

create policy "Service role manages keyword opportunities" on keyword_opportunities
  for all to service_role using (true);

create index if not exists keyword_opportunities_pick_idx
  on keyword_opportunities (status, score desc);

insert into keyword_opportunities (query,impressions,clicks,ctr,position,bucket,score,season_months,status,vetoed_reason,source_window) values
('cake ai',2047,24,0.0117,6.69,'intent_mismatch',568.3,null,'available',null,'2026-07-28..2026-10-27'),
('rakhi cake design',896,5,0.0056,8.16,'striking_distance',466.37,'{7,8}','available',null,'2026-07-28..2026-10-27'),
('cake designer',1048,31,0.0296,11.9,'striking_distance',453.22,null,'available',null,'2026-07-28..2026-10-27'),
('3d cake design',1257,21,0.0167,6.98,'intent_mismatch',413.12,null,'available',null,'2026-07-28..2026-10-27'),
('3d cake',573,0,0.0,8.69,'striking_distance',367.21,null,'available',null,'2026-07-28..2026-10-27'),
('virtual birthday cake',649,18,0.0277,9.44,'striking_distance',357.05,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday ibrahim cake',533,0,0.0,4.84,'intent_mismatch',294.83,null,'available',null,'2026-07-28..2026-10-27'),
('digital cake',210,1,0.0048,8.12,'striking_distance',214.3,null,'available',null,'2026-07-28..2026-10-27'),
('design a cake online',203,36,0.1773,9.28,'striking_distance',199.47,null,'available',null,'2026-07-28..2026-10-27'),
('birthday cake maker',199,5,0.0251,9.37,'striking_distance',198.65,null,'available',null,'2026-07-28..2026-10-27'),
('erek kue ulang tahun 3d',126,1,0.0079,1.64,'authority_cluster',148.06,null,'vetoed','Indonesian dream-number search, not cake design','2026-07-28..2026-10-27'),
('ai cake photo',114,0,0.0,2.8,'authority_cluster',131.85,null,'available',null,'2026-07-28..2026-10-27'),
('funny birthday cakes for adults',438,6,0.0137,7.21,'intent_mismatch',127.68,null,'available',null,'2026-07-28..2026-10-27'),
('how to make ai cake design',95,4,0.0421,2.35,'authority_cluster',117.97,null,'available',null,'2026-07-28..2026-10-27'),
('design your own birthday cake online free',122,21,0.1721,4.1,'commercial_intent',110.45,null,'available',null,'2026-07-28..2026-10-27'),
('cake ai artist',121,90,0.7438,1.06,'authority_cluster',110.0,null,'available',null,'2026-07-28..2026-10-27'),
('erek erek kue 3d',66,0,0.0,1.67,'authority_cluster',101.04,null,'vetoed','Indonesian dream-number search, not cake design','2026-07-28..2026-10-27'),
('design your own cake online free',91,24,0.2637,4.86,'commercial_intent',95.39,null,'available',null,'2026-07-28..2026-10-27'),
('ai birthday cake with name',90,31,0.3444,1.23,'authority_cluster',94.87,null,'available',null,'2026-07-28..2026-10-27'),
('make a cake online',87,10,0.1149,6.2,'commercial_intent',93.27,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday ananya cake',61,0,0.0,2.66,'authority_cluster',91.52,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday kavya cake',60,0,0.0,2.97,'authority_cluster',90.66,null,'available',null,'2026-07-28..2026-10-27'),
('ai cake generator with name',82,34,0.4146,2.67,'authority_cluster',90.55,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday cake ai',56,3,0.0536,2.48,'authority_cluster',85.63,null,'available',null,'2026-07-28..2026-10-27'),
('ai cke',43,0,0.0,2.91,'authority_cluster',75.03,null,'available',null,'2026-07-28..2026-10-27'),
('3d cake website',54,14,0.2593,2.7,'authority_cluster',73.48,null,'available',null,'2026-07-28..2026-10-27'),
('ai cale',37,0,0.0,2.32,'authority_cluster',71.93,null,'available',null,'2026-07-28..2026-10-27'),
('ai wedding cake',40,2,0.05,2.45,'authority_cluster',71.25,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday rahul cake image',35,0,0.0,3.0,'authority_cluster',66.86,null,'available',null,'2026-07-28..2026-10-27'),
('ai generated birthday cake',30,1,0.0333,1.93,'authority_cluster',61.77,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday navya cake',28,0,0.0,2.68,'authority_cluster',59.08,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday ai cake',25,0,0.0,2.52,'authority_cluster',55.5,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday oliver cake',25,0,0.0,3.0,'authority_cluster',55.5,null,'available',null,'2026-07-28..2026-10-27'),
('cake decorating app free',30,6,0.2,2.3,'authority_cluster',54.77,null,'available',null,'2026-07-28..2026-10-27'),
('design a wedding cake online free',22,4,0.1818,1.14,'authority_cluster',51.22,null,'available',null,'2026-07-28..2026-10-27'),
('ออกแบบเค้ก ออนไลน์ ฟรี',26,5,0.1923,2.96,'authority_cluster',50.99,null,'available',null,'2026-07-28..2026-10-27'),
('ai birthday cakes',25,3,0.12,2.52,'authority_cluster',50.0,null,'available',null,'2026-07-28..2026-10-27'),
('happy birthday vihaan cake',20,0,0.0,2.95,'authority_cluster',49.12,null,'available',null,'2026-07-28..2026-10-27')
on conflict (query) do nothing;

-- ----------------------------------------------------------------------------
-- FAQ pairs for AEO/GEO. Answer engines (AI Overviews, ChatGPT, Perplexity)
-- lift short, self-contained question/answer pairs far more readily than prose.
-- Stored structured so BlogPost.tsx can emit FAQPage schema as well as render
-- them, rather than burying them in the content HTML where only humans see them.
-- ----------------------------------------------------------------------------
alter table blog_posts add column if not exists faq jsonb;
comment on column blog_posts.faq is 'Array of {question, answer} for FAQPage schema and the on-page FAQ block. Answers are 40-60 words so an answer engine can quote one whole.';

alter table blog_posts add column if not exists target_keyword text;
comment on column blog_posts.target_keyword is 'The keyword_opportunities.query this post was written for. Null for pool-topic and hand-written posts.';

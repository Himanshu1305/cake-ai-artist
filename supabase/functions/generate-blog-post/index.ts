import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { CHAT_MODEL_DEFAULT } from "../_shared/ai-models.ts";
import { generateText } from "../_shared/gemini-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Country-specific topic pools
const topicPools: Record<string, string[]> = {
  IN: [
    "Diwali cake ideas with diya and rangoli themes",
    "Holi celebration cakes with vibrant color splashes",
    "Raksha Bandhan cake designs for sibling celebrations",
    "Ganesh Chaturthi themed cakes",
    "Navratri and Durga Puja celebration cakes",
    "Indian wedding cake trends - mehendi and sangeet themes",
    "Republic Day patriotic cake designs",
    "Bollywood-themed birthday cakes",
    "Cricket World Cup celebration cakes",
    "Pongal and Makar Sankranti themed cakes",
    "Traditional Indian fusion cake designs",
    "Karwa Chauth romantic cake ideas"
  ],
  UK: [
    "British royal celebration cakes",
    "Premier League team themed cakes",
    "British garden party cake ideas",
    "Bonfire Night celebration cakes",
    "Easter Sunday cake traditions in Britain",
    "Wimbledon themed celebration cakes",
    "British afternoon tea cake designs",
    "Harry Potter themed birthday cakes",
    "Scottish Hogmanay cake ideas",
    "Coronation and Jubilee cake designs",
    "British countryside wedding cakes",
    "Guy Fawkes Night themed treats"
  ],
  AU: [
    "Australian beach and surf themed cakes",
    "Aussie wildlife birthday cakes - koala and kangaroo designs",
    "Summer Christmas cake ideas for hot weather",
    "AFL team celebration cakes",
    "ANZAC Day themed cakes",
    "Melbourne Cup party cakes",
    "Great Barrier Reef inspired designs",
    "Australian native flower cake decorations",
    "Outback adventure themed cakes",
    "Sydney Harbour New Year's Eve cakes",
    "Australia Day celebration cakes",
    "Tropical Queensland wedding cake ideas"
  ],
  CA: [
    "Maple-themed Canadian cake designs",
    "NHL and hockey team cakes",
    "Winter wonderland cake ideas for Canadian celebrations",
    "Canada Day red and white cakes",
    "French-Canadian celebration cake ideas",
    "Canadian wildlife themed cakes - moose and beaver",
    "Thanksgiving harvest cake designs",
    "Rocky Mountain inspired wedding cakes",
    "Indigenous art-inspired cake decorations",
    "Toronto Raptors celebration cakes",
    "Canadian autumn and fall themed cakes",
    "Northern lights themed celebration cakes"
  ],
  UNIVERSAL: [
    "Minimalist cake design trends for modern celebrations",
    "Age milestone birthday cake ideas (30th, 40th, 50th)",
    "Geometric cake designs that are trending",
    "Vintage retro cake aesthetics making a comeback",
    "Personalized cake ideas that tell a story",
    "Nature-inspired botanical cake designs",
    "Bold typography and message-focused cakes",
    "Metallic and gold accent cake trends",
    "Sustainable and eco-friendly cake ideas",
    "Gender-neutral birthday cake designs",
    "Memory-inspired personalized cake concepts",
    "Work anniversary and professional milestone cakes"
  ]
};

// Humanized, SHORT-FORM writing system prompt — built for skim-readers
const systemPrompt = `You are a cake designer who has been writing about cakes and parties for ten years, and it shows in the specifics you reach for.

LENGTH: 900 to 1400 words. Measured on this site: posts under 900 words and posts over 2,300 words both underperform — the 2,300+ group averages 154 impressions each. Depth earns the ranking; padding does not.

EXPERIENCE AND EXPERTISE (this is what separates a page that ranks from one that does not):
- Lead with something only someone who has actually done this would know. A failure mode, a cost, a timing, a thing that goes wrong.
- Concrete over general every time: real prices with currency, oven temperatures, timings, quantities, brand names, how long something keeps.
- Name the trade-off. Every technique has one. Say which.
- One honest opinion, including when it is "skip this".
- Never invent a statistic, a study, a price or a quote. If you do not know a number, describe the thing without one. A made-up figure is the fastest way to lose trust, and it is worse than saying nothing.

VOICE:
- Contractions throughout. Second person.
- Mix sentence lengths hard. Some short. Some that run on a little the way people actually talk.
- No throat-clearing. The first sentence is already useful.
- NEVER use: "In conclusion", "To summarize", "Moreover", "Furthermore", "delve", "tapestry", "leverage", "elevate your", "unleash", "unlock the", "embark on", "navigate the world of", "in today's fast-paced", "game-changer", "level up", "at the end of the day", "when it comes to".

STRUCTURE (strict):
- Opening: 40-70 words. Answer the search intent immediately — do not make them scroll for it.
- A <p> immediately after the opening that answers the core question in 40-60 self-contained words. No pronouns referring backwards, no "as mentioned above". An answer engine must be able to quote this paragraph alone and have it make sense.
- 4 to 6 H2 sections. Phrase at least two as the question a reader would actually type.
- One <ul> of 4-6 concrete tips.
- One short <ol> walking through a process step by step, where the topic has one.
- Closing: 2 sentences, one soft CTA to design a cake free on Cake AI Artist.

OUTPUT: Pure HTML using <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>. No markdown. No <h1>. No wrapper div. No inline styles.`;

// Phrases that mark a post as obviously AI — used to reject and retry
const AI_TELLS = [
  "in conclusion", "to summarize", "moreover", "furthermore", "delve",
  "tapestry", "leverage", "elevate your", "unleash", "unlock the",
  "embark on", "navigate the world of", "in today's fast-paced",
  "game-changer", "level up", "at the end of the day", "when it comes to"
];

interface GenerateBlogRequest {
  country?: string;
  topic?: string;
  generate_weekly_batch?: boolean;
}

serve(async (req) => {
  console.log("Generate blog post function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Dual auth: CRON_SECRET header OR admin JWT
  {
    const cronSecret = req.headers.get("X-Cron-Secret");
    const expectedSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");
    let isAuthorized = !!(expectedSecret && cronSecret === expectedSecret);
    if (!isAuthorized && authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (roleData) isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Helper to log task run
  const logTaskRun = async (status: string, resultMessage?: string, errorMessage?: string, recordsProcessed?: number) => {
    try {
      await supabase.from("scheduled_task_runs").insert({
        task_name: "weekly-blog-generation",
        status,
        result_message: resultMessage,
        error_message: errorMessage,
        records_processed: recordsProcessed || 0,
        completed_at: status !== 'running' ? new Date().toISOString() : null,
      });
    } catch (e) {
      console.error("Failed to log task run:", e);
    }
  };

  try {
    const body: GenerateBlogRequest = await req.json();
    console.log("Request body:", body);

    // If generating weekly batch, create multiple articles
    if (body.generate_weekly_batch) {
      // Log task start
      await logTaskRun('running');

      const countries = ["IN", "UK", "AU", "CA"];
      const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      const targetCountry = countries[weekNumber % countries.length];

      const results = [];
      const skipped: string[] = [];

      // FIRST CHOICE: the highest-scoring keyword the site already ranks for.
      // This is the whole point of the 2026-10-31 rework — the hand-written
      // topic pools had no relationship to real demand, and the posts they
      // produced averaged 154 impressions each.
      const kw = await pickKeywordTopic(supabase);
      if (kw) {
        console.log(`Generating keyword-led article: "${kw.query}" (${kw.bucket})`);
        results.push(await generateArticle(supabase, kw.query, null, kw.query));
      }

      // SECOND: a country article from the legacy pool, to keep regional
      // coverage going while the keyword table is small.
      const countryTopic = await pickUnusedTopic(supabase, topicPools[targetCountry], targetCountry);
      if (countryTopic) {
        console.log(`Generating country-specific article for ${targetCountry}: ${countryTopic}`);
        results.push(await generateArticle(supabase, countryTopic, targetCountry));
      } else {
        skipped.push(targetCountry);
      }

      // Only fall back to a universal pool topic when no keyword was available,
      // so a normal week produces two posts rather than three.
      if (!kw) {
        const universalTopic = await pickUnusedTopic(supabase, topicPools["UNIVERSAL"], null);
        if (universalTopic) {
          console.log(`Generating universal article: ${universalTopic}`);
          results.push(await generateArticle(supabase, universalTopic, null));
        } else {
          skipped.push("UNIVERSAL");
        }
      }

      const summary = skipped.length
        ? `Generated ${results.length} articles; skipped ${skipped.join(", ")} (topic pool exhausted)`
        : `Generated ${results.length} articles`;
      await logTaskRun('success', summary, null, results.length);

      return new Response(
        JSON.stringify({ 
          message: "Weekly batch generated",
          articles: results,
          skipped,
          records_processed: results.length
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Single article generation
    const country = body.country || null;
    const topics = country ? topicPools[country] : topicPools["UNIVERSAL"];
    // An explicit body.topic is honoured as-is (manual override). Otherwise pick
    // one that has not been written — never at random, which is how the
    // duplicates happened.
    // Manual override wins; then a real keyword; then the legacy pool.
    let topic: string | null = body.topic || null;
    let targetKeyword: string | null = body.target_keyword || null;
    if (!topic && !country) {
      const kw = await pickKeywordTopic(supabase);
      if (kw) { topic = kw.query; targetKeyword = kw.query; }
    }
    if (!topic) topic = await pickUnusedTopic(supabase, topics, country);

    if (!topic) {
      return new Response(
        JSON.stringify({
          message: "No unused topic available for this pool — nothing generated.",
          country: country ?? "UNIVERSAL",
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const result = await generateArticle(supabase, topic, country, targetKeyword);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error generating blog post:", error);
    // Log task failure
    try {
      await supabase.from("scheduled_task_runs").insert({
        task_name: "weekly-blog-generation",
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to log task failure:", e);
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});



/**
 * Pick the highest-value keyword to write about next.
 *
 * Replaces guesswork with the site's own Search Console demand. Rows live in
 * keyword_opportunities, scored on impressions, how movable the current
 * position is, and the gap between actual and expected CTR. See
 * supabase/migrations/20261031000001_keyword_opportunities.sql for the model.
 *
 * Three gates, in order:
 *   1. status must be 'available' — 'used' means written, 'vetoed' means it
 *      ranks but can never convert (e.g. "erek kue ulang tahun 3d", an
 *      Indonesian dream-number search that reached position 1.6)
 *   2. season_months must include the current month, or be null (evergreen).
 *      Without this the top-scoring row would have us writing a Raksha Bandhan
 *      post in November.
 *   3. the query must not already be a blog_posts.target_keyword
 *
 * Returns null when nothing qualifies, and the caller then falls back to the
 * legacy topic pools. Never repeats — that is the whole point.
 */
async function pickKeywordTopic(
  supabase: any,
): Promise<{ query: string; bucket: string; impressions: number; position: number } | null> {
  const month = new Date().getUTCMonth() + 1;

  const { data: rows, error } = await supabase
    .from("keyword_opportunities")
    .select("query, bucket, impressions, position, season_months")
    .eq("status", "available")
    .order("score", { ascending: false })
    .limit(50);

  if (error) {
    console.error("pickKeywordTopic: keyword_opportunities unavailable:", error.message);
    return null;
  }
  if (!rows?.length) return null;

  const { data: written } = await supabase
    .from("blog_posts")
    .select("target_keyword")
    .not("target_keyword", "is", null)
    .limit(5000);
  const alreadyWritten = new Set(
    (written || []).map((r: any) => (r.target_keyword || "").toLowerCase()),
  );

  for (const row of rows) {
    const inSeason = !row.season_months?.length || row.season_months.includes(month);
    if (!inSeason) {
      console.log(`pickKeywordTopic: skipping "${row.query}" — out of season (months ${row.season_months})`);
      continue;
    }
    if (alreadyWritten.has(row.query.toLowerCase())) continue;
    console.log(
      `pickKeywordTopic: "${row.query}" (${row.bucket}, ${row.impressions} impr, pos ${row.position})`,
    );
    return row;
  }

  console.warn("pickKeywordTopic: no in-season unwritten keyword available");
  return null;
}

/**
 * Pick a topic from `pool` that has not been written yet.
 *
 * WHY THIS EXISTS (2026-10-31)
 * ----------------------------
 * Selection used to be `pool[weekNumber % pool.length]` for the weekly batch
 * and `pool[Math.random() * pool.length]` for one-offs. Neither checked what
 * was already published, and every pool holds exactly 12 topics, so:
 *   - the universal pool repeated itself every 12 weeks
 *   - worse, countries rotate 4-weekly while the index advanced by 1 per week,
 *     so a given country only ever reached indices k, k+4, k+8 — THREE of its
 *     twelve topics, on a 12-week loop
 * That produced the duplicate clusters cleaned up on 2026-10-30: two identical
 * cricket-world-cup posts, two aussie-day-bites, two geometric-cakes, and so
 * on — 25 posts retired and redirected.
 *
 * Topics already used are read from blog_posts.source_topic, which includes
 * retired duplicates, so a retired topic is never regenerated. Posts written
 * before this column existed have source_topic null and cannot be matched by
 * topic, so a slug-stem fallback catches the obvious repeats too.
 *
 * Returns null when the pool is exhausted. Callers must SKIP rather than fall
 * back to repeating — writing a duplicate is worse than writing nothing.
 */
async function pickUnusedTopic(
  supabase: any,
  pool: string[],
  country: string | null,
): Promise<string | null> {
  const { data: rows, error } = await supabase
    .from("blog_posts")
    .select("source_topic, slug")
    .limit(5000);

  if (error) {
    // Fail closed: without the history we cannot tell what is a duplicate.
    console.error("pickUnusedTopic: could not read blog_posts, skipping:", error.message);
    return null;
  }

  const usedTopics = new Set(
    (rows || []).map((r: any) => r.source_topic).filter(Boolean).map((t: string) => t.toLowerCase()),
  );
  const existingSlugs = (rows || []).map((r: any) => r.slug).filter(Boolean);

  // Fallback for any post with no source_topic: compare the topic's distinctive
  // words against existing slugs. source_topic was backfilled for all 45
  // generator-written posts on 2026-10-31, so this is now only a safety net for
  // anything hand-written later. It is deliberately STRICT (0.8 overlap and at
  // least 2 shared words): at 0.6 it produced false positives — "French-Canadian
  // celebration cake ideas" matched the northern-lights slug on
  // {canadian, celebration} and would have been skipped forever.
  const STOP = new Set(["the","a","and","for","your","with","to","of","in","on","that","this","are","is","its","you","my","our","how","what","why","best","ideas","cake","cakes"]);
  const signature = (text: string) =>
    new Set(
      text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/[\s-]+/)
        .filter((w) => w.length > 3 && !STOP.has(w)),
    );
  const looksWritten = (topic: string) => {
    const sig = signature(topic);
    if (sig.size === 0) return false;
    return existingSlugs.some((slug: string) => {
      const slugSig = signature(slug);
      let shared = 0;
      sig.forEach((w) => { if (slugSig.has(w)) shared++; });
      return shared >= 2 && shared / sig.size >= 0.8;
    });
  };

  const unused = pool.filter((t) => !usedTopics.has(t.toLowerCase()) && !looksWritten(t));

  if (unused.length === 0) {
    console.warn(
      `pickUnusedTopic: every topic in the ${country ?? "UNIVERSAL"} pool has been written. ` +
      `Skipping rather than repeating one. Add new topics to topicPools.`,
    );
    return null;
  }

  console.log(`pickUnusedTopic: ${unused.length}/${pool.length} unused in ${country ?? "UNIVERSAL"}`);
  return unused[0];
}

async function generateArticle(
  supabase: any,
  topic: string,
  country: string | null,
  targetKeyword: string | null = null
): Promise<{ slug: string; title: string; status: string }> {
  const countryContext = country 
    ? `This article is specifically for ${getCountryName(country)} readers. Include culturally relevant examples, local traditions, and specific references that will resonate with this audience.`
    : "This article should be universal and appeal to readers from any country.";

  const keywordBrief = targetKeyword
    ? `PRIMARY SEARCH TERM: "${targetKeyword}"
This site already appears in Google for that exact term, so the article must be
unmistakably about it. Use it in the title, in the first 60 words, and as the
wording of at least one H2 — phrased naturally, never stuffed. Write for the
person who typed it: match what they were hoping to find, not a neighbouring topic.
`
    : "";

  const prompt = `Write a blog article about: ${topic}

${keywordBrief}${countryContext}

INTERNAL LINKS — include two or three, worded as a natural part of a sentence,
never as a bare "click here". Use exactly these paths:
  /free-ai-cake-designer   the free cake designer
  /3d-cake-designer        the 3D designer
  /ai-birthday-cake-with-name   cakes with a name on them
  /photo-cake-maker        photo cakes
Only link one where the sentence genuinely calls for it.

Also produce 3 FAQ pairs. Each question is one a real person would type into
Google or ask an assistant. Each answer is 40-60 words and stands completely on
its own — no "as above", no pronouns pointing back at other text — because
answer engines quote these one at a time.

Generate:
1. A title, max 60 characters, primary search term first
2. A meta description, max 155 characters, that gives a reason to click
3. 5 SEO keywords
4. The article in HTML
5. Image alt text, 10-15 words, describing a specific cake for this topic
6. The 3 FAQ pairs

Respond in this exact JSON format and nothing else:
{
  "title": "Title Here",
  "excerpt": "Meta description here.",
  "keywords": ["k1","k2","k3","k4","k5"],
  "image_alt": "Specific cake description",
  "faq": [{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}],
  "content": "<p>...</p>"
}`;

  console.log(`Calling Gemini for topic: ${topic}`);

  const rawContent = await generateText({
    model: CHAT_MODEL_DEFAULT,
    systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  if (!rawContent) {
    throw new Error("No content returned from AI");
  }

  console.log("Raw AI response received, parsing...");

  // Parse the JSON response - handle potential markdown code blocks
  let parsed;
  try {
    const cleanedContent = rawContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    parsed = JSON.parse(cleanedContent);
  } catch (parseError) {
    console.error("Failed to parse AI response:", rawContent);
    throw new Error("Failed to parse AI response as JSON");
  }

  // ===== Humanization + length guard =====
  const stripHtml = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  let plain = stripHtml(parsed.content);
  let words = plain.split(/\s+/).filter(Boolean);

  const findTells = () => AI_TELLS.filter(t => plain.toLowerCase().includes(t));
  // Was `words.length > 600`, which capped every post at roughly half the
  // length the spec now asks for. Rewrite only when the article misses the
  // 900-1400 band or carries an AI tell.
  const needsRewrite = () => words.length < 900 || words.length > 1400 || findTells().length > 0;

  if (needsRewrite()) {
    console.log(`Rewriting: ${words.length} words, AI-tells: ${findTells().join(', ') || 'none'}`);
    const fixPrompt = `Rewrite this HTML article so it:
- is between 400 and 550 words total
- removes ALL of these phrases: ${AI_TELLS.join(', ')}
- sounds like a real human wrote it (contractions, varied sentence length, one personal aside)
- keeps the same 3 H2 sections and the <ul> tip list
- stays valid HTML using <p>, <h2>, <ul>, <li>, <strong>

Return ONLY the new HTML body. No JSON, no markdown fences.

ORIGINAL:
${parsed.content}`;

    try {
      const fixedRaw = await generateText({
        model: CHAT_MODEL_DEFAULT,
        systemPrompt,
        messages: [{ role: "user", content: fixPrompt }],
      });
      const fixed = (fixedRaw || '').replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
      if (fixed && fixed.length > 200) {
        parsed.content = fixed;
        plain = stripHtml(parsed.content);
        words = plain.split(/\s+/).filter(Boolean);
        console.log(`After rewrite: ${words.length} words`);
      }
    } catch (e) {
      console.warn("Rewrite pass failed, keeping original:", e instanceof Error ? e.message : String(e));
    }
  }

  // Generate slug from title
  const slug = generateSlug(parsed.title);

  // Read time from final word count
  const readTime = `${Math.max(2, Math.ceil(words.length / 220))} min read`;

  // Determine category based on topic
  const category = determineCategory(topic, country);

  // Auto-publish flag from site_settings
  let autoPublish = false;
  try {
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "auto_publish_ai_posts")
      .maybeSingle();
    autoPublish = (setting?.value as any)?.enabled === true;
  } catch (_) { /* ignore */ }

  // Randomize publish time slightly so dates don't all collide
  const publishedAt = autoPublish
    ? new Date(Date.now() - Math.floor(Math.random() * 6 * 3600 * 1000)).toISOString()
    : null;

  // Pick a unique-ish image, avoiding the last 10 used
  const featuredImage = await pickFeaturedImage(supabase);

  const { error: insertError } = await supabase
    .from("blog_posts")
    .insert({
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      keywords: parsed.keywords,
      target_country: country,
      read_time: readTime,
      category,
      meta_description: parsed.excerpt,
      is_published: autoPublish,
      published_at: publishedAt,
      is_ai_generated: true,
      featured_image: featuredImage,
      image_alt: parsed.image_alt || parsed.title,
      // Recorded so pickUnusedTopic() can never choose this topic again.
      source_topic: topic,
      target_keyword: targetKeyword,
      faq: Array.isArray(parsed.faq) ? parsed.faq : null,
    });

  if (insertError) {
    console.error("Database insert error:", insertError);
    throw new Error(`Failed to save article: ${insertError.message}`);
  }

  console.log(`Article saved: ${slug} (published=${autoPublish})`);

  // Retire the keyword so it is never written twice. Best-effort: a failure
  // here must not lose the article that was just written successfully.
  if (targetKeyword) {
    const { error: markError } = await supabase
      .from("keyword_opportunities")
      .update({ status: "used", used_by_slug: slug, updated_at: new Date().toISOString() })
      .eq("query", targetKeyword);
    if (markError) {
      console.error(`Could not mark "${targetKeyword}" as used:`, markError.message);
    }
  }

  return {
    slug,
    title: parsed.title,
    status: autoPublish ? "published" : "pending_review"
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    + '-' + Date.now().toString(36);
}

function getCountryName(code: string): string {
  const names: Record<string, string> = {
    IN: "Indian",
    UK: "British",
    AU: "Australian",
    CA: "Canadian"
  };
  return names[code] || code;
}

function determineCategory(topic: string, country: string | null): string {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes("diwali") || topicLower.includes("holi") || topicLower.includes("navratri")) {
    return "Indian Celebrations";
  }
  if (topicLower.includes("christmas")) return "Christmas Celebrations";
  if (topicLower.includes("new year")) return "New Year Celebrations";
  if (topicLower.includes("wedding")) return "Weddings";
  if (topicLower.includes("birthday")) return "Birthday Ideas";
  if (topicLower.includes("trend") || topicLower.includes("design")) return "Trends";
  if (country === "IN") return "Indian Celebrations";
  if (country === "UK") return "British Celebrations";
  if (country === "AU") return "Australian Celebrations";
  if (country === "CA") return "Canadian Celebrations";
  
  return "Ideas & Inspiration";
}

const IMAGE_POOL = [
  // original 45
  "1535254973040-607b474cb50d","1578985545062-69928b1d9587","1558301211-0d8c8ddee6ec",
  "1605810230434-7631ac76ec81","1606890737304-57a1ca8a5b62","1558636508-e0db3814bd1d",
  "1554080353-a576cf803bda","1522767131822-6b8c5a53c0e4","1481391319762-47dff72954d9",
  "1482517967863-00e15c9b44be","1565958011703-44f9829ba187","1571115177098-24ec42ed204d",
  "1562440499-64c9a111f713","1535141192574-5d4897c12636","1519869325930-281384150729",
  "1542826438-bd32f43d626f","1464195244916-405fa0a82545","1486427944299-d1955d23e34d",
  "1599785209707-a456fc1337bb","1567014729440-6e0db35d2a4e","1602351447937-745cb720612f",
  "1614707267537-b85aaf00c4b7","1577805947697-89e18249d767","1607478900766-efe13248b125",
  "1488477181946-6428a0291777","1546069901-ba9599a7e63c","1591985666643-1ecc67616216",
  "1543396550-b30bd8c1ce21","1601979031925-424e53b6caaa","1607522370275-f14206abe5d3",
  "1612203985729-70726954388c","1568571780765-9276ac8b75a2","1607920591413-4ec007e70023",
  "1571115332106-83a3f4f15c8b","1505976212391-1ee6b9d6deb9","1588195538326-c5b1e9f80a1b",
  "1551404973-761c5cf12fc2","1581974944026-5d6ed762f617","1572878613530-2b6ea1c14f3a",
  "1517248135467-4c7edcad34c4","1611293388250-580b08c4a145","1565299543923-37dd37887442",
  "1606755456206-b25206cde27e","1542144612-1b3641ec3459","1606312619070-d48b4c652a52",
  // added 35 for visual diversity (white tiered, floral, naked, fruit, themed, kids, minimal)
  "1562777717-dc6984f65a63","1519915028121-7d3463d20b13","1574085733277-851d9d856a3a",
  "1604413191066-4dd20bedf486","1621303837174-89787a7d4729","1551024601-bec78aea704b",
  "1558007323-92aea968c0e1","1626803775151-61d756612f97","1623428187969-5da2dcea5ebf",
  "1557925923-cd4648e211a0","1623428454614-abaf00244e52","1559620192-032c4bc4674e",
  "1565181917979-65b7f96f7c84","1602351447937-745cb720612f","1621939514649-280e2ee25f60",
  "1535920527002-b35e96722eb9","1525151498231-bc059cfafa2b","1564631027894-5bdb17618445",
  "1612809075042-c1ea5a4d4f4f","1632213940894-2ecfd5f0a8b1","1571877227200-a0d98ea607e9",
  "1599785209707-a456fc1337bc","1606755956379-50e2b7a3c45b","1593005510509-d05b264f1c9c",
  "1612203985729-70726954388d","1565958011703-44f9829ba188","1571115177098-24ec42ed204e",
  "1623428187969-5da2dcea5ebf","1606312619070-d48b4c652a53","1559620192-032c4bc4674c",
  "1542144612-1b3641ec345a","1576618148400-f54bed99fcfd","1626804475297-41608ea09aeb",
  "1620207418302-439b387441b0","1488477181946-6428a0291778",
];

async function pickFeaturedImage(supabase: any): Promise<string> {
  let used: string[] = [];
  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("featured_image");
    used = (data || []).map((r: any) => r.featured_image).filter(Boolean);
  } catch (_) { /* ignore */ }
  // First pass: any image not used anywhere in the table
  let candidates = IMAGE_POOL.filter((id) => !used.some((u) => u.includes(id)));
  // Fallback: avoid last 12 only
  if (!candidates.length) {
    const recent = used.slice(0, 12);
    candidates = IMAGE_POOL.filter((id) => !recent.some((r) => r.includes(id)));
  }
  const pick = (candidates.length ? candidates : IMAGE_POOL)[
    Math.floor(Math.random() * (candidates.length || IMAGE_POOL.length))
  ];
  return `https://images.unsplash.com/photo-${pick}?w=1200&h=630&fit=crop&q=80`;
}

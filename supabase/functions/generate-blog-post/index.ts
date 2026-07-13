import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { CHAT_MODEL_DEFAULT } from "../_shared/ai-models.ts";

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
const systemPrompt = `You are a real cake-blog writer with a warm, personal voice. You've been writing about cakes and parties for ten years and it shows.

NON-NEGOTIABLE RULES:
- Total length: 400 to 550 words. Never more.
- Use contractions every time (it's, you'll, that's, we're, don't).
- Mix sentence lengths heavily. Some 4 words. Some longer ones that flow like you're talking to a friend across the kitchen counter.
- One small personal aside or opinion ("honestly, I'd skip the fondant on this one").
- Specific, concrete details over generic praise. Names, brands, exact temperatures, real prices when relevant.
- Reference real cultural context for the target country.
- Second person ("you").
- Zero AI-tells. NEVER use any of these words or phrases: "In conclusion", "To summarize", "Moreover", "Furthermore", "delve", "tapestry", "leverage", "elevate your", "unleash", "unlock the", "embark on", "navigate the world of", "in today's fast-paced", "game-changer", "level up", "at the end of the day", "when it comes to".
- No corporate fluff. No throat-clearing intros.

STRUCTURE (strict):
- Opening hook: 1-2 punchy sentences. ~30-50 words.
- Exactly 3 H2 sections, ~110-140 words each.
- One short <ul> with 3-5 quick tips inside one of the sections.
- Closing: 1 warm sentence + soft CTA to design a cake on Cake AI Artist. ~25 words.

OUTPUT: Pure HTML using <p>, <h2>, <ul>, <li>, <strong>. No markdown. No <h1>. No wrapper div.`;

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GenerateBlogRequest = await req.json();
    console.log("Request body:", body);

    // If generating weekly batch, create multiple articles
    if (body.generate_weekly_batch) {
      // Log task start
      await logTaskRun('running');

      const countries = ["IN", "UK", "AU", "CA"];
      const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      const countryIndex = weekNumber % countries.length;
      const targetCountry = countries[countryIndex];

      const results = [];

      // Generate one country-specific article
      const countryTopics = topicPools[targetCountry];
      const countryTopic = countryTopics[weekNumber % countryTopics.length];
      
      console.log(`Generating country-specific article for ${targetCountry}: ${countryTopic}`);
      const countryResult = await generateArticle(supabase, LOVABLE_API_KEY, countryTopic, targetCountry);
      results.push(countryResult);

      // Generate one universal article
      const universalTopics = topicPools["UNIVERSAL"];
      const universalTopic = universalTopics[weekNumber % universalTopics.length];
      
      console.log(`Generating universal article: ${universalTopic}`);
      const universalResult = await generateArticle(supabase, LOVABLE_API_KEY, universalTopic, null);
      results.push(universalResult);

      // Log task success
      await logTaskRun('success', `Generated ${results.length} articles`, null, results.length);

      return new Response(
        JSON.stringify({ 
          message: "Weekly batch generated",
          articles: results,
          records_processed: results.length
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Single article generation
    const country = body.country || null;
    const topics = country ? topicPools[country] : topicPools["UNIVERSAL"];
    const topic = body.topic || topics[Math.floor(Math.random() * topics.length)];

    const result = await generateArticle(supabase, LOVABLE_API_KEY, topic, country);

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

async function generateArticle(
  supabase: any,
  apiKey: string,
  topic: string,
  country: string | null
): Promise<{ slug: string; title: string; status: string }> {
  const countryContext = country 
    ? `This article is specifically for ${getCountryName(country)} readers. Include culturally relevant examples, local traditions, and specific references that will resonate with this audience.`
    : "This article should be universal and appeal to readers from any country.";

  const prompt = `Write a blog article about: ${topic}

${countryContext}

Generate:
1. A catchy, SEO-friendly title (max 70 characters)
2. A compelling excerpt/meta description (max 160 characters)
3. 5 relevant SEO keywords (comma-separated)
4. The full article content in HTML format
5. A descriptive image alt text (10-15 words) describing a celebration cake that matches this article's topic — be specific (colors, decorations, style)

Respond in this exact JSON format:
{
  "title": "Your Article Title Here",
  "excerpt": "A compelling 1-2 sentence excerpt that makes readers want to click.",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "image_alt": "Descriptive alt text of a cake matching this article topic",
  "content": "<p>Your HTML content here...</p>"
}`;

  console.log(`Calling Lovable AI for topic: ${topic}`);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL_DEFAULT,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

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
  const needsRewrite = () => words.length > 600 || findTells().length > 0;

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

    const fixRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CHAT_MODEL_DEFAULT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fixPrompt }
        ],
      }),
    });
    if (fixRes.ok) {
      const fixData = await fixRes.json();
      const fixed = (fixData.choices?.[0]?.message?.content || '').replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
      if (fixed && fixed.length > 200) {
        parsed.content = fixed;
        plain = stripHtml(parsed.content);
        words = plain.split(/\s+/).filter(Boolean);
        console.log(`After rewrite: ${words.length} words`);
      }
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
    });

  if (insertError) {
    console.error("Database insert error:", insertError);
    throw new Error(`Failed to save article: ${insertError.message}`);
  }

  console.log(`Article saved: ${slug} (published=${autoPublish})`);

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

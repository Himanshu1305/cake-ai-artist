import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Humanized writing system prompt
const systemPrompt = `You are a friendly, conversational cake blog writer with years of experience. Write like a real person who genuinely loves cake and parties.

CRITICAL WRITING GUIDELINES:
- Use contractions naturally (it's, you'll, that's, we're)
- Include occasional humor and personality - be relatable
- Avoid corporate/robotic language at all costs
- Mix short and long sentences for natural rhythm
- Add practical, actionable tips alongside inspiration
- Reference real cultural context for the target country when applicable
- Write in second person ("you") to connect with readers
- Include specific examples and scenarios
- Never use phrases like "In conclusion" or "To summarize"
- End with a friendly, encouraging note

STRUCTURE:
- Start with a relatable hook that draws readers in
- Use 4-6 H2 headings to break up content
- Include practical tips throughout
- Aim for 800-1200 words total
- Make it scannable but also enjoyable to read fully

IMPORTANT: Write in HTML format with proper h2, p, ul, li tags. Don't use markdown.`;

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

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: GenerateBlogRequest = await req.json();
    console.log("Request body:", body);

    // If generating weekly batch, create multiple articles
    if (body.generate_weekly_batch) {
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

      return new Response(
        JSON.stringify({ 
          message: "Weekly batch generated",
          articles: results 
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

Respond in this exact JSON format:
{
  "title": "Your Article Title Here",
  "excerpt": "A compelling 1-2 sentence excerpt that makes readers want to click.",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
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
      model: "google/gemini-2.5-flash",
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

  // Generate slug from title
  const slug = generateSlug(parsed.title);

  // Calculate read time (roughly 200 words per minute)
  const wordCount = parsed.content.replace(/<[^>]*>/g, ' ').split(/\s+/).length;
  const readTime = `${Math.max(3, Math.ceil(wordCount / 200))} min read`;

  // Determine category based on topic
  const category = determineCategory(topic, country);

  // Insert into database
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
      is_published: false, // Requires admin review
      is_ai_generated: true,
      featured_image: getDefaultImage(category),
    });

  if (insertError) {
    console.error("Database insert error:", insertError);
    throw new Error(`Failed to save article: ${insertError.message}`);
  }

  console.log(`Article saved: ${slug}`);

  return {
    slug,
    title: parsed.title,
    status: "pending_review"
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

function getDefaultImage(category: string): string {
  const images: Record<string, string> = {
    "Indian Celebrations": "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&h=600&fit=crop",
    "British Celebrations": "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200&h=600&fit=crop",
    "Australian Celebrations": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop",
    "Canadian Celebrations": "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&h=600&fit=crop",
    "Christmas Celebrations": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=1200&h=600&fit=crop",
    "New Year Celebrations": "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&h=600&fit=crop",
    "Weddings": "https://images.unsplash.com/photo-1522767131822-6b8c5a53c0e4?w=1200&h=600&fit=crop",
    "Birthday Ideas": "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=1200&h=600&fit=crop",
    "Trends": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop",
  };
  return images[category] || "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=1200&h=600&fit=crop";
}

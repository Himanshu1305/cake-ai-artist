import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  category: string;
  is_ai_generated: boolean;
}

const getWeeklyDigestEmail = (firstName: string, posts: BlogPost[], hasNewAIContent: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>This Week's Cake Inspiration</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header Banner with Centered Logo -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%); padding: 28px 24px; text-align: center;">
      <img src="https://cakeaiartist.com/logo.png" 
           alt="Cake AI Artist" 
           style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); margin-bottom: 12px;" />
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">This Week's Cake Inspiration</h1>
      <p style="margin: 4px 0 10px; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">AI-Powered Cake Design</p>
      <span style="display: inline-block; background: rgba(255,255,255,0.2); color: #ffffff; font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 16px;">
        ✨ ${posts.length} Fresh Articles
      </span>
    </div>
    
    <!-- Personalized Greeting -->
    <div style="padding: 28px 24px 20px;">
      <h2 style="margin: 0 0 12px; color: #111827; font-size: 22px; font-weight: 600;">Hey ${firstName}!</h2>
      <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.7;">
        ${hasNewAIContent 
          ? "We've got fresh cake inspiration ready for you! Here are this week's most delicious reads—don't miss out:" 
          : "Your weekly dose of creativity is here. We've handpicked the best articles to spark your next celebration:"}
      </p>
    </div>
    
    <!-- Featured Posts -->
    <div style="padding: 8px 24px 24px;">
      ${posts.map((post, index) => `
        <div style="margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: flex; flex-direction: row;">
            ${post.featured_image ? `
              <div style="width: 140px; min-width: 140px; height: 140px; background-image: url('${post.featured_image}'); background-size: cover; background-position: center;"></div>
            ` : ''}
            <div style="padding: 16px; flex: 1;">
              <div style="margin-bottom: 8px;">
                ${index === 0 ? `<span style="display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: #ffffff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 6px;">New</span>` : ''}
                <span style="display: inline-block; background: #fce7f3; color: #be185d; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 12px;">
                  ${post.category}
                </span>
              </div>
              <h3 style="margin: 0 0 8px; color: #111827; font-size: 15px; font-weight: 600; line-height: 1.4;">
                ${post.title}
              </h3>
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${post.excerpt.substring(0, 100)}${post.excerpt.length > 100 ? '...' : ''}
              </p>
              <a href="https://cakeaiartist.com/blog/${post.slug}" style="display: inline-block; color: #ec4899; text-decoration: none; font-size: 13px; font-weight: 600;">
                Read Article →
              </a>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <!-- Primary CTA Section -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 36px 24px; text-align: center; margin: 0 24px 24px; border-radius: 16px;">
      <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 22px; font-weight: 700;">Ready to Create Something Special?</h3>
      <p style="margin: 0 0 20px; color: rgba(255,255,255,0.9); font-size: 14px;">
        Turn your inspiration into reality with AI
      </p>
      <a href="https://cakeaiartist.com" style="display: inline-block; background: #ffffff; color: #ec4899; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 36px; border-radius: 50px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
        ✨ Design Your Cake Now
      </a>
      <p style="margin: 16px 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">
        Free to try • No credit card needed
      </p>
    </div>
    
    <!-- AI Disclosure -->
    <div style="padding: 16px 24px; background: #f9fafb; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
        Some articles are crafted with AI assistance and reviewed by our team to bring you fresh inspiration every week.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; background: #ffffff;">
      <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px;">
        Made with ❤️ by Cake AI Artist
      </p>
      <p style="margin: 0 0 8px; color: #9ca3af; font-size: 11px;">
        You're receiving this because you subscribed to our blog updates.
      </p>
      <a href="UNSUBSCRIBE_PLACEHOLDER" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">
        Unsubscribe
      </a>
    </div>
  </div>
</body>
</html>
`;

// Fallback posts if no database posts available
const fallbackPosts: BlogPost[] = [
  {
    id: "creative-cake-ideas-birthday",
    slug: "creative-cake-ideas-birthday",
    title: "10 Creative Cake Ideas for Birthday Celebrations",
    excerpt: "Stuck on what cake to make? Here are ten ideas that work for any birthday—from minimalist elegance to rainbow chaos.",
    featured_image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&h=300&fit=crop",
    category: "Ideas & Inspiration",
    is_ai_generated: false
  },
  {
    id: "perfect-birthday-messages",
    slug: "perfect-birthday-messages",
    title: "50 Birthday Message Ideas (Because 'HBD' Isn't Cutting It)",
    excerpt: "Finding the right words is harder than it looks. Here are messages sorted by relationship—boss, grandma, best friend.",
    featured_image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=300&fit=crop",
    category: "Writing Tips",
    is_ai_generated: false
  },
  {
    id: "cake-design-trends-2025",
    slug: "cake-design-trends-2025",
    title: "Cake Design Trends: What's Popular in 2025",
    excerpt: "Geometric patterns, vintage comebacks, and minimalism that refuses to die. Here's what's trending.",
    featured_image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=300&fit=crop",
    category: "Trends",
    is_ai_generated: false
  }
];

const handler = async (req: Request): Promise<Response> => {
  console.log("Weekly blog digest function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Helper to log task run
  const logTaskRun = async (status: string, resultMessage?: string, errorMessage?: string, recordsProcessed?: number) => {
    try {
      await supabase.from("scheduled_task_runs").insert({
        task_name: "weekly-blog-digest",
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

  // Log task start
  await logTaskRun('running');

  try {

    // Calculate one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Try to fetch recent published posts from database
    const { data: recentPosts, error: postsError } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, featured_image, category, is_ai_generated")
      .eq("is_published", true)
      .gte("published_at", oneWeekAgo.toISOString())
      .order("published_at", { ascending: false })
      .limit(3);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
    }

    // Use database posts if available, otherwise fallback
    const postsToSend: BlogPost[] = (recentPosts && recentPosts.length > 0) 
      ? recentPosts 
      : fallbackPosts;
    
    const hasNewAIContent = recentPosts && recentPosts.length > 0 && 
      recentPosts.some(p => p.is_ai_generated);

    console.log(`Using ${postsToSend.length} posts for digest (new AI content: ${hasNewAIContent})`);

    // Get active subscribers (include unsubscribe_token for secure unsubscribe links)
    const { data: subscribers, error: subError } = await supabase
      .from("blog_subscribers")
      .select("id, email, first_name, unsubscribe_token")
      .eq("is_active", true)
      .or("digest_frequency.eq.weekly,digest_frequency.is.null");

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw subError;
    }

    console.log(`Found ${subscribers?.length || 0} active subscribers`);

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        const firstName = subscriber.first_name || "there";
        
        // Build secure unsubscribe link using token
        const unsubscribeUrl = `https://cake-ai-artist.lovable.app/blog/unsubscribe?token=${subscriber.unsubscribe_token}`;

        const emailHtml = getWeeklyDigestEmail(firstName, postsToSend, hasNewAIContent)
          .replace('UNSUBSCRIBE_PLACEHOLDER', unsubscribeUrl);
        
        await resend.emails.send({
          from: "Cake AI Artist <blog@cakeaiartist.com>",
          to: [subscriber.email],
          subject: hasNewAIContent 
            ? "🆕 Fresh Cake Inspiration Just Published | Cake AI Artist"
            : "🍰 This Week's Cake Inspiration | Cake AI Artist",
          html: emailHtml,
        });

        // Update last digest sent timestamp
        await supabase
          .from("blog_subscribers")
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq("id", subscriber.id);

        console.log(`Email sent to ${subscriber.email}`);
        successCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${subscriber.email}:`, emailError);
        failCount++;
      }
    }

    console.log(`Digest complete: ${successCount} sent, ${failCount} failed`);

    // Log task success
    await logTaskRun('success', `Sent ${successCount} emails, ${failCount} failed`, null, successCount);

    return new Response(
      JSON.stringify({ 
        message: "Weekly digest sent",
        success: successCount,
        failed: failCount,
        postsIncluded: postsToSend.length,
        hasNewAIContent,
        records_processed: successCount
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in weekly digest function:", error);
    // Log task failure
    await logTaskRun('failed', null, error.message, 0);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

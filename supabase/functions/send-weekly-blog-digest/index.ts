import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
}

const getWeeklyDigestEmail = (firstName: string, posts: BlogPost[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>This Week's Cake Inspiration</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🍰 Cake AI Artist</h1>
      <p style="margin: 16px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Weekly Inspiration</p>
    </div>
    
    <!-- Greeting -->
    <div style="padding: 32px 24px 16px;">
      <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px;">Hey ${firstName}! 👋</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
        Here's your weekly dose of cake inspiration. We've handpicked the best articles just for you.
      </p>
    </div>
    
    <!-- Featured Posts -->
    <div style="padding: 16px 24px 32px;">
      ${posts.map(post => `
        <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 180px; object-fit: cover;">
          <div style="padding: 20px;">
            <span style="display: inline-block; background: linear-gradient(135deg, #fce7f3, #ede9fe); color: #7c3aed; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 16px; margin-bottom: 12px;">
              ${post.category}
            </span>
            <h3 style="margin: 0 0 12px; color: #111827; font-size: 18px; line-height: 1.4;">
              ${post.title}
            </h3>
            <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.6;">
              ${post.excerpt}
            </p>
            <a href="https://cakeaiartist.com/blog/${post.id}" style="display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">
              Read More →
            </a>
          </div>
        </div>
      `).join('')}
    </div>
    
    <!-- CTA Section -->
    <div style="background: linear-gradient(135deg, #fce7f3, #ede9fe); padding: 32px 24px; text-align: center;">
      <h3 style="margin: 0 0 8px; color: #111827; font-size: 20px;">Ready to Create Your Own?</h3>
      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
        Turn these ideas into reality with our AI cake designer.
      </p>
      <a href="https://cakeaiartist.com" style="display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">
        Try It Free 🎂
      </a>
    </div>
    
    <!-- Footer -->
    <div style="padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
        You're receiving this because you subscribed to Cake AI Artist blog updates.
      </p>
      <a href="https://cakeaiartist.com/blog/unsubscribe?email=EMAIL_PLACEHOLDER" style="color: #6b7280; font-size: 12px; text-decoration: underline;">
        Unsubscribe
      </a>
    </div>
  </div>
</body>
</html>
`;

// Curated popular posts for the digest
const featuredPosts: BlogPost[] = [
  {
    id: "creative-cake-ideas-birthday",
    title: "10 Creative Cake Ideas for Birthday Celebrations",
    excerpt: "Stuck on what cake to make? Here are ten ideas that work for any birthday—from minimalist elegance to rainbow chaos.",
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&h=300&fit=crop",
    category: "Ideas & Inspiration"
  },
  {
    id: "perfect-birthday-messages",
    title: "50 Birthday Message Ideas (Because 'HBD' Isn't Cutting It)",
    excerpt: "Finding the right words is harder than it looks. Here are messages sorted by relationship—boss, grandma, best friend.",
    image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&h=300&fit=crop",
    category: "Writing Tips"
  },
  {
    id: "cake-design-trends-2025",
    title: "Cake Design Trends: What's Popular in 2025",
    excerpt: "Geometric patterns, vintage comebacks, and minimalism that refuses to die. Here's what's trending.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=300&fit=crop",
    category: "Trends"
  }
];

const handler = async (req: Request): Promise<Response> => {
  console.log("Weekly blog digest function called");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active subscribers who want weekly digests
    const { data: subscribers, error: subError } = await supabase
      .from("blog_subscribers")
      .select("*")
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

        const emailHtml = getWeeklyDigestEmail(firstName, featuredPosts)
          .replace('EMAIL_PLACEHOLDER', encodeURIComponent(subscriber.email));
        
        await resend.emails.send({
          from: "Cake AI Artist <blog@cakeaiartist.com>",
          to: [subscriber.email],
          subject: "🍰 This Week's Cake Inspiration | Cake AI Artist",
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

    return new Response(
      JSON.stringify({ 
        message: "Weekly digest sent",
        success: successCount,
        failed: failCount 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in weekly digest function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

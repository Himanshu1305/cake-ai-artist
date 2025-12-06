import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { ArticleSchema } from "@/components/SEOSchema";

const BlogPost = () => {
  const { id } = useParams();

  // This would typically fetch from a CMS or database
  const post = {
    title: "10 Creative Cake Ideas for Birthday Celebrations",
    date: "November 20, 2025",
    readTime: "5 min read",
    category: "Ideas & Inspiration",
    content: `
      <p>So you're staring at a blank screen trying to figure out what cake to make. Welcome to the club. 
      With literally infinite possibilities, decision paralysis is real. That's why we put together this list—
      ten ideas that actually work, for birthdays of all ages and personalities.</p>

      <h2>1. The Minimalist One</h2>
      <p>Sometimes less is more. No, seriously. A clean, simple cake with elegant typography and maybe one accent color 
      can look stunning. Adults especially appreciate this when they've seen one too many rainbow explosion cakes.</p>
      <p>Good for: Milestone birthdays (30th, 40th, 50th), people who own a lot of white furniture, anyone who says 
      things like "I appreciate clean design."</p>

      <h2>2. Full Rainbow Chaos</h2>
      <p>The complete opposite. Every color. Everywhere. Kids lose their minds over this. Honestly, some adults do too. 
      There's something joyful about a cake that looks like a box of crayons exploded on it.</p>
      <p>Good for: Kids under 12, Pride celebrations, anyone who thinks "tasteful restraint" is boring.</p>

      <h2>3. Character Themes</h2>
      <p>Spider-Man. Elsa. Bluey. Pikachu. Whatever character they're obsessed with—lean into it. The AI handles 
      these pretty well, and seeing their favorite character on a cake makes kids (and honestly, some adults) 
      unreasonably happy.</p>
      <p>Good for: Kids with strong opinions, fans of specific franchises, themed parties.</p>

      <h2>4. Elegant Florals</h2>
      <p>Flowers never go out of style. A cake with delicate floral patterns looks timeless and romantic. 
      Works especially well for spring birthdays, but honestly, flowers work year-round.</p>
      <p>Good for: Spring celebrations, garden parties, anyone named Rose or Lily (okay that's a stretch but you get it).</p>

      <h2>5. Retro Vibes</h2>
      <p>80s neon. 70s groovy patterns. 50s diner aesthetic. Nostalgia sells. People love seeing design elements 
      from their childhood (or from before they were born, because retro is just... cool).</p>
      <p>Good for: Milestone birthdays, themed decades parties, people who unironically like disco.</p>

      <h2>6. Sports & Hobbies</h2>
      <p>Does the birthday person live and breathe soccer? Guitar? Gardening? Put it on the cake. When a cake 
      reflects someone's actual interests, it shows you paid attention. Even if you only remembered their birthday 
      this morning.</p>
      <p>Good for: Anyone with an obvious passion, sports fans, musicians, crafters.</p>

      <h2>7. Gold & Glam</h2>
      <p>Metallic accents, luxurious details, the kind of cake that looks like it costs $500. It doesn't. 
      But it looks like it might. Great for making someone feel fancy.</p>
      <p>Good for: Milestone birthdays, New Year's Eve birthdays, people who'd describe themselves as "extra."</p>

      <h2>8. The Funny One</h2>
      <p>Inside jokes. Playful roasts. A cake that says "You're old now, congrats." Not every cake needs to be 
      sentimental. Sometimes the best gift is making someone laugh.</p>
      <p>Good for: Friends with good humor, casual celebrations, anyone who'd rather laugh than cry about their age.</p>

      <h2>9. Memory-Inspired</h2>
      <p>Reference a specific memory or place. Their favorite vacation spot. A beloved pet. The restaurant where 
      you first met. These cakes feel deeply personal because they're rooted in real moments.</p>
      <p>Good for: Close relationships, sentimental occasions, people who keep photo albums.</p>

      <h2>10. Classic Never-Fail</h2>
      <p>Traditional birthday cake. Candles. "Happy Birthday" spelled out. You know the one. Sometimes classic 
      is classic for a reason. When in doubt, this works.</p>
      <p>Good for: When you're unsure, traditional families, literally any age.</p>

      <h2>Quick Decision Framework</h2>
      <p>Still stuck? Think about three things:</p>
      <ul>
        <li><strong>Their personality:</strong> Bold or understated? Funny or sincere? Let that guide you.</li>
        <li><strong>The occasion's vibe:</strong> Backyard BBQ energy is different from fancy dinner party energy.</li>
        <li><strong>Your relationship:</strong> Close friend gets the inside joke cake. Boss gets something safer.</li>
      </ul>

      <p>The nice thing about using Cake AI Artist is you can try all of these in like... 5 minutes. 
      Make a minimalist one, then rainbow, then character-themed. See what feels right. 
      You're not committing to anything until you download.</p>

      <h2>Final Thought</h2>
      <p>There's no wrong answer here. A cake with someone's name on it—any style—shows you thought about them. 
      That's the part that matters. Everything else is just aesthetics.</p>

      <p>Now go make something. You've got this.</p>
    `
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>{post.title} | Cake AI Artist Blog</title>
        <meta name="description" content="Stuck on what cake to make? Here are 10 ideas that work for any birthday—from minimalist elegance to rainbow chaos. Something for everyone." />
        <meta name="keywords" content="birthday cake ideas, cake design inspiration, creative cake designs" />
        <link rel="canonical" href={`https://cakeaiartist.com/blog/${id}`} />
        <meta property="og:title" content={`${post.title} | Cake AI Artist Blog`} />
        <meta property="og:description" content="Stuck on what cake to make? Here are 10 ideas that work for any birthday." />
        <meta property="og:url" content={`https://cakeaiartist.com/blog/${id}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Cake AI Artist`} />
        <meta name="twitter:description" content="Stuck on what cake to make? Here are 10 ideas that work for any birthday." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>
      
      <ArticleSchema 
        headline={post.title}
        description={post.title}
        datePublished={post.date}
        author="Cake AI Artist Team"
        url={`https://cakeaiartist.com/blog/${id}`}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <article className="bg-card/50 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-lg">
          <div className="mb-6">
            <span className="text-sm font-semibold text-party-purple">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <div 
            className="prose prose-lg max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              lineHeight: '1.8'
            }}
          />

          <div className="mt-12 pt-8 border-t border-border/50">
            <Link to="/">
              <Button size="lg">Alright, Let's Make a Cake</Button>
            </Link>
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">More Reading</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/blog/cake-design-trends-2025">
              <div className="p-6 bg-card/50 backdrop-blur-sm rounded-lg hover:shadow-xl transition-all">
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  Cake Design Trends: What's Popular in 2025
                </h3>
                <p className="text-sm text-muted-foreground">7 min read</p>
              </div>
            </Link>
            <Link to="/blog/perfect-birthday-messages">
              <div className="p-6 bg-card/50 backdrop-blur-sm rounded-lg hover:shadow-xl transition-all">
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  50 Birthday Message Ideas (Because 'HBD' Isn't Cutting It)
                </h3>
                <p className="text-sm text-muted-foreground">8 min read</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;
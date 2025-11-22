import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Footer } from "@/components/Footer";

const BlogPost = () => {
  const { id } = useParams();

  // This would typically fetch from a CMS or database
  const post = {
    title: "10 Creative Cake Ideas for Birthday Celebrations",
    date: "November 20, 2025",
    readTime: "5 min read",
    category: "Ideas & Inspiration",
    content: `
      <p>Ever stared at a blank screen, trying to figure out what kind of cake to create? You're not alone. 
      With thousands of possibilities, the paradox of choice can be paralyzing. That's why we've put together 
      this list of ten creative cake ideas that work for birthdays of all ages and personalities.</p>

      <h2>1. The Minimalist Masterpiece</h2>
      <p>Sometimes less really is more. A simple, elegant cake with clean lines and a single name in beautiful 
      typography can be stunning. Perfect for adults who appreciate sophistication over sugar-overload.</p>
      <p><strong>Best for:</strong> Milestone birthdays (30th, 40th, 50th), professional celebrations, minimalist aesthetics</p>

      <h2>2. Rainbow Explosion</h2>
      <p>Go full color spectrum with a vibrant, multi-layered rainbow cake design. Kids absolutely love this, 
      but honestly, who doesn't get excited about all the colors at once?</p>
      <p><strong>Best for:</strong> Children's birthdays, LGBTQ+ celebrations, anyone who loves color</p>

      <h2>3. Character-Themed Delight</h2>
      <p>Whether it's their favorite superhero, cartoon character, or movie theme, a character-themed cake 
      makes the birthday person feel truly seen. Our AI can incorporate themes naturally into the design.</p>
      <p><strong>Best for:</strong> Kids parties, fans of specific franchises, themed celebrations</p>

      <h2>4. Elegant Floral Design</h2>
      <p>Flowers never go out of style. A cake adorned with delicate floral patterns feels timeless and romantic. 
      Works beautifully for spring birthdays or garden party themes.</p>
      <p><strong>Best for:</strong> Women's birthdays, spring celebrations, garden parties, romantic occasions</p>

      <h2>5. Vintage Retro Style</h2>
      <p>Tap into nostalgia with a retro-inspired cake design. Think 80s neon, 70s groovy patterns, or 50s diner vibes. 
      It's a conversation starter and a trip down memory lane.</p>
      <p><strong>Best for:</strong> Milestone birthdays, themed parties, anyone who loves vintage aesthetics</p>

      <h2>6. Sports & Hobbies</h2>
      <p>Celebrate their passion by incorporating their favorite sport or hobby. From soccer balls to musical notes, 
      when a cake reflects someone's interests, it shows you really know them.</p>
      <p><strong>Best for:</strong> Athletes, musicians, hobbyists, anyone with a clear passion</p>

      <h2>7. Gold & Glam Luxury</h2>
      <p>Gold accents, metallic finishes, and luxurious details make a cake feel like a million bucks. 
      Perfect for those who appreciate the finer things in life.</p>
      <p><strong>Best for:</strong> Milestone birthdays, luxury-themed parties, special occasions</p>

      <h2>8. Funny & Quirky</h2>
      <p>Sometimes the best gift is a laugh. A cake with a funny message or quirky design can be exactly 
      what someone with a great sense of humor wants to see on their birthday.</p>
      <p><strong>Best for:</strong> Friends with good humor, casual celebrations, breaking the ice</p>

      <h2>9. Photo-Inspired Memory</h2>
      <p>While our AI generates artistic cakes, you can request elements that reference special memories. 
      Maybe their favorite travel destination, a beloved pet, or a meaningful symbol.</p>
      <p><strong>Best for:</strong> Sentimental occasions, close relationships, meaningful milestones</p>

      <h2>10. The Classic Never-Fail</h2>
      <p>There's a reason traditional birthday cakes with candles and "Happy Birthday" messaging remain popular. 
      They're universally recognized, instantly celebratory, and they just work. Sometimes classic is the right choice.</p>
      <p><strong>Best for:</strong> When you're unsure, traditional celebrations, all ages</p>

      <h2>How to Choose the Right Style</h2>
      <p>The best cake idea depends on three things:</p>
      <ul>
        <li><strong>The person's personality:</strong> Are they bold or understated? Funny or serious? Let that guide you.</li>
        <li><strong>The occasion's formality:</strong> A kid's backyard party calls for different energy than a milestone adult birthday dinner.</li>
        <li><strong>Your relationship:</strong> Close friends can pull off inside jokes. Professional relationships might need something more neutral.</li>
      </ul>

      <p>The beauty of Cake Magic Creator is that you can experiment with all these ideas in minutes. 
      Generate a minimalist design, then try a rainbow explosion, then go vintage—all without committing 
      until you find the one that feels just right.</p>

      <h2>Pro Tip: When in Doubt, Ask</h2>
      <p>If you're really stuck, there's no shame in subtly asking what they'd like. Sometimes the best gift 
      is exactly what someone asked for, presented in a way they didn't expect.</p>

      <p>Ready to try these ideas yourself? Head back to the creator and start experimenting. 
      You might surprise yourself with what resonates.</p>
    `
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
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
              <Button size="lg">Try Creating Your Own Cake</Button>
            </Link>
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">More Articles You Might Like</h2>
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
                  50 Birthday Message Ideas for Every Age and Relationship
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

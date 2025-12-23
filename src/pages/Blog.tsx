import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Blog = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for name if available
      let firstName = null;
      let lastName = null;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          firstName = profile.first_name;
          lastName = profile.last_name;
        }
      }
      
      // Upsert subscription (insert or update if exists)
      const { error } = await supabase
        .from('blog_subscribers')
        .upsert({
          email: email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          user_id: user?.id || null,
          is_active: true,
          unsubscribed_at: null,
        }, {
          onConflict: 'email',
        });

      if (error) {
        console.error('Subscription error:', error);
        toast({
          title: "Subscription failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "You're in!",
        description: "Thanks for subscribing. We'll keep the good stuff coming.",
      });
      
      setEmail("");
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const blogPosts = [
    // Holiday Blog Posts - Christmas & New Year
    {
      id: "american-christmas-cake-ideas",
      title: "American Christmas Cake Ideas: From Cozy Family Gatherings to Big Holiday Parties",
      excerpt: "Red and green classics, snowy wonderlands, and gingerbread dreams. Christmas cake designs that capture that American holiday magic.",
      date: "December 7, 2025",
      readTime: "7 min read",
      category: "Christmas Celebrations"
    },
    {
      id: "american-new-year-cake-ideas",
      title: "New Year's Eve Cake Ideas: Ring in 2026 American Style",
      excerpt: "Countdown clocks, champagne themes, and Times Square sparkle. Make your NYE celebration unforgettable with these cake ideas.",
      date: "December 7, 2025",
      readTime: "6 min read",
      category: "New Year Celebrations"
    },
    {
      id: "british-christmas-cake-ideas",
      title: "British Christmas Cake Ideas: From Elegant Festive Cakes to Proper Pudding Alternatives",
      excerpt: "Traditional British Christmas cake with a modern twist. Designs for Boxing Day gatherings, office parties, and proper festive celebrations.",
      date: "December 7, 2025",
      readTime: "7 min read",
      category: "Christmas Celebrations"
    },
    {
      id: "british-new-year-cake-ideas",
      title: "British New Year's Cake Ideas: Celebrate Hogmanay to Big Ben Chimes",
      excerpt: "From Scottish Hogmanay traditions to London's Thames fireworks vibes. New Year cake designs for celebrations across the UK.",
      date: "December 7, 2025",
      readTime: "6 min read",
      category: "New Year Celebrations"
    },
    {
      id: "canadian-christmas-cake-ideas",
      title: "Canadian Christmas Cake Ideas: Snowy Wonderland Designs for the Holidays",
      excerpt: "Maple-infused Christmas cakes, winter wonderland themes, and designs that embrace Canadian holiday traditions, eh?",
      date: "December 7, 2025",
      readTime: "7 min read",
      category: "Christmas Celebrations"
    },
    {
      id: "canadian-new-year-cake-ideas",
      title: "Canadian New Year's Eve Cake Ideas: Coast to Coast Celebrations",
      excerpt: "From Vancouver's first countdown to Newfoundland's last toast. New Year cake ideas for celebrating across Canada.",
      date: "December 7, 2025",
      readTime: "6 min read",
      category: "New Year Celebrations"
    },
    {
      id: "australian-christmas-cake-ideas",
      title: "Australian Christmas Cake Ideas: Summer Celebrations Down Under",
      excerpt: "Beach-ready Christmas cakes that handle the heat. Tropical twists on tradition for your Aussie summer celebrations.",
      date: "December 7, 2025",
      readTime: "7 min read",
      category: "Christmas Celebrations"
    },
    {
      id: "australian-new-year-cake-ideas",
      title: "Australian New Year's Eve Cake Ideas: Sydney Harbour Sparkle and Beyond",
      excerpt: "First in the world to celebrate! Summer NYE cakes featuring fireworks, beach vibes, and that iconic Aussie celebration spirit.",
      date: "December 7, 2025",
      readTime: "6 min read",
      category: "New Year Celebrations"
    },
    // Country-Specific Celebrations
    {
      id: "fourth-of-july-cake-ideas",
      title: "4th of July Cake Ideas That'll Make Your BBQ the Talk of the Block",
      excerpt: "Red, white, and blue cakes that don't look like a craft project gone wrong. Patriotic designs for Independence Day parties across America.",
      date: "December 5, 2025",
      readTime: "6 min read",
      category: "Seasonal Celebrations"
    },
    {
      id: "british-jubilee-royal-cakes",
      title: "Royal Celebration Cakes: From Garden Parties to Jubilee Bashes",
      excerpt: "Union Jack designs that actually look sophisticated, not tacky. Elegant British cake ideas for Jubilees, coronations, and proper celebrations.",
      date: "December 4, 2025",
      readTime: "6 min read",
      category: "Seasonal Celebrations"
    },
    {
      id: "canada-day-cake-ideas",
      title: "Canada Day Cake Ideas: Beyond Just Maple Leaves (But Also Some Maple Leaves)",
      excerpt: "Red and white designs, Canadian wildlife themes, and regional pride cakes for July 1st celebrations, eh?",
      date: "December 3, 2025",
      readTime: "6 min read",
      category: "Seasonal Celebrations"
    },
    {
      id: "australia-day-cake-ideas",
      title: "Australia Day Cake Ideas: Designs That Handle the Summer Heat",
      excerpt: "Aussie cake ideas from green and gold to beach BBQ vibes. Plus heat-proof tips because it's bloody hot in January.",
      date: "December 2, 2025",
      readTime: "6 min read",
      category: "Seasonal Celebrations"
    },
    // India-Specific Celebrations
    {
      id: "diwali-cake-ideas",
      title: "Diwali Cake Ideas: Light Up Your Festival of Lights Celebration",
      excerpt: "From diya-inspired designs to rangoli patterns and gold sparkle themes. Make your Diwali party shine with stunning cake ideas.",
      date: "December 7, 2025",
      readTime: "7 min read",
      category: "Indian Celebrations"
    },
    {
      id: "holi-cake-ideas",
      title: "Holi Cake Ideas: Colorful Cakes for the Festival of Colors",
      excerpt: "Rainbow splashes, powder paint effects, and vibrant designs that capture the joy of Holi. Get ready to celebrate with colour!",
      date: "December 7, 2025",
      readTime: "6 min read",
      category: "Indian Celebrations"
    },
    {
      id: "indian-christmas-cake-ideas",
      title: "Indian Christmas Cake Ideas: Fusion Festive Designs",
      excerpt: "Blend traditional Christmas themes with Indian flair. From Kerala plum cake vibes to modern Indo-Western fusion designs.",
      date: "December 7, 2025",
      readTime: "6 min read",
      category: "Christmas Celebrations"
    },
    {
      id: "indian-new-year-cake-ideas",
      title: "Indian New Year's Eve Cake Ideas: Ring in 2026 Desi Style",
      excerpt: "From Bollywood glamour to fusion fireworks. New Year cake designs that celebrate with that unmistakable Indian flair.",
      date: "December 7, 2025",
      readTime: "6 min read",
      category: "New Year Celebrations"
    },
    {
      id: "creative-cake-ideas-birthday",
      title: "10 Creative Cake Ideas for Birthday Celebrations",
      excerpt: "Stuck on what kind of cake to make? Same. Here are ten ideas that actually work, from minimalist elegance to rainbow chaos. Something for everyone.",
      date: "November 20, 2025",
      readTime: "5 min read",
      category: "Ideas & Inspiration"
    },
    {
      id: "cake-design-trends-2025",
      title: "Cake Design Trends: What's Popular in 2025",
      excerpt: "Geometric patterns are still having a moment. Vintage is back. Minimalism refuses to die. Here's what we're seeing people create most.",
      date: "November 18, 2025",
      readTime: "7 min read",
      category: "Trends"
    },
    {
      id: "ai-vs-traditional-cake-design",
      title: "AI vs Traditional Cake Design: What Actually Changed",
      excerpt: "A few years ago this wasn't even possible. Now it is. Here's an honest look at what AI does well and where it still falls short.",
      date: "November 15, 2025",
      readTime: "6 min read",
      category: "Technology"
    },
    {
      id: "perfect-birthday-messages",
      title: "50 Birthday Message Ideas (Because 'HBD' Isn't Cutting It)",
      excerpt: "Finding the right words is harder than it looks. Here are messages sorted by relationship—boss, grandma, best friend, that cousin you barely know.",
      date: "November 12, 2025",
      readTime: "8 min read",
      category: "Writing Tips"
    },
    {
      id: "virtual-party-guide",
      title: "How to Make Virtual Birthday Parties Actually Fun",
      excerpt: "Video call birthdays can feel awkward. They don't have to. Here's what works based on parties that didn't make everyone want to close their laptops.",
      date: "November 10, 2025",
      readTime: "6 min read",
      category: "Party Planning"
    },
    {
      id: "last-minute-birthday-solutions",
      title: "Last-Minute Birthday Saves: A Panic-Free Guide",
      excerpt: "It's the day of. You forgot. Deep breaths. Here's exactly what to do in the next 10 minutes to not look like a terrible person.",
      date: "November 8, 2025",
      readTime: "4 min read",
      category: "Quick Tips"
    },
    {
      id: "personalized-cakes-psychology",
      title: "Why Personalized Cakes Hit Different (The Psychology Behind It)",
      excerpt: "There's actual science behind why seeing your name on a cake feels so good. Something about being seen. Here's what the research says.",
      date: "November 5, 2025",
      readTime: "6 min read",
      category: "Psychology"
    },
    {
      id: "anniversary-cake-ideas",
      title: "Anniversary Cake Ideas Your Partner Won't Forget",
      excerpt: "Birthdays get all the attention. But anniversary cakes? Underrated. Here's how to make yours memorable without going overboard.",
      date: "November 3, 2025",
      readTime: "5 min read",
      category: "Anniversary"
    },
    {
      id: "kids-birthday-cakes-guide",
      title: "Kids' Birthday Cakes: What Actually Works (From Someone Who's Made 100+)",
      excerpt: "Kids are honest. Brutally so. After years of trial and error, here's what consistently gets the 'wow' reaction.",
      date: "October 30, 2025",
      readTime: "7 min read",
      category: "Party Planning"
    },
    {
      id: "cake-message-writing-tips",
      title: "How to Write a Cake Message That Doesn't Sound Generic",
      excerpt: "Happy Birthday. Congrats. Best Wishes. Yawn. Here's how to write something they'll actually remember.",
      date: "October 28, 2025",
      readTime: "5 min read",
      category: "Writing Tips"
    },
    {
      id: "first-birthday-cake-ideas",
      title: "First Birthday Cake Ideas (For Tired Parents)",
      excerpt: "Your baby won't remember this. You will. Here's how to make it special without losing your mind.",
      date: "October 25, 2025",
      readTime: "5 min read",
      category: "Ideas & Inspiration"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Blog - Cake Ideas, Tips & Actually Useful Stuff | Cake AI Artist</title>
        <meta name="description" content="Birthday fails, design trends, party hacks—the stuff we wish someone told us. Plus some AI cake nerding if you're into that." />
        <meta name="keywords" content="cake design blog, birthday cake tips, virtual cake trends, celebration inspiration, cake message ideas, anniversary cakes" />
        <link rel="canonical" href="https://cakeaiartist.com/blog" />
        <meta property="og:title" content="Blog - Cake Ideas, Tips & Actually Useful Stuff | Cake AI Artist" />
        <meta property="og:description" content="Birthday fails, design trends, party hacks—the stuff we wish someone told us." />
        <meta property="og:url" content="https://cakeaiartist.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - Cake Ideas, Tips & Actually Useful Stuff" />
        <meta name="twitter:description" content="Birthday fails, design trends, party hacks—the stuff we wish someone told us." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>
      
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4 max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">

        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Cake Ideas & Tips</h1>
          <p className="text-muted-foreground text-xl max-w-2xl">
            Stuff we've learned, trends we've noticed, and ideas worth stealing. 
            No fluff, just useful things.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="h-full p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer group">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-party-purple">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold mb-3 text-foreground group-hover:text-party-purple transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 text-center bg-gradient-to-r from-party-purple/20 to-party-pink/20 p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Want More?</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            New ideas, tips, and the occasional discount code. We email like once a week max. 
            Unsubscribe anytime—no hard feelings.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              className="flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-party-purple"
            />
            <Button 
              size="lg" 
              onClick={handleSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;

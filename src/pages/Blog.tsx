import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Blog = () => {
  const blogPosts = [
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Blog - Cake Ideas, Tips & Actually Useful Stuff | Cake AI Artist</title>
        <meta name="description" content="Birthday fails, design trends, party hacks—the stuff we wish someone told us. Plus some AI cake nerding if you're into that." />
        <meta name="keywords" content="cake design blog, birthday cake tips, virtual cake trends, celebration inspiration" />
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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

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
              className="flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-party-purple"
            />
            <Button size="lg">Subscribe</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
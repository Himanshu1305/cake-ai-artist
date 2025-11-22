import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

const Blog = () => {
  const blogPosts = [
    {
      id: "creative-cake-ideas-birthday",
      title: "10 Creative Cake Ideas for Birthday Celebrations",
      excerpt: "Stuck on what kind of cake to create? Here are ten unique ideas that'll make any birthday unforgettable, from minimalist elegance to over-the-top extravagance.",
      date: "November 20, 2025",
      readTime: "5 min read",
      category: "Ideas & Inspiration"
    },
    {
      id: "cake-design-trends-2025",
      title: "Cake Design Trends: What's Popular in 2025",
      excerpt: "The world of cake design is evolving. Discover the hottest trends from geometric patterns to vintage aesthetics that are dominating celebrations this year.",
      date: "November 18, 2025",
      readTime: "7 min read",
      category: "Trends"
    },
    {
      id: "ai-vs-traditional-cake-design",
      title: "AI vs Traditional Cake Design: The Future of Celebrations",
      excerpt: "How is AI changing the way we think about cake design? Explore the benefits and limitations of technology-driven personalization versus traditional methods.",
      date: "November 15, 2025",
      readTime: "6 min read",
      category: "Technology"
    },
    {
      id: "perfect-birthday-messages",
      title: "50 Birthday Message Ideas for Every Age and Relationship",
      excerpt: "Finding the right words matters. Whether it's your boss, your best friend, or your grandmother, we've got message ideas that hit the right tone every time.",
      date: "November 12, 2025",
      readTime: "8 min read",
      category: "Writing Tips"
    },
    {
      id: "virtual-party-guide",
      title: "Planning a Virtual Birthday Party? Here's How to Make It Special",
      excerpt: "Distance doesn't have to mean boring. Learn how to create meaningful virtual celebrations that feel just as special as in-person gatherings.",
      date: "November 10, 2025",
      readTime: "6 min read",
      category: "Party Planning"
    },
    {
      id: "last-minute-birthday-solutions",
      title: "Last-Minute Birthday Solutions: Create a Perfect Cake in Minutes",
      excerpt: "Forgot someone's birthday? Don't panic. Here's your step-by-step guide to pulling together something thoughtful when you're short on time.",
      date: "November 8, 2025",
      readTime: "4 min read",
      category: "Quick Tips"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Cake Magic Blog</h1>
          <p className="text-muted-foreground text-xl max-w-2xl">
            Ideas, tips, and inspiration for making every celebration more special. 
            From design trends to party planning hacks, we've got you covered.
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
          <h2 className="text-3xl font-bold mb-4 text-foreground">Stay Updated</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Get the latest tips, trends, and celebration ideas delivered to your inbox. 
            No spam, just good stuff. Promise.
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

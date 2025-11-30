import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Cake, Heart, GraduationCap, Baby, Briefcase, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const UseCases = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Use Cases - Cake Designs for Every Celebration | Cake AI Artist</title>
        <meta name="description" content="Discover how to create stunning cakes for birthdays, anniversaries, graduations, and more. Perfect AI-generated designs for every celebration." />
        <meta name="keywords" content="virtual cake examples, cake designs, birthday cake ideas, anniversary cake, celebration designs" />
        <link rel="canonical" href="https://cakeaiartist.com/use-cases" />
        <meta property="og:url" content="https://cakeaiartist.com/use-cases" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Cake Designs for Every Celebration</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Whether it&apos;s a milestone moment or a simple &quot;just because,&quot; create something special for any occasion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Birthday Parties */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-purple to-party-pink rounded-lg flex items-center justify-center mb-4">
              <Cake className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Birthday Parties</h2>
            <p className="text-muted-foreground mb-4">
              From sweet sixteen to sixty and beyond. Create age-appropriate designs that match the personality of the birthday person. 
              Kids love seeing their name on a colorful cake, and adults appreciate the thoughtful touch.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>Popular for:</strong> Kids birthdays, milestone birthdays (30th, 40th, 50th), surprise parties, virtual celebrations
            </div>
          </Card>

          {/* Anniversaries */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-pink to-party-orange rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Anniversaries</h2>
            <p className="text-muted-foreground mb-4">
              Celebrate love, whether it's one year or fifty. Our AI creates romantic, elegant designs perfect for couples. 
              Add both names or keep it classic with "Happy Anniversary."
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>Popular for:</strong> Wedding anniversaries, dating anniversaries, work anniversaries, friendship milestones
            </div>
          </Card>

          {/* Graduations */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-orange to-party-yellow rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Graduations</h2>
            <p className="text-muted-foreground mb-4">
              Honor academic achievements with sophisticated designs. Whether it's kindergarten or college, 
              make graduates feel proud with a personalized cake image they can cherish.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>Popular for:</strong> High school graduation, college graduation, master's degree, PhD, professional certifications
            </div>
          </Card>

          {/* Baby Showers */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-yellow to-party-purple rounded-lg flex items-center justify-center mb-4">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Baby Showers & New Baby</h2>
            <p className="text-muted-foreground mb-4">
              Welcome the newest family member with adorable, gender-appropriate designs. 
              Perfect for baby showers, gender reveal parties, or celebrating a newborn's arrival.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>Popular for:</strong> Baby shower invitations, gender reveal parties, "Welcome Baby" celebrations, first birthdays
            </div>
          </Card>

          {/* Corporate Events */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-purple to-party-pink rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Corporate Events</h2>
            <p className="text-muted-foreground mb-4">
              Professional yet celebratory designs for work milestones. Recognize team achievements, welcome new employees, 
              or celebrate company anniversaries with elegant, business-appropriate cakes.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>Popular for:</strong> Employee appreciation, retirement parties, team celebrations, company milestones, promotions
            </div>
          </Card>

          {/* Group Celebrations */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-pink to-party-orange rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Group Celebrations</h2>
            <p className="text-muted-foreground mb-4">
              Celebrating multiple people or a team? Our AI handles group names beautifully. 
              Perfect for class parties, team events, or celebrating multiple birthdays at once.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>Popular for:</strong> Class celebrations, team parties, family reunions, friend group events, multiple birthdays
            </div>
          </Card>
        </div>

        {/* Real-Life Examples Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Real Stories from Our Users</h2>
          
          <div className="space-y-6">
            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-party-purple/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👩‍💼</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Sarah's Last-Minute Save</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    "I completely forgot about my coworker's retirement party until the morning of. I needed something thoughtful but fast. 
                    Used Cake AI Artist to make a personalized cake image for the digital slideshow. Everyone thought I'd spent hours on it. 
                    It took me literally two minutes."
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">— Sarah M., Event Coordinator</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-party-pink/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Marcus Celebrates 30 Students</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    "As a teacher, I wanted to do something special for each graduating student. Creating 30 personalized cake images would've been impossible with traditional methods. 
                    With the premium plan, I generated a unique design for each student in under an hour. They loved seeing their names in such a creative format."
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">— Marcus J., High School Teacher</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-party-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎂</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Lisa's Virtual Party Solution</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    "My mom's 60th birthday happened during a time when we couldn't gather in person. I used Cake AI Artist to design a beautiful cake image, 
                    printed it on a poster board, and shipped it to her. During our video call, she held it up and we all sang together. It made the virtual celebration feel more real."
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">— Lisa T., Daughter & Party Planner</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Ideas by Occasion */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">More Ways to Use Cake AI Artist</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Social Media Posts</h3>
              <p className="text-muted-foreground mb-3">
                Create eye-catching birthday posts for Instagram, Facebook, or X. Much more engaging than a generic "Happy Birthday" text post.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Works great for: Birthday shoutouts, anniversary posts, congratulations messages
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Digital Invitations</h3>
              <p className="text-muted-foreground mb-3">
                Add a personal touch to email invitations or e-vites. The cake image makes the invitation feel more festive and intentional.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Works great for: Birthday party invites, anniversary dinners, celebration announcements
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Office Celebrations</h3>
              <p className="text-muted-foreground mb-3">
                Print and display for cubicle decorations, add to presentation slides, or use in company newsletters to recognize employees.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Works great for: Employee birthdays, work anniversaries, team wins, retirement parties
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Party Decorations</h3>
              <p className="text-muted-foreground mb-3">
                Print in various sizes for banners, table centerpieces, photo booth backdrops, or even as part of a larger decoration theme.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Works great for: Kids parties, milestone birthdays, themed celebrations, surprise parties
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-party-purple/20 to-party-pink/20 p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4 text-foreground">What Will You Celebrate?</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            No matter the occasion, we'll help you make it memorable. Start creating your personalized cake now.
          </p>
          <Link to="/">
            <Button size="lg" className="text-lg px-8">
              Create Your Cake
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UseCases;

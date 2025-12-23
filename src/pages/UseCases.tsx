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
        <title>Use Cases - Real Ways People Use Virtual Cake Designs | Cake AI Artist</title>
        <meta name="description" content="From last-minute birthday saves to corporate celebrations—here's how people are actually using AI-generated cakes. Some of these surprised even us." />
        <meta name="keywords" content="virtual cake examples, AI cake designs, birthday cake ideas, anniversary cake, celebration cake designs" />
        <link rel="canonical" href="https://cakeaiartist.com/use-cases" />
        <meta property="og:title" content="Use Cases - Real Ways People Use Virtual Cake Designs | Cake AI Artist" />
        <meta property="og:description" content="From last-minute birthday saves to corporate celebrations—here's how people are actually using AI-generated cakes." />
        <meta property="og:url" content="https://cakeaiartist.com/use-cases" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Use Cases - Real Ways People Use Virtual Cake Designs" />
        <meta name="twitter:description" content="From last-minute birthday saves to corporate celebrations—here's how people are actually using AI-generated cakes." />
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

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Cake Designs for Every Celebration</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Whether it's a big milestone or just a random Tuesday, here's how people are using this thing.
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
              This is the big one, obviously. Whether your kid's turning 7 or your dad's hitting 60, 
              people love seeing their name on a gorgeous cake. Kids especially go nuts for it.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>People use it for:</strong> Kids birthdays, milestone ages (30th, 40th, 50th), surprise parties, virtual celebrations when you can't be there in person
            </div>
          </Card>

          {/* Anniversaries */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-pink to-party-orange rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Anniversaries</h2>
            <p className="text-muted-foreground mb-4">
              The AI gets romantic when you tell it to. One year or fifty, wedding anniversaries come out 
              looking elegant and heartfelt. You can add both names or keep it simple.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>People use it for:</strong> Wedding anniversaries, dating anniversaries, work anniversaries (yes, really), friendship milestones
            </div>
          </Card>

          {/* Graduations */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-orange to-party-yellow rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Graduations</h2>
            <p className="text-muted-foreground mb-4">
              Kindergarten to PhD—people celebrate all of them. The designs get appropriately sophisticated 
              depending on the level. A preschool graduation looks different from a law school one. Obviously.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>People use it for:</strong> High school, college, master's, PhD, professional certifications, even driver's license celebrations (we've seen it)
            </div>
          </Card>

          {/* Baby Showers */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-yellow to-party-purple rounded-lg flex items-center justify-center mb-4">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Baby Showers & New Baby</h2>
            <p className="text-muted-foreground mb-4">
              Adorable designs for welcoming the newest tiny human. Works great for gender reveals too, 
              though honestly the babies don't care about the cake. The parents do though.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>People use it for:</strong> Baby shower invitations, gender reveals, "Welcome Baby" celebrations, first birthdays
            </div>
          </Card>

          {/* Corporate Events */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-purple to-party-pink rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Corporate Events</h2>
            <p className="text-muted-foreground mb-4">
              Work appropriate but still celebratory. HR people love this for employee recognition. 
              Way more thoughtful than a generic "congrats" email.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>People use it for:</strong> Employee appreciation, retirement parties, team wins, company milestones, promotions
            </div>
          </Card>

          {/* Group Celebrations */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-party-pink to-party-orange rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Group Celebrations</h2>
            <p className="text-muted-foreground mb-4">
              Celebrating a whole team or class? The AI handles multiple names pretty well. 
              We've seen "The Marketing Team" and "Mrs. Johnson's 3rd Grade Class" and they look great.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>People use it for:</strong> Class celebrations, team parties, family reunions, friend group events, offices with three people who share a birthday month
            </div>
          </Card>
        </div>

        {/* Real-Life Examples Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Real Stories (We Didn't Make These Up)</h2>
          
          <div className="space-y-6">
            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-party-purple/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👩‍💼</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Sarah's "Oh Crap" Moment</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    "So I completely blanked on my coworker's retirement party. Like, the morning of. I needed something 
                    for the slideshow and I had maybe 10 minutes. Pulled up Cake AI Artist, typed his name, clicked a few things, 
                    and... it actually looked professional? Everyone asked who designed it. I just smiled and changed the subject."
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
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Marcus and His 30 Students</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    "I teach high school. Graduation comes around, I wanted to do something personal for each kid. 
                    30 personalized cake designs would've been impossible. With premium, I did all 30 in like... an hour? 
                    Some of them actually cried. Which was unexpected but kind of amazing."
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
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Lisa's Long-Distance Birthday</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    "Mom's 60th birthday. I couldn't fly out, which sucked. So I made this really pretty cake design, 
                    got it printed on a poster, and shipped it to her. During the video call she held it up and we all sang. 
                    It sounds corny but it actually made the whole thing feel more real? She kept the poster."
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">— Lisa T., Daughter & Party Planner</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Ideas by Occasion */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">More Ideas (Because You're Here)</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Social Media Posts</h3>
              <p className="text-muted-foreground mb-3">
                Way better than just typing "Happy Birthday" in a text post. The image grabs attention. 
                People actually stop scrolling.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Works great for: Birthday shoutouts, anniversary posts, congratulations messages, basically any occasion you'd post about
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Digital Invitations</h3>
              <p className="text-muted-foreground mb-3">
                Add the cake image to your e-vite or email invite. Makes it feel more intentional than just a calendar link.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Works great for: Birthday party invites, anniversary dinners, celebration announcements
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Office Celebrations</h3>
              <p className="text-muted-foreground mb-3">
                Print it out for cubicle decorations, slide it into a presentation, throw it in the company newsletter. 
                Makes HR look like they put in effort.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Works great for: Employee birthdays, work anniversaries, team wins, retirements
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Party Decorations</h3>
              <p className="text-muted-foreground mb-3">
                Print various sizes—banners, table centerpieces, photo booth backdrops. Some people get creative.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Works great for: Kids parties, milestone birthdays, themed celebrations, surprise parties
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-party-purple/20 to-party-pink/20 p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4 text-foreground">What Are You Celebrating?</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Doesn't have to be anything huge. Sometimes "it's Tuesday" is reason enough.
          </p>
          <Link to="/">
            <Button size="lg" className="text-lg px-8">
              Make a Cake
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UseCases;
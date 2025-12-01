import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Type, Sparkles, Download, Share2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>How to Create a Personalized Cake in 30 Seconds | Cake AI Artist</title>
        <meta name="description" content="Learn how easy it is to create stunning personalized cakes. Enter a name, choose an occasion, and let AI generate 3 beautiful views. Step-by-step guide." />
        <meta name="keywords" content="how to create virtual cake, cake design tutorial, AI cake generator guide" />
        <link rel="canonical" href="https://cakeaiartist.com/how-it-works" />
        <meta property="og:url" content="https://cakeaiartist.com/how-it-works" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">How to Create Your Perfect Cake in 30 Seconds</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Creating personalized cakes has never been easier. Here&apos;s how you go from idea to image in half a minute.
          </p>
        </div>

        {/* Step-by-step Guide */}
        <div className="space-y-12 mb-16">
          <Card className="p-8 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-party-purple to-party-pink rounded-full flex items-center justify-center">
                <Type className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-foreground">Step 1: Enter a Name</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Start by typing in the name you want on the cake. Could be "Sarah," "Mom," "Class of 2025," or even "Happy Anniversary." 
                  Our AI works with any name or short message you throw at it.
                </p>
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Pro tip:</strong> Keep it to 1-3 words for the best-looking results. Longer messages work too, but short and sweet usually looks more elegant.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-party-pink to-party-orange rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-foreground">Step 2: Choose Your Occasion</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Tell us what you're celebrating—birthday, anniversary, graduation, or just because. This helps our AI pick the right style, 
                  colors, and message tone. A kids' birthday cake should look different from a 50th wedding anniversary, right?
                </p>
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Pro tip:</strong> The AI considers age appropriateness too. A cake for "Emma's 5th Birthday" will have a more playful design 
                    than "Emma's 30th Birthday." Feel free to be specific in your input.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-party-orange to-party-yellow rounded-full flex items-center justify-center">
                <Download className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-foreground">Step 3: Generate & Download</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Hit that "Create My Cake" button and wait about 30 seconds. Our AI will generate <strong>three unique cake views</strong> 
                  (Front View, Side View, and Top-Down View), each showing your cake from a different angle. Pick your favorite, 
                  download it in high quality, and you're done.
                </p>
                <div className="bg-background/50 p-4 rounded-lg border border-border/50 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Pro tip:</strong> Don't love what you see? Just hit generate again. Each generation gives you completely new designs.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>✨ Special for First 200 Members:</strong> The first 200 members (New Year Lifetime Deal) get <strong>unlimited generations forever</strong>—they'll never pay another cent. 
                    Regular premium subscribers get 150 generations per year.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>💡 New Feature:</strong> Don't love one specific view? Click the <strong>"Regenerate"</strong> button on any image 
                    to regenerate just that angle without redoing all three!
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-r from-party-purple/20 to-party-pink/20 border-2 border-party-purple/30 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-party-pink to-party-purple rounded-full flex items-center justify-center">
                <Type className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-foreground flex items-center gap-2">
                  Step 3.5: Your Name Appears Automatically! ✨
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>No editing needed!</strong> Our AI intelligently places the recipient's name directly on the cake 
                  as beautiful fondant/icing lettering during generation. The AI analyzes each cake design and positions the text 
                  for optimal visibility and style—just like a real custom cake decorator would.
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-party-pink font-bold">🎂</span>
                    <span>Text is rendered <strong>as part of the cake</strong>, not overlaid afterward</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-party-purple font-bold">🎨</span>
                    <span>AI chooses fonts and colors that <strong>complement the design</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold font-bold">📍</span>
                    <span>Text placement is <strong>optimized per view</strong> (front, side, top-down)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-party-coral font-bold">✨</span>
                    <span>Includes both <strong>occasion greetings</strong> ("Happy Birthday") and the <strong>recipient's name</strong></span>
                  </li>
                </ul>
                <div className="bg-party-purple/10 p-4 rounded-lg border border-party-purple/30">
                  <p className="text-sm text-foreground font-semibold mb-1">
                    💡 Pro tip: Short Names Work Best
                  </p>
                  <p className="text-sm text-muted-foreground">
                    While you can use longer messages, shorter names (1-3 words) tend to look more elegant and readable on the cake. 
                    Think "Jessica" rather than "Jessica Marie Thompson." The AI renders them as realistic fondant lettering!
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-party-coral to-party-mint rounded-full flex items-center justify-center">
                <span className="text-4xl">📸</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-foreground flex items-center gap-2">
                  Step 3.6: Add Photos to Your Cake
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Upload your photo during cake creation!</strong> Simply upload a photo in the form before clicking "Create My Cake," 
                  and our AI will automatically integrate it as an <strong>edible photo print on the Top-Down View</strong> during generation.
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-party-coral font-bold">🎂</span>
                    <span>Photo is <strong>baked into the design</strong> during AI generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-party-mint font-bold">⭕</span>
                    <span>Automatically formatted as a <strong>circular edible print</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-party-purple font-bold">📍</span>
                    <span>Placed on the <strong>Top-Down View only</strong> to showcase the photo prominently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-party-pink font-bold">✨</span>
                    <span>Name appears on a decorative <strong>ribbon or banner</strong> across the photo</span>
                  </li>
                </ul>
                <div className="bg-party-coral/10 p-4 rounded-lg border border-party-coral/30">
                  <p className="text-sm text-foreground font-semibold mb-1">
                    💡 Pro tip: Photos Integrated During Generation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload your photo during cake creation, and the AI automatically integrates it as a beautiful edible print 
                    covering the entire top surface—just like a real custom cake! The photo appears as a large circular print 
                    that fills the top view, with the recipient's name elegantly placed on a decorative banner. 
                    Works best with portrait photos or square images! 🎂✨
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-party-yellow to-party-purple rounded-full flex items-center justify-center">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-foreground">Step 4: Share & Celebrate</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Now the fun part! When you download or share, you get a beautiful <strong>Cake Card</strong>—a professionally 
                  designed card featuring your stunning cake image along with the AI-generated personalized message. 
                  It's perfect for sharing on Instagram, WhatsApp, Facebook, or any social platform. Print it for decorations, 
                  add it to digital invitations, or use it however you want. The card is yours to keep forever.
                </p>

                {/* Platform-specific callouts */}
                <div className="space-y-3 mb-4">
                  {/* Mobile callout */}
                  <div className="bg-party-mint/10 p-4 rounded-lg border border-party-mint/30">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">📱</span>
                      <div>
                        <p className="font-semibold text-foreground mb-1">On Mobile (Easy Direct Share)</p>
                        <p className="text-sm text-muted-foreground">
                          Tap the <strong>"Share"</strong> button and share directly to any app—no download needed! 
                          Goes straight to WhatsApp, Instagram Stories, Messages, and more. The native share sheet opens automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop callout */}
                  <div className="bg-party-purple/10 p-4 rounded-lg border border-party-purple/30">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">💻</span>
                      <div>
                        <p className="font-semibold text-foreground mb-1">On Desktop (Download First)</p>
                        <p className="text-sm text-muted-foreground">
                          Click <strong>"Download"</strong> to save the Cake Card to your computer, then upload it to your 
                          preferred social media platform. Perfect for high-quality prints or adding to digital invitations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Pro tip:</strong> Free users can use Cake Cards for personal purposes. If you're planning to use them commercially 
                    (for your business, client work, etc.), you'll need a premium subscription for the commercial license.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tips & Tricks Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Tips for Best Results</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Be Specific About the Occasion</h3>
              <p className="text-muted-foreground">
                Instead of just "birthday," try "5th birthday party" or "milestone 40th birthday." 
                The more context you give, the better the AI can tailor the design.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Experiment with Different Styles</h3>
              <p className="text-muted-foreground">
                Try generating multiple times to see different design approaches. You might be surprised by what the AI comes up with. 
                Sometimes the third or fourth try is the perfect one.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Keep Names Short</h3>
              <p className="text-muted-foreground">
                While you can use longer messages, shorter names (1-3 words) tend to look more elegant and readable on the cake design. 
                Think "Jessica" rather than "Jessica Marie Thompson."
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Download in High Quality</h3>
              <p className="text-muted-foreground">
                Always download the full-resolution image. It&apos;s optimized for both digital sharing and printing, 
                so you won&apos;t lose quality no matter how you use it.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Save to Your Gallery</h3>
              <p className="text-muted-foreground">
                Create a free account to save your favorite designs to your personal gallery. You can access them anytime, 
                re-download them, or even feature them on our homepage to share with the community!
              </p>
            </Card>
          </div>
        </div>

        {/* Common Mistakes Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Common Mistakes to Avoid</h2>
          <div className="space-y-4">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Using All Caps</h3>
              <p className="text-muted-foreground">
                "HAPPY BIRTHDAY" looks more shouty than celebratory. Use normal capitalization for a more elegant look. 
                The AI handles text styling automatically.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Being Too Vague</h3>
              <p className="text-muted-foreground">
                Just entering "party" doesn't give the AI much to work with. Is it a birthday? Graduation? Add context for better results.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Not Saving Your Favorites</h3>
              <p className="text-muted-foreground">
                Found the perfect design? Download it immediately or save it to your account. Don&apos;t rely on generating the exact same design again—
                each generation is unique.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-gold/10 to-party-pink/10 border-2 border-gold/30">
              <h3 className="font-semibold text-lg mb-2 text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-gold fill-gold" />
                Get Featured on Our Homepage
              </h3>
              <p className="text-muted-foreground">
                Create an account and click the star icon ⭐ on any of your saved images to feature them on our homepage! 
                Your best cake designs will appear in the community carousel for everyone to see. It&apos;s a great way to 
                showcase your creativity and inspire other users!
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-party-purple/20 to-party-pink/20 p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Try It Yourself?</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Now that you know how it works, create your first personalized cake. It takes less than a minute.
          </p>
          <Link to="/">
            <Button size="lg" className="text-lg px-8">
              Create Your First Cake
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;

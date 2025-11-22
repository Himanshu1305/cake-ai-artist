import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Type, Sparkles, Download, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">How It Works</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Creating a personalized cake has never been easier. Here's how you go from idea to image in 30 seconds.
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
                  Hit that "Create My Cake" button and wait about 20 seconds. Our AI will generate four unique cake designs, 
                  each with slightly different styles, colors, and messages. Pick your favorite, download it in high quality, 
                  and you're done.
                </p>
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Pro tip:</strong> Don't love what you see? Just hit generate again. Each generation gives you completely new designs. 
                    Premium users can do this unlimited times until they find the perfect one.
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
                  Now the fun part. Share your cake image on social media, print it for decorations, add it to digital invitations, 
                  or use it however you want. The image is yours to keep forever.
                </p>
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Pro tip:</strong> Free users can use images for personal purposes. If you're planning to use them commercially 
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
                Always download the full-resolution image. It's optimized for both digital sharing and printing, 
                so you won't lose quality no matter how you use it.
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
                Found the perfect design? Download it immediately or save it to your account. Don't rely on generating the exact same design again—
                each generation is unique.
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

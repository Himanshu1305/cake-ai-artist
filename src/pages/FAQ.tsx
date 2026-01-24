import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FAQSchema, BreadcrumbSchema } from "@/components/SEOSchema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>FAQ - Got Questions? We've Got Answers | Cake AI Artist</title>
        <meta name="description" content="Wondering how it all works? Here's the stuff people ask us most—from pricing to features to 'wait, is this actually free?' Yes. Yes it is." />
        <meta name="keywords" content="cake AI FAQ, virtual cake questions, cake designer help, design support" />
        <link rel="canonical" href="https://cakeaiartist.com/faq" />
        <meta property="og:title" content="FAQ - Got Questions? We've Got Answers | Cake AI Artist" />
        <meta property="og:description" content="Wondering how it all works? Here's the stuff people ask us most." />
        <meta property="og:url" content="https://cakeaiartist.com/faq" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FAQ - Got Questions? We've Got Answers" />
        <meta name="twitter:description" content="Wondering how it all works? Here's the stuff people ask us most." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>
      
      <FAQSchema 
        faqs={[
          {
            question: "How do I create my first cake?",
            answer: "Super simple. Type a name, pick an occasion, hit generate. About 30 seconds later you've got three different views of your cake. Pick your favorite, download it. Done."
          },
          {
            question: "Do I need to create an account?",
            answer: "Nope! Try it without signing up first. But if you want to save your creations or track your daily limit, a free account helps with that."
          },
          {
            question: "Is it really free?",
            answer: "Yes—3 cakes a day, no credit card, no strings. If you need more than that, premium's an option. But the free version works forever."
          },
          {
            question: "Can I change the message after generating?",
            answer: "Not exactly—but you can regenerate individual views without redoing all three. Just hit the Regenerate button on whichever one you don't love. First 200 members get unlimited tries, regular premium gets 150/year."
          },
          {
            question: "What's included in the Premium subscription?",
            answer: "More generations (150/year or unlimited for lifetime members), faster processing, advanced customization, commercial use license, and early access to new stuff. Plus you're supporting us, which is nice."
          },
          {
            question: "How many cakes can I generate with Premium?",
            answer: "Lifetime members (first 200) = unlimited forever. Regular premium = 150/year. Free = 3/day with a 12/month cap. Most people find free is plenty, honestly."
          },
          {
            question: "What's special about the Lifetime Deal?",
            answer: "First 200 people pay once ($49 or $99) and never pay again. Ever. Unlimited generations, all future features, priority support. After those spots fill, this deal disappears."
          },
          {
            question: "Can I use this for my business?",
            answer: "Free = personal use only. Premium = commercial license included. Event planners, marketers, anyone using these for work—you'll want the premium plan."
          },
          {
            question: "What image format do you provide?",
            answer: "High-quality PNG. Works great for social media, printing, digital invitations—pretty much anything you'd want to do with a cake image."
          }
        ]}
      />
      
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "FAQ", url: "https://cakeaiartist.com/faq" },
        ]}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">

        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Got questions? Cool. Here are the ones everyone asks. Still stuck? <Link to="/contact" className="text-party-purple hover:underline">Hit us up</Link>.
          </p>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                How do I create my first cake?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Honestly, it's embarrassingly simple. Type a name in the box, pick what you're celebrating (birthday, anniversary, whatever), 
                and hit the button. About 30 seconds later—I know, I know, we said "instant" but we're being real here—you'll have three views to choose from. 
                Front, side, top-down. Pick your favorite, download it. That's literally it.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Do I need to create an account?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Short answer: no. You can make cakes right now without signing up for anything. 
                But here's the thing—if you want to save your creations, see your history, or keep track of how many generations you've used, 
                you'll want a free account. Takes 30 seconds. Up to you though.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Is it really free?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yep. Three cakes a day, zero credit card required, no "free trial" nonsense that charges you later. 
                If you're making cakes for like... every person you know every day? Then yeah, premium makes sense. 
                But for normal humans, free works just fine.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Can I change the message after generating?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Okay, so here's the deal—the text gets baked into the image (pun intended). You can't edit it after. 
                BUT you can regenerate individual views if one doesn't look right. See that little Regenerate button on each image? 
                Just that one view, not all three. Saves time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What cake styles are available?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The AI adapts based on what you tell it. Birthday for a 5-year-old? Colorful, playful, probably with some fun character vibes. 
                50th anniversary? Elegant, sophisticated, maybe some gold accents. You can also specify—chocolate, vanilla, tiered, single layer, 
                specific themes. Play around with it. Part of the fun, honestly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What's included in the Premium subscription?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Real talk? More cakes. 150 generations per year (or unlimited if you grabbed the lifetime deal). 
                Plus faster processing, advanced customization options, commercial use license if you're using these for work, 
                and early access when we add new stuff. Oh, and you're helping us keep the lights on. That's nice of you.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                How many cakes can I generate with Premium?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Depends which premium you got. <strong>Lifetime members</strong> (first 200 people) = unlimited. Forever. 
                <strong>Regular premium</strong> = 150 per year. <strong>Free</strong> = 3 per day, capped at 12 per month. 
                Math works out that free users can't just... out-generate premium by waiting. We thought about that.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Can I upgrade or downgrade anytime?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Upgrade whenever you want—immediate access. Downgrade? Your premium sticks around until your billing period ends, 
                then you're back to free. No penalty fees, no drama. It's your call.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What image format do you provide?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                High-quality PNG. Good enough for printing, perfect for social media, works in pretty much any app. 
                Resolution's optimized so it doesn't look pixelated when you zoom in or print it out.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Can I print the cake designs?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Totally. Lots of people print them for party decorations, invitations, posters. 
                Just to be clear though—these are images, not blueprints for an actual baker. 
                Your local bakery probably can't recreate the exact AI design. But for decorations and digital stuff? Perfect.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What if the image doesn't load?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                First—check your internet. Sounds obvious, but it's usually that. If that's fine, refresh the page. 
                Still nothing? Wait a minute, try again. Servers sometimes get busy. 
                If it's still broken after all that, email us at support@cakeaiartist.com and we'll figure it out.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Can I use this for my business?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Free accounts = personal use only. Sorry, but we gotta draw the line somewhere. 
                If you're an event planner, marketer, or anyone using these for actual business purposes, 
                premium includes a commercial license. Worth it if you're making money off the cakes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-13" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What's special about the Lifetime Deal?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                First 200 people to claim it pay <strong>once</strong>—$49 or $99—and never pay again. Not yearly, not monthly. Once. Done. 
                Unlimited generations forever, all future features included, priority support, exclusive badges. 
                After those 200 spots fill up, this offer's gone. Like, actually gone. We're not bringing it back.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-17" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Are there bulk options for businesses?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Most businesses are fine with premium's 150 generations. But if you need something custom—white-label, API access, 
                custom branding, whatever—shoot us an email at support@cakeaiartist.com. We can probably work something out.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-14" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What's the license for commercial use?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Premium includes a commercial license. Use the images in marketing, client work, social media, whatever. 
                Only thing you can't do is resell the raw images themselves. Like, don't just download them and sell them as stock photos. 
                Using them for your business? Totally fine.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                How does the AI create personalized messages?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It looks at what you tell it—the name, the occasion, your relationship to the person. 
                Then it writes something that fits. So if you say "daughter, birthday, female," you get messages that sound like they're from a parent. 
                Not just generic "Happy Birthday!" stuff. It actually tries to sound... human.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-16" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                How do I share my cake on social media?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Mobile? Hit the share button, we'll open the app you pick. Super easy. 
                Desktop? You'll need to download first, then upload to whatever platform. It's one extra step, 
                but that's how desktop browsers work. Not our call unfortunately.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
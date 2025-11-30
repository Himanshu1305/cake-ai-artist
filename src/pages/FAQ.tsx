import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FAQSchema } from "@/components/SEOSchema";
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
        <title>FAQ - Cake AI Artist Questions & Answers</title>
        <meta name="description" content="Frequently asked questions about Cake AI Artist. Learn how to create personalized cakes, understand pricing, and explore premium features." />
        <meta name="keywords" content="cake AI FAQ, virtual cake questions, cake generator help, design support" />
        <link rel="canonical" href="https://cakeaiartist.com/faq" />
        <meta property="og:url" content="https://cakeaiartist.com/faq" />
      </Helmet>
      
      <FAQSchema 
        faqs={[
          {
            question: "How do I create my first cake?",
            answer: "It's super simple. Just enter a name in the input field on the homepage, choose your occasion (birthday, anniversary, etc.), and hit the 'Create My Cake' button. In about 20 seconds, you'll get four unique designs to choose from. Pick your favorite and download it. No design skills needed."
          },
          {
            question: "Do I need to create an account?",
            answer: "Nope! You can try the service without signing up. However, creating a free account lets you save your creations, access your generation history, and track your daily limit. Plus, if you ever upgrade to premium, your account will have all your past designs ready to go."
          },
          {
            question: "Is it really free?",
            answer: "Yes! Free users can generate up to 3 personalized cakes per day. That's perfect for most people. If you're planning multiple events or want unlimited creations, our premium plan removes all limits and adds priority processing."
          },
          {
            question: "Can I change the message after generating?",
            answer: "Currently, each generation creates four variations with slightly different messages and designs. If you don't love what you see, simply hit generate again. Premium users can regenerate as many times as they want until they find the perfect message."
          },
          {
            question: "What's included in the Premium subscription?",
            answer: "Premium gets you unlimited cake generations (no daily limits), priority processing (faster generation), access to advanced customization options, commercial use license for your images, and early access to new features."
          },
          {
            question: "How many cakes can I generate with Premium?",
            answer: "Unlimited. Seriously. Generate as many as you want, whenever you want. Planning 50 different birthday parties? Go for it. Want to experiment with different messages until you find the perfect one? Have at it."
          },
          {
            question: "Can I use this for my business?",
            answer: "Free accounts are limited to personal, non-commercial use. If you want to use the images for business purposes (event planning, social media marketing, client gifts, etc.), you'll need a premium subscription, which includes a commercial use license."
          },
          {
            question: "What image format do you provide?",
            answer: "All images are provided in high-quality PNG format with transparent backgrounds where appropriate. This makes them perfect for sharing on social media, printing, or using in digital invitations. The resolution is optimized for both screen display and printing."
          }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Got questions? We&apos;ve got answers. Can&apos;t find what you&apos;re looking for? <Link to="/contact" className="text-party-purple hover:underline">Contact us</Link>.
          </p>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                How do I create my first cake?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It's super simple. Just enter a name in the input field on the homepage, choose your occasion (birthday, anniversary, etc.), 
                and hit the "Create My Cake" button. In about 20 seconds, you'll get four unique designs to choose from. 
                Pick your favorite and download it. No design skills needed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Do I need to create an account?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Nope! You can try the service without signing up. However, creating a free account lets you save your creations, 
                access your generation history, and track your daily limit. Plus, if you ever upgrade to premium, 
                your account will have all your past designs ready to go.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Is it really free?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! Free users can generate up to 3 personalized cakes per day. That's perfect for most people. 
                If you're planning multiple events or want unlimited creations, our premium plan removes all limits 
                and adds priority processing for just a few dollars a month.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Can I change the message after generating?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Currently, each generation creates four variations with slightly different messages and designs. 
                If you don't love what you see, simply hit generate again—it counts as one of your daily generations. 
                Premium users can regenerate as many times as they want until they find the perfect message.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What cake styles are available?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI generates various styles based on your inputs—from elegant multi-tiered cakes to fun single-layer designs. 
                The style adapts to the occasion you select. Birthday cakes tend to be more colorful and playful, 
                while anniversary cakes lean toward romantic and sophisticated designs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What's included in the Premium subscription?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Premium gets you unlimited cake generations (no daily limits), priority processing (faster generation), 
                access to advanced customization options, commercial use license for your images, and early access to new features. 
                Plus, you support us in making the service even better!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                How many cakes can I generate with Premium?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Unlimited. Seriously. Generate as many as you want, whenever you want. Planning 50 different birthday parties? Go for it. 
                Want to experiment with different messages until you find the perfect one? Have at it.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Can I upgrade or downgrade anytime?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely. You can upgrade to premium anytime and start using unlimited generations immediately. 
                If you decide to downgrade, your premium access continues until the end of your billing period, 
                then you'll return to the free plan. No penalties, no hassle.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What image format do you provide?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                All images are provided in high-quality PNG format with transparent backgrounds where appropriate. 
                This makes them perfect for sharing on social media, printing, or using in digital invitations. 
                The resolution is optimized for both screen display and printing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Can I print the cake designs?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! While these are AI-generated cake images (not actual cake designs for bakers), 
                many people print them for party decorations, invitations, or digital displays. 
                The image quality is suitable for standard photo printing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What if the image doesn't load?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                First, check your internet connection. If that's fine, try refreshing the page. 
                 Still having issues? It might be a temporary server hiccup. Wait a minute and try again. 
                 If problems persist, reach out to our support team at support@cakeaiartist.com and we'll sort it out.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Can I use this for my business?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Free accounts are limited to personal, non-commercial use. If you want to use the images for business purposes 
                (event planning, social media marketing, client gifts, etc.), you'll need a premium subscription, 
                which includes a commercial use license.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-13" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                Are there bulk options for businesses?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                 Currently, our premium plan handles most business needs with unlimited generations. 
                 If you're an enterprise with specific requirements (custom branding, API access, white-label solutions), 
                 contact us at support@cakeaiartist.com to discuss custom arrangements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-14" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                What's the license for commercial use?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Premium subscribers receive a commercial use license that allows them to use generated images for business purposes, 
                including marketing, client presentations, social media, and commercial printing. 
                You cannot resell the raw images themselves, but you can use them as part of your business services.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                How does the AI create personalized messages?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI analyzes the name, occasion, and relationship context you provide to craft messages that feel genuinely personal. 
                It considers factors like formality level, emotional tone, and cultural appropriateness. 
                Every message is unique—no cookie-cutter templates here.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-16" className="bg-background/50 px-6 rounded-lg border border-border/50">
              <AccordionTrigger className="text-left font-semibold">
                How do I share my cake on social media?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-3">
                  Sharing works differently on mobile and desktop due to browser security restrictions:
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground mb-1">📱 On Mobile:</p>
                    <p>
                      Tap a share button (Facebook, X, WhatsApp, or Instagram) and your cake card will download. 
                      We'll try to open the app for you automatically. Then just select the downloaded image from your gallery and post!
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">💻 On Desktop:</p>
                    <p>
                      Click a share button to download the card to your Downloads folder. 
                      Then open the social media platform in your browser and upload the downloaded image manually. 
                      For Instagram, you'll need to use your phone as desktop uploads aren't supported.
                    </p>
                  </div>
                  <div className="bg-party-purple/10 p-3 rounded-lg border border-party-purple/20 mt-3">
                    <p className="text-sm">
                      💡 <span className="font-semibold text-foreground">Why this approach?</span> Most social platforms don't allow direct image uploads from websites for security reasons. 
                      This two-step process gives you full control and ensures the best quality!
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-12 p-6 bg-party-purple/10 rounded-lg border border-party-purple/20">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <Link to="/contact">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;

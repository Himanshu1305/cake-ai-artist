import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { RelatedTools } from "@/components/RelatedTools";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { CheckCircle2, Sparkles, Zap, Heart, Star } from "lucide-react";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { AnswerBox, DefinitionBox } from "@/components/AeoBlocks";

const PERSONALIZED_FALLBACK = [
  "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=400&fit=crop",
];

const PersonalizedCakeOnline = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<string[]>(PERSONALIZED_FALLBACK);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('is_premium').eq('id', user.id).single();
        setIsPremium(profile?.is_premium || false);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("public_featured_images" as any)
        .select("image_url")
        .filter("featured_pages", "cs", '{"home"}')
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length >= 3) {
        setFeaturedCakes((data as unknown as { image_url: string }[]).map((d) => d.image_url));
      }
    })();
  }, []);

  const faqs = [
    {
      question: "Can I really design a personalised cake online for free?",
      answer: "Yes — your first 5 personalised cake designs are completely free. No credit card, no signup required for your first design. Add any name, message and theme you want.",
    },
    {
      question: "Will the AI spell the name correctly on the cake?",
      answer: "Yes — our AI is specifically trained to render names accurately on cakes. Short names, long names, unusual spellings and double names all work correctly.",
    },
    {
      question: "Can I add a personalised message on the cake?",
      answer: "Yes — add any message alongside the name. Happy Birthday, Congratulations, Happy Anniversary or any custom text is incorporated naturally into the cake design.",
    },
    {
      question: "What themes can I personalise the cake with?",
      answer: "Any theme — favourite colours, sports teams, hobbies, characters, flowers or abstract patterns. Describe it in plain English and the AI handles the rest.",
    },
    {
      question: "Can I personalise cakes for different occasions?",
      answer: "Yes — birthdays, weddings, anniversaries, graduations, baby showers, Diwali, Eid, Christmas and any other occasion. The AI adapts the design to suit the celebration.",
    },
  ];

  const howToSteps = [
    { name: "Enter the name and message", text: "Type the recipient's name and your personal message. The AI renders both on the cake exactly as you write them." },
    { name: "Choose your style", text: "Pick occasion, theme, colours and decoration style. Describe specific personalisation in plain English." },
    { name: "Generate your design", text: "The AI creates a photorealistic personalised cake in 30 seconds with your exact name and message on it." },
    { name: "Download and use", text: "Save your personalised cake design and share it with your baker, send it as a digital gift, or post it on social media." },
  ];

  const whyChoose = [
    { title: "Names spelled perfectly", desc: "Our AI renders any name correctly — short names, long names, unusual spellings and double names all work accurately on the cake." },
    { title: "Truly personalised", desc: "Add names, messages, themes, colours and characters. Every design is unique to the person you are celebrating." },
    { title: "Free to start", desc: "Five full personalised cake designs free, no credit card. Explore different ideas before committing to a baker order." },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Personalised Cake Online — Free Custom Cake Designer with AI</title>
        <meta name="description" content="Design a personalised cake online for free. Custom AI cake designs with names, messages and themes in 30 seconds. The easiest custom cake maker online." />
        <link rel="canonical" href="https://cakeaiartist.com/personalized-cake-online" />
        <meta name="keywords" content="personalized cake online, personalised cake online, custom cake design online, custom cake maker, personalised cake maker, design cake online free, online cake designer" />
        <meta property="og:title" content="Personalised Cake Online — Free Custom Cake Designer with AI" />
        <meta property="og:description" content="Design a personalised cake online for free. Custom AI cake designs with names, messages and themes in 30 seconds." />
        <meta property="og:url" content="https://cakeaiartist.com/personalized-cake-online" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Personalised Cake Online", url: "https://cakeaiartist.com/personalized-cake-online" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to Design a Personalised Cake Online for Free"
        description="Create a custom personalised cake with names, messages and themes in 30 seconds"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Enter the name and message", text: "Type the recipient's name and your personal message. The AI renders both on the cake exactly as you write them." },
          { name: "Choose your style", text: "Pick occasion, theme, colours and decoration style. Describe specific personalisation in plain English." },
          { name: "Generate your design", text: "The AI creates a photorealistic personalised cake in 30 seconds with your exact name and message on it." },
          { name: "Download and use", text: "Save your personalised cake design and share it with your baker, send it as a digital gift, or post it on social media." },
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Sparkles className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">100% Free · No Credit Card · Instant Results</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Design a Personalised Cake Online —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Free Custom Cake Maker</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Add any name, message and theme to a stunning AI cake design in 30 seconds. The easiest way to design a personalised cake online — free to try.
          </p>

          <AnswerBox stats={["~30 seconds","5 free designs","20+ occasions","3 views per cake"]}>
            To design a personalised cake online, describe the person or occasion — their name, age, theme and favourite colours. Cake AI Artist turns that short description into a photorealistic cake in about 30 seconds, showing three views of each design. Your first 5 designs are free, with no signup for your first.
          </AnswerBox>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
            {["Any name spelled correctly", "Custom messages + themes", "Download in seconds"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?ref=personalized")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Personalise My Cake →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/community")} className="text-base px-7 py-6">
              See real examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span><strong className="text-foreground">4.9/5</strong> · loved by 2,800+ celebrators worldwide</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Real AI-Generated Personalised Cake Designs</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Photorealistic personalised cake designs generated with AI. Every name, message and theme is unique to the person being celebrated.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredCakes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Personalised cake design ${i + 1}`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How the personalised cake designer works</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {howToSteps.map((step, i) => (
              <Card key={i} className="p-6 border-2 hover:border-party-pink/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-party text-white font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{step.name}</h3>
                    <p className="text-muted-foreground">{step.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Why choose this personalised cake maker</h2>
          <p className="text-center text-muted-foreground mb-10">Three things that make it the easiest way to design a personalised cake online.</p>
          <div className="space-y-4">
            {whyChoose.map((item, i) => (
              <div key={i} className="flex gap-4 p-5 bg-background rounded-xl border border-border">
                <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <DefinitionBox term="a personalised cake" definition={<>A personalised cake is a cake designed around a specific person or occasion — their name, age, theme and favourite colours — rather than a generic template. Cake AI Artist lets you design one online in about 30 seconds from a short description, returning three views of the cake, with your first 5 designs free.</>} />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Personalised Cake Online — FAQs</h2>
          {faqs.map((faq, i) => (
            <details key={i} className="mb-3 p-4 bg-surface-elevated rounded-lg border border-border">
              <summary className="font-semibold cursor-pointer">{faq.question}</summary>
              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-party text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Create Your Personalised Cake Free</h2>
          <p className="text-lg mb-8 opacity-95">Takes 30 seconds. No signup needed for your first design.</p>
          <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?ref=personalized-bottom")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My Personalised Cake →
          </Button>
        </div>
      </section>

      {authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}
      <RelatedTools exclude="/personalized-cake-online" />
      <Footer />
    </div>
  );
};

export default PersonalizedCakeOnline;

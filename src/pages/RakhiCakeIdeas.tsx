import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { CheckCircle2, Sparkles, Zap, Heart, Star } from "lucide-react";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { AnswerBox, DefinitionBox } from "@/components/AeoBlocks";
import { RelatedTools } from "@/components/RelatedTools";

const RAKHI_FALLBACK = [
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400&h=400&fit=crop",
];

const RakhiCakeIdeas = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<string[]>(RAKHI_FALLBACK);
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
        .filter("featured_pages", "cs", '{"rakhi"}')
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length >= 3) {
        setFeaturedCakes((data as unknown as { image_url: string }[]).map((d) => d.image_url));
      }
    })();
  }, []);

  const faqs = [
    {
      question: "What are good rakhi cake ideas for a brother?",
      answer: "Popular rakhi cake ideas for a brother include a rich chocolate rakhi cake, a photo cake with his picture, a fondant cake topped with a rakhi design, or a themed cake around his hobby. Describe his favourite flavour and add a heartfelt Raksha Bandhan message with his name spelled correctly.",
    },
    {
      question: "What rakhi cake designs suit a sister?",
      answer: "For a sister, elegant floral rakhi cakes, pastel buttercream designs, photo cakes, and cute character or theme cakes work beautifully. Add her name and a loving message — the AI renders each design photorealistically so you can pick the one that feels most like her.",
    },
    {
      question: "Can I add my brother/sister's name to the cake?",
      answer: "Yes — enter the name and message in your description and the AI incorporates them naturally, spelled exactly as you type. Add both siblings' names or a Raksha Bandhan wish and it appears written on the cake in your design.",
    },
    {
      question: "When should I design my Rakhi 2026 cake?",
      answer: "Raksha Bandhan falls on 28 August 2026, so design your cake now to give yourself time to finalise a favourite and share it with your baker. Since each design takes about 30 seconds, you can explore several looks in one sitting well ahead of the day.",
    },
    {
      question: "Is the rakhi cake designer free?",
      answer: "Yes — your first 5 rakhi cake designs are completely free with no credit card required. Generate multiple variations for your brother or sister and download the one you love at full resolution.",
    },
  ];

  const howToSteps = [
    { name: "Pick brother or sister and a theme", text: "Choose who the rakhi cake is for and pick a theme — chocolate, floral, photo cake, fondant rakhi-topper or a hobby theme. Tell the AI your colours and flavour." },
    { name: "Add name and message", text: "Enter your brother or sister's name and a Raksha Bandhan message. Names are spelled exactly as you type, so the cake reads perfectly." },
    { name: "Generate your designs", text: "The AI produces photorealistic rakhi cake designs in about 30 seconds, with three views per cake so you can see it from every angle." },
    { name: "Download and share", text: "Download your favourite at full resolution and share it with your baker as a visual brief — or post it to celebrate Rakhi 2026." },
  ];

  const rakhiIdeas = [
    { title: "Chocolate rakhi cake", desc: "A rich chocolate cake with a rakhi motif and your brother's name — a classic crowd-pleaser for Raksha Bandhan." },
    { title: "Photo rakhi cake", desc: "Feature a favourite sibling photo on the cake with a heartfelt message for a personal, memorable centrepiece." },
    { title: "Fondant rakhi-topper cake", desc: "Smooth fondant finished with a sculpted rakhi on top — elegant and unmistakably themed for the occasion." },
    { title: "Floral rakhi cake for sister", desc: "Soft pastel buttercream with sugar flowers and her name — a graceful design that suits any sister." },
    { title: "Raksha Bandhan cake with name", desc: "A vibrant celebration cake with both siblings' names and a Rakhi 2026 wish written across the top." },
    { title: "Rakhi special theme cake", desc: "Built around a hobby, cartoon or colour theme your sibling loves, with rakhi accents and a personal message." },
  ];


  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Rakhi Cake Design Ideas 2026 — Free AI Cake Designer</title>
        <meta name="description" content="Design Raksha Bandhan cakes for your brother & sister with AI — add names & a message, get photorealistic rakhi cake ideas in 30 seconds. First 5 free." />
        <link rel="canonical" href="https://cakeaiartist.com/rakhi-cake-ideas" />
        <meta name="keywords" content="rakhi cake design, raksha bandhan cake, rakhi cake for brother, rakhi cake for sister, raksha bandhan cake with name, rakhi special cake, rakhi cake ideas 2026" />
        <meta property="og:title" content="Rakhi Cake Design Ideas 2026 | Cake AI Artist" />
        <meta property="og:description" content="Design Raksha Bandhan cakes for your brother & sister with AI in 30 seconds. Add names and a message. Free to try, no credit card needed." />
        <meta property="og:url" content="https://cakeaiartist.com/rakhi-cake-ideas" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Rakhi Cake Ideas", url: "https://cakeaiartist.com/rakhi-cake-ideas" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to Design a Rakhi Cake with AI"
        description="Create a personalised Raksha Bandhan cake design in about 30 seconds — free to try"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Pick brother or sister and a theme", text: "Choose who the rakhi cake is for and pick a theme — chocolate, floral, photo cake or fondant rakhi-topper. Add colours and flavour." },
          { name: "Add name and message", text: "Enter your brother or sister's name and a Raksha Bandhan message. Names are spelled exactly as you type." },
          { name: "Generate your designs", text: "The AI creates photorealistic rakhi cake designs in about 30 seconds, with three views per cake." },
          { name: "Download and share", text: "Download your favourite at full resolution and share it with your baker as a visual brief." },
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Sparkles className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">Perfect for Raksha Bandhan · 28 Aug 2026</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Rakhi Cake Design Ideas for Brother & Sister —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Free</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Celebrate Rakhi 2026 with a personalised cake. Describe a theme for your brother or sister, add their name and a message, and get a photorealistic rakhi cake design in about 30 seconds. Free to try, no signup needed.
          </p>

          <AnswerBox stats={["~30 seconds","For brother & sister","5 free designs","3 views per cake"]}>
            To design a Raksha Bandhan cake, pick whether it is for your brother or sister, choose a theme, and add their name and a message. Cake AI Artist generates photorealistic rakhi cake designs with three views in about 30 seconds. Your first 5 designs are free, no signup required.
          </AnswerBox>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
            {["Free first 5 designs", "No credit card required", "Names spelled correctly"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=rakhi")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Design My Rakhi Cake →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/community")} className="text-base px-7 py-6">
              See real examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span><strong className="text-foreground">4.9/5</strong> · loved by families celebrating Rakhi</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Real AI-Generated Rakhi Cake Designs</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Photorealistic Raksha Bandhan cake designs generated with AI. Download, share with your baker, and celebrate the bond between siblings.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredCakes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Rakhi cake design ${i + 1}`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How to design a rakhi cake with AI</h2>
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
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Rakhi cake ideas for every sibling</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">Six starting points for your Raksha Bandhan cake — mix, match and personalise with a name and message.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rakhiIdeas.map((idea, i) => (
              <Card key={i} className="p-6 border-2 hover:border-party-pink/40 transition-colors">
                <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
                <p className="text-sm text-muted-foreground">{idea.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <DefinitionBox term="a Rakhi cake" definition={<>A Rakhi cake is a cake made for Raksha Bandhan that celebrates the bond between brothers and sisters, often featuring rakhi motifs, names and a heartfelt message. Cake AI Artist generates photorealistic Rakhi cake designs in about 30 seconds, with your first 5 designs free.</>} />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Rakhi Cake Ideas — FAQs</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Designing Your Rakhi 2026 Cake</h2>
          <p className="text-lg mb-8 opacity-95">Raksha Bandhan is 28 August 2026 — create the perfect cake for your brother or sister today.</p>
          <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=rakhi")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My Rakhi Cake Free →
          </Button>
        </div>
      </section>

      {authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}
      <RelatedTools exclude="/rakhi-cake-ideas" />
      <Footer />
    </div>
  );
};

export default RakhiCakeIdeas;

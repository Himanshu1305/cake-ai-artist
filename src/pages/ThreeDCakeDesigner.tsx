import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema, HowToSchema } from "@/components/SEOSchema";
import { AnswerBox, DefinitionBox } from "@/components/AeoBlocks";
import { Box, Sparkles, Layers, Eye, Star, Type, Camera, Heart, Check, X } from "lucide-react";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { useGeoContext } from "@/contexts/GeoContext";

const ThreeDCakeDesigner = () => {
  const { detectedCountry } = useGeoContext();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const faqs = [
    {
      question: "Is the 3D cake designer actually free online?",
      answer: "Yes — 5 full 3D cake designs are free with no credit card required. Results are high-resolution with no watermark.",
    },
    {
      question: "How is this different from regular 2D cake design tools?",
      answer: "A 2D tool produces a flat sketch. This 3D AI designer renders photorealistic depth, lighting and dimension so you can see exactly what the finished cake will look like before ordering from a baker.",
    },
    {
      question: "Can I customise the 3D cake design — colours, tiers, decorations?",
      answer: "Yes — choose tier count, frosting style, decoration theme and colour palette. Describe specific details (gold drip, edible flowers, fondant figures) in plain English and the AI incorporates them.",
    },
    {
      question: "Can my baker use the 3D cake design as a reference?",
      answer: "Yes — that is the most common use case. The high-resolution render shows tier sizes, decorations, colours and proportions clearly enough for any professional baker to recreate.",
    },
    {
      question: "Does it work on phones?",
      answer: "Yes — fully mobile-optimised. The design tool works on any smartphone browser with no app download required.",
    },
    {
      question: "How do I design a 3D cake online?",
      answer: "Open Cake AI Artist, type a name and occasion, pick a style, tier count and colours, then generate. In about 30 seconds you get a photorealistic 3D render of the cake from three angles — no software to install and no design skills needed.",
    },
    {
      question: "What 3D cake design ideas work best?",
      answer: "Multi-tier wedding cakes, drip cakes with gold accents, sculpted character cakes, geometric fault-line cakes and floral buttercream designs all render beautifully in 3D. Describe the theme in plain English and the AI builds it with realistic depth and lighting.",
    },
    {
      question: "Can I design a 3D birthday cake with a name?",
      answer: "Yes — enter the birthday person's name and it appears cleanly on the 3D cake, spelled correctly. Add an age, theme or character and the AI styles the whole design around it, then renders it from three angles.",
    },
  ];

  const howToSteps = [
    { name: "Enter a name and occasion", text: "Type the name and pick the occasion — birthday, wedding, anniversary or festival. The AI uses this to style the 3D cake." },
    { name: "Choose tiers, style and colours", text: "Select tier count, frosting style, decoration theme and colour palette, or describe specific details like gold drip or edible flowers in plain English." },
    { name: "Generate the 3D render", text: "Click generate and get a photorealistic 3D cake render from three angles — front, side and top-down — in about 30 seconds." },
    { name: "Download or share", text: "Download the high-resolution render to bring to your baker, or share the design link. Your first 5 designs are free." },
  ];

  const samples = [featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5];

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

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Free 3D Cake Designer Online — AI Cake Design Tool</title>
        <meta name="description" content="Design photorealistic 3D cakes online for free. AI-powered 3D cake designer with realistic depth, lighting and custom decorations." />
        <link rel="canonical" href="https://cakeaiartist.com/3d-cake-designer" />
        <meta property="og:title" content="3D Cake Designer Free Online | Cake AI Artist" />
        <meta property="og:description" content="Design realistic 3D AI cakes free online. No download, no signup to explore." />
        <meta property="og:url" content="https://cakeaiartist.com/3d-cake-designer" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "3D Cake Designer", url: "https://cakeaiartist.com/3d-cake-designer" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to design a 3D cake online with AI"
        description="Design a photorealistic 3D cake online in about 30 seconds — free to try, no download."
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={howToSteps}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-purple/10 border border-party-purple/30">
            <Box className="w-3.5 h-3.5 text-party-purple" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-purple">3D Renders · Free Online</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            3D Cake Designer —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Free Online AI Cake Design Tool</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The best 3D cake designer free online. Cake AI Artist renders realistic 3D AI cakes with depth, lighting, and dimension — so you can see exactly what your birthday, wedding, or anniversary cake will look like before a single ingredient is touched. No download, no software, no credit card.
          </p>

          <AnswerBox stats={["~30 seconds", "Free online", "3 views per cake", "No download"]}>
            To design a 3D cake online, open Cake AI Artist, type a name and occasion, choose the tiers, style and colours, then generate. In about 30 seconds you get a photorealistic 3D cake render from three angles — front, side and top-down — that you can download for your baker. Your first 5 designs are free.
          </AnswerBox>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Sparkles className="w-5 h-5 mr-2" /> Design Your 3D Cake Free →
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/community")} className="text-base px-7 py-6">
              See 3D examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span><strong className="text-foreground">4.9/5</strong> · trusted by home celebrators and bakers alike</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">3D cake design samples</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Realistic, baker-ready 3D renders — these are the kind of results you'll get on the free plan.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {samples.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`3D cake designer sample render ${i + 1} — realistic AI-generated celebration cake`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Why this 3D cake designer is different</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Layers, title: "Real 3D depth, not flat sketches", desc: "Every cake is rendered with proper lighting, tier proportions, and dimension — not the flat outlines most 'cake design tools' produce." },
              { icon: Eye, title: "See it before you bake it", desc: "Bring the 3D render to your baker or use it to plan your home bake. Either way, no surprises on cake day." },
              { icon: Sparkles, title: "Designed for celebrations, not just cakes", desc: "Birthdays, weddings, anniversaries, baby showers, festivals — the AI understands the occasion and styles the 3D design to match." },
            ].map((f, i) => (
              <Card key={i} className="p-6 border-2 hover:border-party-purple/40 transition-colors">
                <f.icon className="w-10 h-10 text-party-purple mb-3" />
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 px-4">
        <DefinitionBox
          term="a 3D cake designer"
          definition={<>A 3D cake designer is an online tool that renders a cake as a photorealistic, three-dimensional image — with real depth, lighting and tier proportions — instead of a flat 2D sketch. Cake AI Artist generates a 3D cake render from a short text description in about 30 seconds, showing three angles so you can visualise the finished cake before you order it or bake it.</>}
        />
      </section>

      {/* How to design a 3D cake online */}
      <section className="py-12 md:py-16 px-4 bg-surface">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">How to design a 3D cake online</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Four steps, about 30 seconds, no software to install.
          </p>
          <ol className="grid md:grid-cols-2 gap-5 list-none">
            {howToSteps.map((step, i) => (
              <li key={i} className="flex gap-4 p-5 bg-background rounded-xl border border-border">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-party text-white font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <h3 className="font-bold mb-1">{step.name}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3D cake design ideas */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">3D cake design ideas</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Popular 3D cake designs the AI renders beautifully — including 3D birthday cake designs. Describe any of these in plain English.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { t: "Multi-tier wedding cakes", d: "Two, three or four tiers with cascading florals and clean fondant." },
              { t: "3D birthday cakes with a name", d: "The birthday name spelled cleanly on a themed, dimensional design." },
              { t: "Drip cakes with gold accents", d: "Glossy chocolate or caramel drips with metallic gold detailing." },
              { t: "Sculpted character cakes", d: "3D shaped cakes — cars, animals, superheroes — for kids' parties." },
              { t: "Geometric fault-line cakes", d: "Modern fault-line reveals with geometric shards and colour blocks." },
              { t: "Floral buttercream designs", d: "Piped buttercream flowers with realistic petals and depth." },
            ].map((idea, i) => (
              <Card key={i} className="p-5 border-2 hover:border-party-purple/40 transition-colors">
                <h3 className="font-bold mb-1">{idea.t}</h3>
                <p className="text-sm text-muted-foreground">{idea.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3D cake designer vs traditional design */}
      <section className="py-12 md:py-16 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">3D cake designer vs traditional cake design</h2>
          <p className="text-center text-muted-foreground mb-8">
            A 3D AI cake designer lets you see the finished cake before you commit. Here's how it compares to sketching a design or briefing a baker by hand.
          </p>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="text-left p-3 font-semibold">&nbsp;</th>
                  <th className="text-left p-3 font-semibold text-party-purple">3D AI cake designer</th>
                  <th className="text-left p-3 font-semibold">Traditional design</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { k: "Time to first design", ai: "~30 seconds", trad: "Days (sketch or baker consult)" },
                  { k: "Realistic 3D preview", ai: "Yes — photorealistic render", trad: "Flat sketch or imagination" },
                  { k: "Cost to explore", ai: "Free (5 designs)", trad: "Consultation/design fees" },
                  { k: "Revisions", ai: "Unlimited, instant", trad: "Slow, often chargeable" },
                  { k: "Multiple angles", ai: "3 views per cake", trad: "Usually one sketch" },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 font-medium">{row.k}</td>
                    <td className="p-3 text-muted-foreground"><Check className="inline w-4 h-4 text-party-purple mr-1" />{row.ai}</td>
                    <td className="p-3 text-muted-foreground"><X className="inline w-4 h-4 text-muted-foreground/60 mr-1" />{row.trad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Related tools — spread authority */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Related AI cake tools</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { to: "/photo-cake-maker", icon: Camera, title: "Photo Cake Maker", desc: "Design a cake with a personal photo and name." },
              { to: "/ai-birthday-cake-with-name", icon: Type, title: "Birthday Cake with Name", desc: "AI birthday cakes with any name, spelled correctly." },
              { to: "/wedding-cake-designer", icon: Heart, title: "Wedding Cake Designer", desc: "Visualise multi-tier wedding cakes in seconds." },
            ].map((tool, i) => (
              <Link key={i} to={tool.to} className="block p-6 bg-surface rounded-xl border-2 hover:border-party-purple/40 transition-colors">
                <tool.icon className="w-9 h-9 text-party-purple mb-3" />
                <h3 className="font-bold text-lg mb-1">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">3D Cake Designer — FAQs</h2>
          {faqs.map((faq, i) => (
            <details key={i} className="mb-3 p-4 bg-background rounded-lg border border-border">
              <summary className="font-semibold cursor-pointer">{faq.question}</summary>
              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-party text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <Box className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Try the 3D cake designer free</h2>
          <p className="text-lg mb-8 opacity-95">Your first realistic 3D cake takes 30 seconds. No download needed.</p>
          <Button size="lg" onClick={() => navigate("/")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Design My 3D Cake →
          </Button>
        </div>
      </section>

      {authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country={detectedCountry || 'US'} />}
      <Footer />
    </div>
  );
};

export default ThreeDCakeDesigner;

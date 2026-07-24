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
import { useGeoContext } from "@/contexts/GeoContext";

const PHOTO_CAKE_FALLBACK = [
  "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=400&fit=crop",
];

const PhotoCakeMaker = () => {
  const { detectedCountry } = useGeoContext();
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<string[]>(PHOTO_CAKE_FALLBACK);
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
      question: "Can I really add any photo to a cake design for free?",
      answer: "Yes — upload any photo and our AI integrates it naturally into a personalised cake design. Your first 5 designs are completely free with no credit card required.",
    },
    {
      question: "What photos work best for photo cakes?",
      answer: "Clear, well-lit portrait photos work best. Group photos, pet photos, baby photos and couple photos all produce beautiful results. Avoid very dark or blurry images for the best cake design.",
    },
    {
      question: "How do I get the photo cake made at a bakery?",
      answer: "Download your AI-generated photo cake design and take it to your local bakery as a visual brief. Most bakeries can replicate the design — show them the image and they will handle the printing and placement.",
    },
    {
      question: "Can I add text and a name along with the photo?",
      answer: "Yes — add the recipient's name, a birthday message, or any custom text alongside the photo. The AI incorporates both the image and the text into the cake design naturally.",
    },
    {
      question: "Is the photo cake maker available in the UK, India, Australia and Canada?",
      answer: "Yes — our photo cake maker works worldwide. Pricing is shown in your local currency — GBP for UK, INR for India, AUD for Australia, CAD for Canada.",
    },
    {
      question: "How long does it take to make a photo cake?",
      answer: "The AI generates your photo cake design in 30 seconds. For the actual baked cake, most professional bakeries need 24-72 hours notice for photo cakes.",
    },
  ];

  const howToSteps = [
    { name: "Upload your photo", text: "Add any photo — portrait, family, pet or memory. Our AI handles the integration naturally." },
    { name: "Choose cake style", text: "Pick occasion, tier count, frosting and colours. Describe any special touches in plain English." },
    { name: "AI generates in 30 seconds", text: "Get a photorealistic personalised photo cake design instantly — four unique variations." },
    { name: "Download for your baker", text: "Save in high resolution and use as a baker brief. Most bakeries can replicate within 24-48 hours." },
  ];

  const whyChoose = [
    { title: "Natural photo integration", desc: "Our AI does not just place a photo on a cake — it integrates the image naturally into the design, matching lighting and style." },
    { title: "Any occasion, any photo", desc: "Birthday portraits, anniversary photos, baby shower images, graduation photos, pet pictures — every photo works beautifully." },
    { title: "Baker-ready in seconds", desc: "Download a high-resolution image your baker can use as a direct brief. No more vague descriptions — just show them the design." },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Free Photo Cake Maker — Add Photos to Cakes Online with AI</title>
        <meta name="description" content="Create stunning photo cakes online for free. Upload a photo and our AI designs a beautiful personalised cake with your image in 30 seconds. No skills needed." />
        <link rel="canonical" href="https://cakeaiartist.com/photo-cake-maker" />
        <meta name="keywords" content="photo cake maker, photo cake online, cake with photo, personalised photo cake, photo birthday cake, upload photo cake, ai photo cake maker free" />
        <meta property="og:title" content="Free Photo Cake Maker — Add Photos to Cakes Online with AI" />
        <meta property="og:description" content="Create stunning photo cakes online for free. Upload a photo and our AI designs a beautiful personalised cake in 30 seconds." />
        <meta property="og:url" content="https://cakeaiartist.com/photo-cake-maker" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Photo Cake Maker", url: "https://cakeaiartist.com/photo-cake-maker" },
      ]} />

      <FAQSchema faqs={faqs} />

      <HowToSchema
        name="How to Make a Photo Cake Online with AI"
        description="Add your photo to a beautiful AI-designed cake in 30 seconds — free"
        totalTime="PT30S"
        estimatedCost={{ currency: "USD", value: "0" }}
        steps={[
          { name: "Upload your photo", text: "Upload any photo — a portrait, family picture, pet photo or memorable moment. Our AI integrates it naturally into the cake design." },
          { name: "Choose your cake style", text: "Pick the occasion, cake tier count, frosting style and colour palette. The AI matches the photo to your chosen theme." },
          { name: "Generate in 30 seconds", text: "The AI creates a photorealistic personalised photo cake design in under 30 seconds — ready to download or share." },
          { name: "Send to your baker", text: "Download the high-resolution image and use it as a brief for your baker. Photo cakes usually take 24-48 hours to bake." },
        ]}
        image="https://cakeaiartist.com/hero-cake.jpg"
      />

      <SiteHeader />

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-party-pink/10 border border-party-pink/30">
            <Sparkles className="w-3.5 h-3.5 text-party-pink" />
            <span className="text-xs font-semibold uppercase tracking-wide text-party-pink">100% Free · No Credit Card · Instant Download</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Free Photo Cake Maker —{" "}
            <span className="bg-gradient-party bg-clip-text text-transparent">Add Any Photo to a Cake in 30 Seconds</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Upload a photo, choose your style, and watch our AI create a stunning personalised photo cake design. Perfect for birthdays, anniversaries and every special moment.
          </p>

          <AnswerBox stats={["~30 seconds","Name + photo","5 free designs","3 views per cake"]}>
            A photo cake maker lets you put a photo on a cake by adding your picture and a name, then previewing a photorealistic design before you order or bake. Upload a photo, pick a style, and Cake AI Artist generates a birthday cake with name and photo in about 30 seconds — your first 5 designs are free.
          </AnswerBox>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
            {["Upload any photo", "30-second AI design", "Baker-ready download"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?occasion=birthday&ref=photo-cake")} className="bg-gradient-gold text-base px-7 py-6 font-semibold">
              <Zap className="w-5 h-5 mr-2" /> Make My Photo Cake →
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">AI-Generated Photo Cake Designs</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Photorealistic personalised cake designs generated with AI. Upload your photo and get results like these in 30 seconds.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredCakes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Photo cake design ${i + 1}`}
                loading="lazy"
                className="rounded-xl aspect-square object-cover shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How the photo cake maker works</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Why choose this photo cake maker</h2>
          <p className="text-center text-muted-foreground mb-10">Three things that make it the best way to create a photo cake online.</p>
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

      <section className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <DefinitionBox term="a photo cake maker" definition={<>A photo cake maker is a tool that designs a cake featuring a personal photo and name, letting you preview a picture cake before ordering or baking. Cake AI Artist generates a photorealistic photo-cake design with the name spelled correctly in about 30 seconds, from three angles, and your first 5 designs are free.</>} />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Photo Cake Maker — FAQs</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Create Your Free Photo Cake Now</h2>
          <p className="text-lg mb-8 opacity-95">Your first photo cake design takes 30 seconds. No signup, no credit card.</p>
          <Button size="lg" onClick={() => navigate("/free-ai-cake-designer?ref=photo-cake-bottom")} className="bg-white text-party-pink hover:bg-white/90 text-base px-8 py-6 font-bold">
            Make My Photo Cake Free →
          </Button>
        </div>
      </section>

      {authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country={detectedCountry || 'US'} />}
      <RelatedTools exclude="/photo-cake-maker" />
      <Footer />
    </div>
  );
};

export default PhotoCakeMaker;

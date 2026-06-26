import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema } from "@/components/SEOSchema";
import { Sparkles, Palette, Heart, Cake } from "lucide-react";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";
import { CAKE_THEMES } from "@/data/cakeThemes";

const samples = [featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5];

const ThemedCakePage = () => {
  const { theme: slug } = useParams<{ theme: string }>();

  const entry = useMemo(
    () => CAKE_THEMES.find((t) => t.slug === slug?.toLowerCase()),
    [slug],
  );

  if (!entry) return <Navigate to="/free-ai-cake-designer" replace />;

  const { title, description, audience } = entry;
  const url = `https://cakeaiartist.com/birthday-cake-theme/${entry.slug}`;
  const pageTitle = `${title} Birthday Cake — Free AI Cake Designer`;
  const metaDesc = `Design a ${title.toLowerCase()} birthday cake in 30 seconds. ${description.slice(0, 110)}`;

  const faqs = [
    {
      question: `How is the ${title} cake design generated?`,
      answer: `Our AI is trained on thousands of professional ${title.toLowerCase()} cake photos. You type the birthday person's name, and the AI generates a ${title.toLowerCase()}-themed cake with their name piped clearly on top — in 30 seconds, free.`,
    },
    {
      question: `Is the ${title} cake design free to download?`,
      answer: `Yes — generate 5 ${title.toLowerCase()} cake designs free, no signup. Download as a JPG or share an animated link with music. Premium unlocks unlimited generations and HD downloads.`,
    },
    {
      question: `Can I customise the ${title} cake colours, age and message?`,
      answer: `Yes. After picking the ${title.toLowerCase()} theme, you can add any name, age, custom message and even reference photo. The AI keeps the ${title.toLowerCase()} look while honouring your details.`,
    },
    {
      question: `Will this work for ${audience === "anyone" ? "any age" : audience}?`,
      answer: `${title} cakes work best for ${audience}, but the design adapts to the name and age you enter — so it suits any age group within that range.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Cake Themes", url: "https://cakeaiartist.com/free-ai-cake-designer" },
        { name: title, url },
      ]} />
      <FAQSchema faqs={faqs} />

      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-party-pink font-semibold mb-3">
            {title} cake design
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            {title} Birthday Cake
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {description}
          </p>
          <Link to={`/free-ai-cake-designer?theme=${encodeURIComponent(entry.slug)}`}>
            <Button size="lg" className="bg-gradient-party text-white font-bold text-lg px-8 py-6 shadow-elegant hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 mr-2" />
              Design {title} Cake Free →
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            ✅ Free • ✅ 30 seconds • ✅ Any name, spelled correctly
          </p>
        </section>

        {/* Sample gallery */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            {title} cake design ideas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {samples.map((src, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-elegant transition-shadow">
                <img
                  src={src}
                  alt={`${title} birthday cake design idea — style ${i + 1}`}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <Palette className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">True {title} aesthetic</h3>
            <p className="text-sm text-muted-foreground">
              No generic clipart. The AI captures the actual {title.toLowerCase()} aesthetic — colours, props, mood and detail.
            </p>
          </Card>
          <Card className="p-6">
            <Cake className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">3 cake views</h3>
            <p className="text-sm text-muted-foreground">
              Front, side and top-down renders — you see the {title.toLowerCase()} cake the way a bakery photo would show it.
            </p>
          </Card>
          <Card className="p-6">
            <Heart className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">Share with music</h3>
            <p className="text-sm text-muted-foreground">
              Send a link with a spinning 3D {title.toLowerCase()} cake reveal and birthday jingle — perfect for WhatsApp and Instagram.
            </p>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <Card key={i} className="p-5">
                <h3 className="font-semibold mb-2">{f.question}</h3>
                <p className="text-sm text-muted-foreground">{f.answer}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="mb-12 text-center">
          <h2 className="text-xl font-bold mb-4">More cake themes to explore</h2>
          <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
            {CAKE_THEMES.filter((t) => t.slug !== entry.slug)
              .slice(0, 20)
              .map((t) => (
                <Link
                  key={t.slug}
                  to={`/birthday-cake-theme/${t.slug}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-party-pink/10 hover:border-party-pink transition-colors"
                >
                  {t.title}
                </Link>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ThemedCakePage;

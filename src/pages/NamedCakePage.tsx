import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { BreadcrumbSchema, FAQSchema } from "@/components/SEOSchema";
import { Sparkles, Cake, Heart, Type } from "lucide-react";
import featuredCake1 from "@/assets/featured-cake-1.jpg";
import featuredCake2 from "@/assets/featured-cake-2.jpg";
import featuredCake3 from "@/assets/featured-cake-3.jpg";
import featuredCake4 from "@/assets/featured-cake-4.jpg";
import featuredCake5 from "@/assets/featured-cake-5.jpg";
import { CAKE_NAMES } from "@/data/cakeNames";

const samples = [featuredCake1, featuredCake2, featuredCake3, featuredCake4, featuredCake5];

const NamedCakePage = () => {
  const { name: slug } = useParams<{ name: string }>();

  const entry = useMemo(
    () => CAKE_NAMES.find((n) => n.slug === slug?.toLowerCase()),
    [slug],
  );

  if (!entry) return <Navigate to="/ai-birthday-cake-with-name" replace />;

  const { name } = entry;
  const url = `https://cakeaiartist.com/birthday-cake-for/${entry.slug}`;
  const title = `Birthday Cake with Name "${name}" — Free AI Design`;
  const description = `Design a birthday cake with the name ${name} in 30 seconds. AI spells ${name} correctly every time. Free, no signup needed.`;

  const faqs = [
    {
      question: `Will the cake actually have the name ${name} spelled correctly?`,
      answer: `Yes. Our AI is specifically tuned for name accuracy on cakes — ${name} appears clearly and correctly on the finished design. If a spelling ever looks off, regenerate once and it self-corrects.`,
    },
    {
      question: `Can I add a message along with ${name}?`,
      answer: `Yes. You can pair the name with any short message — "Happy Birthday ${name}", "${name} turns 5!", "Love you ${name}". The full text renders together on the cake.`,
    },
    {
      question: `Is this birthday cake design with ${name} free?`,
      answer: `Completely free. Generate 5 cake designs for ${name} for free, no credit card. Premium users get unlimited generations and HD downloads.`,
    },
    {
      question: `Can I download or share the ${name} birthday cake?`,
      answer: `Yes. Share a live animated cake link on WhatsApp, Instagram or email — recipients see ${name}'s cake spin in 3D with birthday music. Or download the image as JPG.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Birthday Cake with Name", url: "https://cakeaiartist.com/ai-birthday-cake-with-name" },
        { name: `${name}`, url },
      ]} />
      <FAQSchema faqs={faqs} />

      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-party-pink font-semibold mb-3">
            Birthday cake with name
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Birthday Cake with Name <span className="text-party-pink">"{name}"</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Create a personalised birthday cake for {name} in 30 seconds. Free, no signup,
            and the AI spells {name} correctly the very first time.
          </p>
          <Link to={`/free-ai-cake-designer?name=${encodeURIComponent(name)}`}>
            <Button size="lg" className="bg-gradient-party text-white font-bold text-lg px-8 py-6 shadow-elegant hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 mr-2" />
              Design {name}'s Cake Free →
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            ✅ Free • ✅ 30 seconds • ✅ No watermark on first design
          </p>
        </section>

        {/* Sample gallery */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            What "{name}" cake designs look like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {samples.map((src, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-elegant transition-shadow">
                <img
                  src={src}
                  alt={`Birthday cake design idea for ${name} — style ${i + 1}`}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Each cake design you generate will have <strong>{name}</strong> piped clearly on top.
          </p>
        </section>

        {/* Why it works */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <Type className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">Name spelled right</h3>
            <p className="text-sm text-muted-foreground">
              ChatGPT and Gemini routinely misspell {name}. Our AI is tuned for cake-name accuracy and gets it right the first try.
            </p>
          </Card>
          <Card className="p-6">
            <Cake className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">3 cake views</h3>
            <p className="text-sm text-muted-foreground">
              Front, side and top-down — see {name}'s cake from every angle, the way a real bakery photo would show it.
            </p>
          </Card>
          <Card className="p-6">
            <Heart className="w-8 h-8 text-party-pink mb-3" />
            <h3 className="font-bold text-lg mb-2">Share live to {name}</h3>
            <p className="text-sm text-muted-foreground">
              Send a link with a spinning 3D cake reveal and birthday music — far more memorable than a flat image on WhatsApp.
            </p>
          </Card>
        </section>

        {/* How */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            How to design {name}'s cake in 30 seconds
          </h2>
          <ol className="max-w-2xl mx-auto space-y-3 text-base">
            <li><strong>1.</strong> Open the free designer.</li>
            <li><strong>2.</strong> Type <strong>{name}</strong> in the name field.</li>
            <li><strong>3.</strong> Pick a theme (or let the AI pick the perfect one).</li>
            <li><strong>4.</strong> Hit generate — the cake with {name}'s name is ready in 30 seconds.</li>
            <li><strong>5.</strong> Share the animated link, or download as an image.</li>
          </ol>
          <div className="text-center mt-6">
            <Link to={`/free-ai-cake-designer?name=${encodeURIComponent(name)}`}>
              <Button size="lg" className="bg-gradient-party text-white font-bold">
                Start {name}'s Cake →
              </Button>
            </Link>
          </div>
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
          <h2 className="text-xl font-bold mb-4">Other popular name cakes</h2>
          <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
            {CAKE_NAMES.filter((n) => n.slug !== entry.slug)
              .slice(0, 24)
              .map((n) => (
                <Link
                  key={n.slug}
                  to={`/birthday-cake-for/${n.slug}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-party-pink/10 hover:border-party-pink transition-colors"
                >
                  {n.name}
                </Link>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NamedCakePage;

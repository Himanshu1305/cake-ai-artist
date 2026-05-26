import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { PricingPlans } from "@/components/PricingPlans";
import { BreadcrumbSchema, ProductReviewSchema, FAQSchema } from "@/components/SEOSchema";
import { useGeoContext } from "@/contexts/GeoContext";
import { useRequireCountry } from "@/hooks/useRequireCountry";
import { supabase } from "@/integrations/supabase/client";
import { resolveRegion, SupportedRegion } from "@/utils/countryRouting";
import { ShieldCheck, Star, Lock, RefreshCw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  useRequireCountry();
  const { detectedCountry } = useGeoContext();
  const location = useLocation();
  const [profileCountry, setProfileCountry] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<SupportedRegion>("US");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("country")
          .eq("id", session.user.id)
          .single();
        if (profile?.country) setProfileCountry(profile.country);
      }
    })();
  }, []);

  useEffect(() => {
    const urlCountry = new URLSearchParams(location.search).get("country");
    setUserCountry(resolveRegion({
      pathname: location.pathname,
      urlCountry,
      detectedCountry,
      profileCountry,
    }));
  }, [location.search, location.pathname, detectedCountry, profileCountry]);

  const faqItems = [
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes — monthly and yearly plans can be cancelled anytime. You'll keep access until the end of your current billing period.",
    },
    {
      question: "What does Lifetime include?",
      answer: "Lifetime is a one-time payment that gives you permanent access to all current and future Premium features — no recurring charges, ever.",
    },
    {
      question: "Which plan is the best value?",
      answer: "If you plan to use Cake AI Artist beyond a year, Lifetime gives the lowest cost per use. Yearly is ideal for committed users who want the lowest recurring price; Monthly is great if you want full flexibility.",
    },
    {
      question: "Can I upgrade later?",
      answer: "Absolutely. You can move from Monthly to Yearly or to Lifetime at any time.",
    },
    {
      question: "Do you offer a refund?",
      answer: "Yes — we offer a 7-day money-back guarantee on all paid plans. Just email support@cakeaiartist.com.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Pricing — Cake AI Artist Monthly, Yearly & Lifetime Plans</title>
        <meta name="description" content="Three simple plans: Monthly, Yearly or Lifetime. Pick the AI cake designer plan that suits your celebrations — clear local pricing, cancel anytime." />
        <link rel="canonical" href="https://cakeaiartist.com/pricing" />
        <meta property="og:title" content="Pricing — Cake AI Artist" />
        <meta property="og:description" content="Three simple plans: Monthly, Yearly or Lifetime. Local pricing, cancel anytime." />
        <meta property="og:url" content="https://cakeaiartist.com/pricing" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://cakeaiartist.com" },
        { name: "Pricing", url: "https://cakeaiartist.com/pricing" },
      ]} />

      <ProductReviewSchema
        itemName="Cake AI Artist Premium"
        description="Unlimited AI-designed personalized cakes with names, occasions, and downloads. Monthly, Yearly or Lifetime."
        url="https://cakeaiartist.com/pricing"
        ratingValue={4.9}
        ratingCount={2847}
        reviewCount={312}
        reviews={[
          { author: "Priya S.", reviewBody: "Made a Diwali cake for my mom in 30 seconds. She actually cried. Worth every rupee.", ratingValue: 5 },
          { author: "James K.", reviewBody: "Took the AI design to my local baker — they nailed it. Cheaper than custom design fees too.", ratingValue: 5 },
          { author: "Sarah M.", reviewBody: "Used it for 3 birthdays already. Lifetime plan paid for itself the first time.", ratingValue: 5 },
        ]}
      />

      <FAQSchema faqs={faqItems} />

      <nav className="border-b border-border bg-surface-elevated/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
            <img loading="lazy" decoding="async" src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
            <span>Cake AI Artist</span>
          </Link>
        </div>
      </nav>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Trust hero: badge + rating + testimonials BEFORE the pricing table */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-green-700" />
              <span className="text-sm font-bold text-green-900">7-Day Money-Back Guarantee</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-party bg-clip-text text-transparent">
              Simple, Honest Pricing
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Three plans. One incredible AI cake designer. Pick what works for you.
            </p>

            {/* Aggregate rating */}
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-foreground">4.9/5</span>
              <span>· 2,847 happy customers</span>
            </div>
          </div>

          {/* Testimonials above pricing — trust first */}
          <div className="grid md:grid-cols-3 gap-4 mb-10 max-w-5xl mx-auto">
            {[
              { name: "Priya S.", location: "Mumbai", text: "Made a Diwali cake for my mom in 30 seconds. She actually cried. Worth every rupee.", emoji: "🪔" },
              { name: "James K.", location: "Manchester", text: "Took the AI design to my local baker — they nailed it. Cheaper than custom design fees too.", emoji: "🎂" },
              { name: "Sarah M.", location: "Austin", text: "Used it for 3 birthdays already. Lifetime plan paid for itself the first time.", emoji: "🎉" },
            ].map((t, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl p-5 border border-border shadow-sm">
                <div className="flex items-center gap-0.5 mb-2">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground mb-3 leading-snug">"{t.text}"</p>
                <p className="text-xs font-semibold text-muted-foreground">{t.emoji} {t.name} — {t.location}</p>
              </div>
            ))}
          </div>

          <PricingPlans country={userCountry} />

          {/* Trust footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto mt-12">
            {[
              { icon: ShieldCheck, text: "7-day money-back guarantee" },
              { icon: Lock, text: "Secure payment, encrypted" },
              { icon: RefreshCw, text: "Cancel anytime, no fees" },
              { icon: Star, text: "All future updates included" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="p-4 bg-surface-elevated rounded-lg border border-border flex items-center gap-3">
                <Icon className="w-5 h-5 text-party-pink flex-shrink-0" />
                <p className="text-xs md:text-sm font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <ExitIntentModal isLoggedIn={false} isPremium={false} />
      <StickyMobileCTA />
      <Footer />
    </div>
  );
};

export default Pricing;

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { PricingPlans } from "@/components/PricingPlans";
import { BreadcrumbSchema, ProductSchema, FAQSchema } from "@/components/SEOSchema";
import { useGeoContext } from "@/contexts/GeoContext";
import { useRequireCountry } from "@/hooks/useRequireCountry";
import { supabase } from "@/integrations/supabase/client";
import { resolveRegion, SupportedRegion } from "@/utils/countryRouting";
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

      <ProductSchema
        name="Cake AI Artist Lifetime"
        description="Lifetime access to AI-powered personalized cake design."
        price="49"
        priceCurrency="USD"
        availability="InStock"
        url="https://cakeaiartist.com/pricing"
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

      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-party bg-clip-text text-transparent">
            Simple, Honest Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Three plans. One incredible AI cake designer. Pick what works for you.
          </p>

          <PricingPlans country={userCountry} />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mt-16">
            {[
              "✓ 7-day money-back guarantee",
              "✓ Secure payment via Razorpay",
              "✓ Cancel anytime, no hidden fees",
              "✓ All future updates included",
            ].map((text, i) => (
              <div key={i} className="p-4 bg-surface-elevated rounded-lg border border-border">
                <p className="text-sm font-semibold text-foreground">{text}</p>
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

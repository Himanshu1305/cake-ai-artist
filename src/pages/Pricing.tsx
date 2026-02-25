import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRequireCountry } from "@/hooks/useRequireCountry";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Crown, Star, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SpotsRemainingCounter } from "@/components/SpotsRemainingCounter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ProductSchema, BreadcrumbSchema } from "@/components/SEOSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useHolidaySale } from "@/hooks/useHolidaySale";
import { useGeoContext } from "@/contexts/GeoContext";
import { useRazorpayPayment, PaymentTier } from "@/hooks/useRazorpayPayment";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = "rzp_live_Rp0dR29v14TRpM";

// Country-specific pricing display
const PRICING_DISPLAY: Record<string, { tier1: string; tier2: string; monthly: string; symbol: string; currency: string }> = {
  IN: { tier1: "₹4,100", tier2: "₹8,200", monthly: "₹899", symbol: "₹", currency: "INR" },
  GB: { tier1: "£39", tier2: "£78", monthly: "£7.99", symbol: "£", currency: "GBP" },
  CA: { tier1: "CAD$67", tier2: "CAD$134", monthly: "CAD$13.99", symbol: "CAD$", currency: "CAD" },
  AU: { tier1: "AUD$75", tier2: "AUD$150", monthly: "AUD$14.99", symbol: "AUD$", currency: "AUD" },
  US: { tier1: "US$49", tier2: "US$99", monthly: "US$9.99", symbol: "US$", currency: "USD" },
};

// Map country codes to monthly subscription tiers
const MONTHLY_TIER_MAP: Record<string, PaymentTier> = {
  IN: "monthly_inr",
  GB: "monthly_gbp",
  CA: "monthly_cad",
  AU: "monthly_aud",
  US: "monthly_usd",
};

const Pricing = () => {
  const navigate = useNavigate();
  const { isChecking: isCheckingCountry } = useRequireCountry();
  const [userCountry, setUserCountry] = useState<string>("US");
  const { detectedCountry } = useGeoContext();
  const { sale } = useHolidaySale({ countryCode: userCountry });
  
  // Use the Razorpay payment hook for all payment processing
  const { 
    handlePayment: processPayment, 
    isLoading, 
    user, 
    razorpayLoaded 
  } = useRazorpayPayment(userCountry);

  // Determine user country with fallback chain: Profile > localStorage > GeoContext > US
  useEffect(() => {
    const determineCountry = async () => {
      // Check localStorage preference first (set by footer country picker)
      const savedPref = localStorage.getItem('user_country_preference');
      
      // If user is logged in, try to get their profile country
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.country) {
          const countryCode = profile.country === 'UK' ? 'GB' : profile.country;
          if (PRICING_DISPLAY[countryCode]) {
            setUserCountry(countryCode);
            return;
          }
        }
      }
      
      // Fallback to localStorage preference
      if (savedPref && PRICING_DISPLAY[savedPref]) {
        setUserCountry(savedPref);
        return;
      }
      
      // Fallback to detected country from IP (GeoContext)
      if (detectedCountry && PRICING_DISPLAY[detectedCountry]) {
        setUserCountry(detectedCountry);
        return;
      }
      
      // Final fallback to US
      setUserCountry("US");
    };

    determineCountry();
  }, [detectedCountry]);

  // Handler for lifetime deals (tier 1 and tier 2)
  const handleLifetimePayment = (tier: "tier_1_49" | "tier_2_99") => {
    processPayment(tier);
  };

  // Handler for monthly subscriptions - uses country-specific tier
  const handleMonthlyPayment = () => {
    const monthlyTier = MONTHLY_TIER_MAP[userCountry] || "monthly_usd";
    processPayment(monthlyTier);
  };

  const foundingFeatures = [
    "Everything in Premium",
    "2025 Member Badge (displayed on your profile)",
    "Lifetime updates & all future features",
    "Priority support forever",
    "Early access to all new characters",
    "Exclusive lifetime member perks",
    "Never pay again - locked in for life",
  ];

  const faqItems = [
    {
      question: "What happens when all spots fill up?",
      answer: "Once all 200 lifetime member spots are claimed, this deal closes forever. New users will only be able to subscribe at $9.99/month. If you claim this lifetime deal now, you'll have lifetime access regardless of future price changes."
    },
    {
      question: "Can I upgrade from free to lifetime later?",
      answer: "This is a limited-time offer with only 200 spots available. Once all spots are filled, this offer will never be available again."
    },
    {
      question: "Is this really lifetime access?",
      answer: "Yes! As long as Cake AI Artist exists, your lifetime membership will remain active. You'll never be charged again and will receive all future updates and features at no additional cost."
    },
    {
      question: "What if the service shuts down?",
      answer: "We're committed to Cake AI Artist for the long term. However, if we ever need to shut down, we'll provide 90 days notice and offer full refunds to all lifetime members."
    },
    {
      question: "Can I get a refund?",
      answer: "Yes! We offer a 7-day money-back guarantee. If you're not satisfied with your lifetime membership within 7 days, we'll provide a full refund, no questions asked."
    },
    {
      question: "What's the difference between Tier 1 and Tier 2?",
      answer: "Both tiers offer identical features and lifetime access. Tier 1 is limited to the first 50 members and costs $49, while Tier 2 is for members 51-200 and costs $99. Both receive the same benefits, but Tier 1 members get a special gold badge, while Tier 2 members get a silver badge."
    },
    {
      question: "Why should I buy now vs waiting?",
      answer: "This is the cheapest Cake AI Artist will ever be. At regular pricing of $9.99/month ($119.88/year), you'd spend $1,198.80 over 10 years. Founding members pay just $49-$99 once and save over $1,100. This offer will never be repeated."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Helmet>
        <title>Pricing - Lifetime Access for $49. Seriously. | Cake AI Artist</title>
        <meta name="description" content="First 200 people pay once and never pay again. $49 gets you unlimited cake designs forever. After that, it's $9.99/month. Your call." />
        <meta name="keywords" content="cake AI pricing, lifetime cake access, exclusive deal, AI cake subscription" />
        <link rel="canonical" href="https://cakeaiartist.com/pricing" />
        <meta property="og:title" content="Pricing - Lifetime Access for $49. Seriously. | Cake AI Artist" />
        <meta property="og:description" content="First 200 people pay once and never pay again. $49 gets you unlimited cake designs forever." />
        <meta property="og:url" content="https://cakeaiartist.com/pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing - Lifetime Access for $49. Seriously." />
        <meta name="twitter:description" content="First 200 people pay once and never pay again. $49 gets you unlimited cake designs forever." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "Pricing", url: "https://cakeaiartist.com/pricing" },
        ]}
      />
      
      <ProductSchema 
        name="Cake AI Artist Exclusive Lifetime Deal - Tier 1"
        description="Lifetime access to AI-powered personalized cake designs. First 50 members only."
        price="49"
        priceCurrency="USD"
        availability="LimitedAvailability"
        url="https://cakeaiartist.com/pricing"
      />
      
      {/* Navigation */}
      <nav className="border-b border-border bg-surface-elevated/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
            <span>Cake AI Artist</span>
          </Link>
        </div>
      </nav>

      {/* Launch Banner - Dynamic based on campaign vs default mode */}
      <section className={`${sale?.isDefault ? 'bg-gradient-gold' : 'bg-gradient-party'} text-white py-6 px-4`}>
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {sale?.isDefault ? (
              // Default mode - no countdown, show spots
              <>
                <h2 className="text-2xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-8 h-8" />
                  EXCLUSIVE LIFETIME DEAL - LIMITED SPOTS
                  <Sparkles className="w-8 h-8" />
                </h2>
                <SpotsRemainingCounter tier="total" className="justify-center" />
              </>
            ) : (
              // Campaign mode - show countdown
              <>
                <h2 className="text-2xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                  {sale?.emoji} {sale?.holidayName?.toUpperCase()} - ENDS SOON {sale?.emoji}
                </h2>
                <CountdownTimer className="justify-center" countryCode="US" />
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-party bg-clip-text text-transparent">
            Get LIFETIME ACCESS
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Never Pay Again
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            {sale?.isDefault 
              ? "Limited Spots Available • Exclusive Offer"
              : "First 200 Members Only • Limited Time Offer"
            }
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {/* Tier 1 - $49 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-4 border-gold relative hover:shadow-gold transition-all duration-300 h-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-gold text-white px-6 py-2 text-sm font-bold shadow-lg shimmer">
                    BEST VALUE ✨
                  </Badge>
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Crown className="w-6 h-6 text-gold" />
                    Lifetime Deal
                  </CardTitle>
                  <CardDescription>First 50 Members Only</CardDescription>
                  <div className="mt-4">
                    <div className="text-sm line-through text-muted-foreground">{PRICING_DISPLAY[userCountry]?.symbol || 'US$'}1,198 over 10 years</div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-gold">{PRICING_DISPLAY[userCountry]?.tier1 || 'US$49'}</span>
                      <span className="text-muted-foreground">once</span>
                    </div>
                  </div>
                  <SpotsRemainingCounter tier="tier_1_49" className="mt-3" />
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left">
                    {foundingFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-3 bg-gold/10 rounded-lg border border-gold/30">
                    <p className="text-sm font-bold text-gold">💰 Save $1,149.80 forever</p>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    className="w-full btn-shimmer bg-gradient-gold hover:shadow-gold text-white font-bold py-6"
                    onClick={() => handleLifetimePayment("tier_1_49")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "tier_1_49" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Claim Lifetime Deal
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">One-time payment • Never expires</p>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Tier 2 - $99 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-4 border-silver relative hover:shadow-elegant transition-all duration-300 h-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-slate-400 to-slate-500 text-white px-6 py-2 text-sm font-bold shadow-lg">
                    LIMITED
                  </Badge>
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 text-silver" />
                    Launch Supporter
                  </CardTitle>
                  <CardDescription>Members 51-200</CardDescription>
                  <div className="mt-4">
                    <div className="text-sm line-through text-muted-foreground">{PRICING_DISPLAY[userCountry]?.symbol || 'US$'}1,198 over 10 years</div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-silver">{PRICING_DISPLAY[userCountry]?.tier2 || 'US$99'}</span>
                      <span className="text-muted-foreground">once</span>
                    </div>
                  </div>
                  <SpotsRemainingCounter tier="tier_2_99" className="mt-3" />
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left">
                    {foundingFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-silver flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-3 bg-silver/10 rounded-lg border border-silver/30">
                    <p className="text-sm font-bold text-silver">💰 Save $1,099.80 forever</p>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    className="w-full btn-shimmer bg-gradient-to-r from-slate-400 to-slate-500 hover:shadow-elegant text-white font-bold py-6"
                    onClick={() => handleLifetimePayment("tier_2_99")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "tier_2_99" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Secure Lifetime Access
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">One-time payment • Never expires</p>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Monthly Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-border relative hover:shadow-elegant transition-all duration-300 h-full">
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl">Monthly</CardTitle>
                  <CardDescription>Flexible subscription</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold">{PRICING_DISPLAY[userCountry]?.monthly || 'US$9.99'}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">or {PRICING_DISPLAY[userCountry]?.symbol || 'US$'}119.88/year</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-party-pink flex-shrink-0 mt-0.5" />
                      <span className="text-sm">150 cakes per year</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-party-pink flex-shrink-0 mt-0.5" />
                      <span className="text-sm">All characters & themes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-party-pink flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Party Pack Generator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-party-pink flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Cancel anytime</span>
                    </li>
                  </ul>
                  <div className="mt-6 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      = $1,198.80 over 10 years
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleMonthlyPayment()}
                    disabled={isLoading !== null}
                  >
                    {isLoading?.startsWith('monthly_') ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Monthly'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-16"
          >
            {[
              "✓ 7-day money-back guarantee",
              "✓ Secure payment via Razorpay",
              "✓ This offer will NEVER be repeated",
              "✓ Cancel anytime, no hidden fees"
            ].map((text, i) => (
              <div key={i} className="p-4 bg-surface-elevated rounded-lg border border-border">
                <p className="text-sm font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
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

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Don't Miss This Once-in-a-Lifetime Offer
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join the first 200 members and lock in lifetime access at the lowest price ever.
          </p>
          <div className="flex flex-col items-center gap-4 mb-8">
            <SpotsRemainingCounter />
            <CountdownTimer countryCode="US" />
          </div>
          <Button
            size="lg"
            className="btn-shimmer bg-gradient-party hover:shadow-party text-lg px-8 py-6 font-bold"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Claim Your Lifetime Deal →
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Crown, Star, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SpotsRemainingCounter } from "@/components/SpotsRemainingCounter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ProductSchema } from "@/components/SEOSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

const Pricing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Check auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePayment = async (tier: "tier_1_49" | "tier_2_99" | "monthly_usd") => {
    // Monthly subscriptions - backend not ready yet
    if (tier === "monthly_usd") {
      toast.info("Monthly subscription coming very soon!", {
        description: "For now, grab our Lifetime Deal at 96% off - never pay again!",
        duration: 5000,
      });
      return;
    }
    // Check if user is logged in
    if (!user) {
      toast.error("Please sign in to continue", {
        description: "You need to be logged in to purchase a lifetime deal.",
        action: {
          label: "Sign In",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

    if (!razorpayLoaded) {
      toast.error("Payment system is loading, please try again in a moment.");
      return;
    }

    setIsLoading(tier);

    try {
      // Create order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { tier } }
      );

      if (orderError || !orderData) {
        console.error("Order error:", orderError);
        throw new Error(orderData?.error || "Failed to create order");
      }

      // Configure Razorpay checkout options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Cake AI Artist",
        description: tier === "tier_1_49" 
          ? "New Year Special - Lifetime Access (Tier 1)" 
          : "Launch Supporter - Lifetime Access (Tier 2)",
        order_id: orderData.order_id,
        prefill: {
          email: orderData.user_email,
          name: orderData.user_name,
        },
        theme: {
          color: "#e84393",
        },
        handler: async function (response: any) {
          // Verify payment on backend
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  tier: tier,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              console.error("Verification error:", verifyError);
              throw new Error(verifyData?.error || "Payment verification failed");
            }

            // Success!
            toast.success("🎉 Welcome to the Lifetime Club!", {
              description: `You're member #${verifyData.member_number}! Check your email for details.`,
              duration: 10000,
            });

            // Redirect to home after success
            setTimeout(() => {
              navigate("/");
            }, 2000);

          } catch (verifyErr: any) {
            console.error("Verification error:", verifyErr);
            toast.error("Payment verification failed", {
              description: "Please contact support@cakeaiartist.com with your payment details.",
            });
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(null);
            toast.info("Payment cancelled");
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed", {
          description: response.error.description || "Please try again or use a different payment method.",
        });
        setIsLoading(null);
      });
      razorpay.open();

    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Payment failed", {
        description: error.message || "Please try again.",
      });
      setIsLoading(null);
    }
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
      question: "What happens after December 31st?",
      answer: "After December 31, 2025, this New Year Lifetime Deal closes forever. New users will only be able to subscribe at $9.99/month. If you claim this lifetime deal, you'll have lifetime access regardless of future price changes."
    },
    {
      question: "Can I upgrade from free to lifetime later?",
      answer: "No, this is a one-time offer. Once the 200 spots are filled or December 31st passes (whichever comes first), this offer will never be available again."
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
        <meta name="keywords" content="cake AI pricing, lifetime cake access, new year deal, AI cake subscription" />
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
      
      <ProductSchema 
        name="Cake AI Artist New Year Special - Tier 1"
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

      {/* Launch Banner */}
      <section className="bg-gradient-party text-white py-6 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
              🎉 NEW YEAR LIFETIME DEAL - ENDS DECEMBER 31ST 🎉
            </h2>
            <CountdownTimer className="justify-center" />
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
            First 200 Members Only • Limited Time Offer
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
                    New Year Special
                  </CardTitle>
                  <CardDescription>First 50 Members Only</CardDescription>
                  <div className="mt-4">
                    <div className="text-sm line-through text-muted-foreground">US$1,198 over 10 years</div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-gold">US$49</span>
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
                    onClick={() => handlePayment("tier_1_49")}
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
                    <div className="text-sm line-through text-muted-foreground">US$1,198 over 10 years</div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-silver">US$99</span>
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
                    onClick={() => handlePayment("tier_2_99")}
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
                      <span className="text-5xl font-bold">$9.99</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">or $119.88/year</p>
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
                    onClick={() => handlePayment('monthly_usd' as any)}
                    disabled={isLoading !== null}
                  >
                    {isLoading === 'monthly_usd' ? (
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
            <CountdownTimer />
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

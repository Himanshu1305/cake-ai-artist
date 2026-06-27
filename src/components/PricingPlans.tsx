import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Crown, Gift, Loader2, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useRazorpayPayment, PaymentTier } from "@/hooks/useRazorpayPayment";
import { supabase } from "@/integrations/supabase/client";

type PriceRow = {
  monthly:  { display: string; tier: PaymentTier };
  yearly:   { display: string; tier: PaymentTier; perMonth: string };
  lifetime: { display: string; tier: PaymentTier };
  partypack:{ display: string; tier: PaymentTier; strike?: string };
};

const PRICING: Record<string, PriceRow> = {
  IN: {
    monthly:   { display: "₹299",   tier: "monthly_in" },
    yearly:    { display: "₹1,999", tier: "yearly_in",  perMonth: "₹167/mo" },
    lifetime:  { display: "₹2,999", tier: "lifetime_in" },
    partypack: { display: "₹299",   tier: "partypack_in", strike: "₹499" },
  },
  GB: {
    monthly:   { display: "£4.99",  tier: "monthly_gb" },
    yearly:    { display: "£29",    tier: "yearly_gb",  perMonth: "£2.42/mo" },
    lifetime:  { display: "£49",    tier: "lifetime_gb" },
    partypack: { display: "£4",     tier: "partypack_gb", strike: "£7" },
  },
  CA: {
    monthly:   { display: "C$6.99", tier: "monthly_ca" },
    yearly:    { display: "C$39",   tier: "yearly_ca",  perMonth: "C$3.25/mo" },
    lifetime:  { display: "C$69",   tier: "lifetime_ca" },
    partypack: { display: "C$7",    tier: "partypack_ca", strike: "C$12" },
  },
  AU: {
    monthly:   { display: "A$7.99", tier: "monthly_au" },
    yearly:    { display: "A$49",   tier: "yearly_au",  perMonth: "A$4.08/mo" },
    lifetime:  { display: "A$79",   tier: "lifetime_au" },
    partypack: { display: "A$8",    tier: "partypack_au", strike: "A$13" },
  },
  US: {
    monthly:   { display: "$4.99",  tier: "monthly_us" },
    yearly:    { display: "$29",    tier: "yearly_us",  perMonth: "$2.42/mo" },
    lifetime:  { display: "$49",    tier: "lifetime_us" },
    partypack: { display: "$5",     tier: "partypack_us", strike: "$9" },
  },
};

const COMMON_FEATURES = [
  "Unlimited cake design ideas",
  "All characters & themes",
  "Party Pack Generator",
  "AI Party Planner — concierge, smart checklists & RSVP invites",
  "Private gallery",
  "Smart occasion reminders",
];

const PARTY_PACK_FEATURES = [
  "Party Pack Generator — permanent access",
  "Cake topper, banner & invite designs",
  "Download high-res PNGs",
  "Use for unlimited parties",
];

interface PricingPlansProps {
  country?: string;
}

export const PricingPlans = ({ country = "US" }: PricingPlansProps) => {
  const cc = (PRICING[country] ? country : "US");
  const row = PRICING[cc];
  const { handlePayment, isLoading } = useRazorpayPayment(cc);

  // First-week discount banner state (client-side hint only; server is the source of truth)
  const [firstWeekEligible, setFirstWeekEligible] = useState(false);
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profile?.created_at) {
        const age = Date.now() - new Date(profile.created_at as string).getTime();
        if (age < 7 * 24 * 60 * 60 * 1000) setFirstWeekEligible(true);
      }
    })();
  }, []);

  const Plan = ({
    title, description, priceDisplay, sub, onClick, tier, highlight, badge, icon, features, strike, ctaLabel,
  }: {
    title: string;
    description: string;
    priceDisplay: string;
    sub: string;
    onClick: () => void;
    tier: PaymentTier;
    highlight?: boolean;
    badge?: string;
    icon: React.ReactNode;
    features?: string[];
    strike?: string;
    ctaLabel?: string;
  }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`h-full relative transition-all duration-300 ${highlight ? "border-4 border-gold shadow-gold" : "border-2 border-border hover:shadow-elegant"}`}>
        {badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
            <Badge className={highlight ? "bg-gradient-gold text-white px-4 py-1 text-xs font-bold shadow-lg rounded-full" : "bg-gradient-party text-white px-4 py-1 text-xs font-bold shadow-lg rounded-full"}>
              {badge}
            </Badge>
          </div>
        )}
        <CardHeader className="pt-10 text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="mt-4">
            <div className="flex items-baseline justify-center gap-2">
              {strike && (
                <span className="text-2xl text-muted-foreground line-through">{strike}</span>
              )}
              <span className={`text-5xl font-bold ${highlight ? "text-gold" : ""}`}>{priceDisplay}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{sub}</p>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-left">
            {(features ?? COMMON_FEATURES).map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${highlight ? "text-gold" : "text-party-pink"}`} />
                <span className="text-sm">{f}</span>
              </li>
            ))}
            {tier.startsWith("lifetime") && (
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-gold" />
                <span className="text-sm font-semibold">All future updates — forever</span>
              </li>
            )}
          </ul>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            className={`w-full font-bold py-6 ${highlight ? "bg-gradient-gold hover:shadow-gold text-white" : ""}`}
            variant={highlight ? "default" : "outline"}
            onClick={onClick}
            disabled={isLoading !== null}
          >
            {isLoading === tier ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : ctaLabel ? (
              <>{ctaLabel}</>
            ) : tier.startsWith("lifetime") ? (
              <><Crown className="w-4 h-4 mr-2" /> Get Lifetime Access</>
            ) : tier.startsWith("partypack") ? (
              <><Gift className="w-4 h-4 mr-2" /> Unlock Party Pack</>
            ) : (
              <>Subscribe</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            {tier.startsWith("lifetime") || tier.startsWith("partypack")
              ? "One-time payment • Never expires"
              : "Cancel anytime"}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {firstWeekEligible && (
        <div className="max-w-3xl mx-auto rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-center">
          <p className="text-sm font-bold text-amber-900">
            🎁 First-week welcome offer — <span className="underline">30% off</span> Lifetime &amp; Party Pack, applied automatically at checkout.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <Plan
          title="Party Pack"
          description="Just need party graphics?"
          priceDisplay={row.partypack.display}
          strike={row.partypack.strike}
          sub="one-time • permanent access"
          onClick={() => handlePayment(row.partypack.tier)}
          tier={row.partypack.tier}
          icon={<Gift className="w-6 h-6 text-party-pink" />}
          features={PARTY_PACK_FEATURES}
          badge="LAUNCH PRICE"
        />
        <Plan
          title="Monthly"
          description="Flexible, cancel anytime"
          priceDisplay={row.monthly.display}
          sub="per month"
          onClick={() => handlePayment(row.monthly.tier)}
          tier={row.monthly.tier}
          icon={<Zap className="w-6 h-6" />}
        />
        <Plan
          title="Yearly"
          description="Save vs monthly"
          priceDisplay={row.yearly.display}
          sub={`per year • ${row.yearly.perMonth}`}
          onClick={() => handlePayment(row.yearly.tier)}
          tier={row.yearly.tier}
          badge="BEST VALUE"
          icon={<Sparkles className="w-6 h-6 text-party-pink" />}
        />
        <Plan
          title="Lifetime"
          description="Pay once, never again"
          priceDisplay={row.lifetime.display}
          sub="one-time payment"
          onClick={() => handlePayment(row.lifetime.tier)}
          tier={row.lifetime.tier}
          highlight
          badge="MOST POPULAR ✨"
          icon={<Crown className="w-6 h-6 text-gold" />}
        />
      </div>
    </div>
  );
};

export default PricingPlans;


import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-border/50 hover:border-border transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-party-pink" />
              <h2 className="text-2xl font-bold text-foreground">Free</h2>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-foreground mb-2">$0</div>
              <p className="text-muted-foreground">Forever free, no credit card required</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-pink mt-0.5 flex-shrink-0" />
                <span className="text-foreground">3 cake generations per day</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-pink mt-0.5 flex-shrink-0" />
                <span className="text-foreground">AI-powered personalized messages</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-pink mt-0.5 flex-shrink-0" />
                <span className="text-foreground">High-quality image downloads</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-pink mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Save your favorite designs</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-pink mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Personal use only</span>
              </li>
            </ul>

            <Link to="/auth">
              <Button variant="outline" className="w-full" size="lg">
                Get Started Free
              </Button>
            </Link>
          </Card>

          {/* Premium Plan */}
          <Card className="p-8 bg-gradient-to-br from-party-purple/20 to-party-pink/20 backdrop-blur-sm border-2 border-party-purple shadow-xl hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-party-purple text-white px-3 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-6 w-6 text-party-purple" />
              <h2 className="text-2xl font-bold text-foreground">Premium</h2>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-foreground mb-2">
                $9.99<span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">Or $99/year (save 17%)</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-purple mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-semibold">Unlimited cake generations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-purple mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Priority processing (faster generation)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-purple mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Advanced customization options</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-purple mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Commercial use license</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-purple mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Ad-free experience</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-purple mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Early access to new features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-party-purple mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Priority customer support</span>
              </li>
            </ul>

            <Link to="/auth">
              <Button className="w-full bg-party-purple hover:bg-party-purple/90" size="lg">
                Upgrade to Premium
              </Button>
            </Link>

            <p className="text-center text-sm text-muted-foreground mt-4">
              7-day money-back guarantee
            </p>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Pricing FAQs</h2>
          
          <div className="space-y-6">
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Can I switch between plans?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade to premium anytime and start using unlimited generations immediately. 
                If you downgrade, your premium access continues until the end of your billing period.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-foreground">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. 
                All transactions are securely processed through industry-standard payment gateways.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Is there a refund policy?</h3>
              <p className="text-muted-foreground">
                We offer a 7-day money-back guarantee for new premium subscribers. If you're not completely satisfied, 
                contact us within 7 days for a full refund—no questions asked.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Do you offer discounts for annual plans?</h3>
              <p className="text-muted-foreground">
                Yes! Our annual plan saves you 17% compared to paying monthly. That's like getting 2 months free. 
                Plus, you won't have to worry about monthly billing.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-foreground">What happens if I exceed the free limit?</h3>
              <p className="text-muted-foreground">
                Free users can generate up to 3 cakes per day. Once you hit the limit, you'll need to wait until the next day 
                or upgrade to premium for unlimited generations. We'll always show you how many generations you have left.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-party-purple/20 to-party-pink/20 p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to create amazing cakes?</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of happy users who are making celebrations more special with personalized cake designs.
          </p>
          <Link to="/">
            <Button size="lg" className="text-lg px-8">
              Start Creating Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

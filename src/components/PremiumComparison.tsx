import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface PremiumComparisonProps {
  show: boolean;
}

export const PremiumComparison = ({ show }: PremiumComparisonProps) => {
  const navigate = useNavigate();

  if (!show) return null;

  const features = [
    { name: "Cake generations", free: "5 total", premium: "150/year" },
    { name: "Gallery slots", free: "5", premium: "30" },
    { name: "4K high-resolution downloads", free: false, premium: true },
    { name: "No watermark", free: false, premium: true },
    { name: "Priority processing", free: false, premium: true },
    { name: "10 AI message variations", free: "1", premium: true },
    { name: "Exclusive premium characters", free: false, premium: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <Card className="p-6 bg-gradient-to-br from-party-purple/10 to-party-pink/10 border-2 border-party-purple/30">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-party-purple" />
            See What Premium Can Do
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your free cake looks great, but imagine this with Premium features
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Feature</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Free</p>
          </div>
          <div className="text-center bg-party-purple/10 rounded-t-lg pb-2">
            <p className="text-xs font-semibold text-party-purple mb-2">Premium</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="grid grid-cols-3 gap-4 items-center py-2 border-b border-border last:border-0"
            >
              <p className="text-sm text-foreground">{feature.name}</p>
              <div className="text-center">
                {typeof feature.free === "boolean" ? (
                  feature.free ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">{feature.free}</span>
                )}
              </div>
              <div className="text-center bg-party-purple/5 rounded">
                {typeof feature.premium === "boolean" ? (
                  feature.premium ? (
                    <Check className="h-4 w-4 text-party-purple mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  )
                ) : (
                  <span className="text-xs text-party-purple font-semibold">{feature.premium}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={() => navigate("/pricing")}
          className="w-full bg-party-purple hover:bg-party-purple/90 gap-2"
          size="lg"
        >
          <Crown className="h-4 w-4" />
          Upgrade to Premium - $9.99/month
        </Button>
        
        <p className="text-center text-xs text-muted-foreground mt-3">
          7-day money-back guarantee • Cancel anytime
        </p>
      </Card>
    </motion.div>
  );
};

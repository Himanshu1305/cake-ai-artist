import { Crown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface VendorSearchGateProps {
  isPremium: boolean;
  children: React.ReactNode;
}

export function VendorSearchGate({ isPremium, children }: VendorSearchGateProps) {
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg text-center p-6">
        <Crown className="w-10 h-10 text-party-gold mb-3" />
        <h3 className="text-lg font-bold mb-1">Premium Feature</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Upgrade to Premium to find local{" "}
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            vendors
          </span>{" "}
          — bakeries, caterers, decorators and more — right from your party plan.
        </p>
        <Button
          onClick={() => navigate("/pricing")}
          className="bg-gradient-to-r from-party-gold to-party-orange text-white font-bold"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
}

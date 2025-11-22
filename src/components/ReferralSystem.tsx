import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ReferralSystemProps {
  userId: string;
  userEmail: string;
}

export const ReferralSystem = ({ userId, userEmail }: ReferralSystemProps) => {
  const [referralEmail, setReferralEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}?ref=${userId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share it with friends to earn rewards",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    if (!referralEmail.trim() || !referralEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("referrals").insert({
        referrer_id: userId,
        referred_email: referralEmail.trim(),
        status: "pending",
        reward_days: 7,
      });

      if (error) throw error;

      toast({
        title: "Invitation sent!",
        description: "You'll get 7 days of Premium when they sign up",
      });
      setReferralEmail("");
    } catch (error: any) {
      toast({
        title: "Failed to send invite",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 bg-gradient-to-br from-party-purple/10 to-party-pink/10 border-party-purple/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-party-purple/20 rounded-lg">
            <Gift className="h-5 w-5 text-party-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Invite Friends, Get Rewards</h3>
            <p className="text-sm text-muted-foreground">Earn 7 days Premium for each friend who joins</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="friend@email.com"
              value={referralEmail}
              onChange={(e) => setReferralEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendInvite()}
            />
            <Button
              onClick={handleSendInvite}
              disabled={isLoading}
              className="bg-party-purple hover:bg-party-purple/90"
            >
              {isLoading ? "Sending..." : "Invite"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-elevated px-2 text-muted-foreground">Or share link</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

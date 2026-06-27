import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PostShareUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: string;
}

// Localized pricing previews — exact charging happens server-side.
const COPY: Record<string, { partyPack: string; partyPackStrike: string; lifetime: string }> = {
  IN: { partyPack: "₹299", partyPackStrike: "₹499", lifetime: "₹2,999" },
  GB: { partyPack: "£4",   partyPackStrike: "£7",   lifetime: "£49" },
  CA: { partyPack: "C$7",  partyPackStrike: "C$12", lifetime: "C$69" },
  AU: { partyPack: "A$8",  partyPackStrike: "A$13", lifetime: "A$79" },
  US: { partyPack: "$5",   partyPackStrike: "$9",   lifetime: "$49" },
};

export function PostShareUpgradeModal({ open, onOpenChange, country = "US" }: PostShareUpgradeModalProps) {
  const cc = COPY[country] ? country : "US";
  const p = COPY[cc];

  const [firstWeek, setFirstWeek] = useState(false);

  useEffect(() => {
    if (!open) return;
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
        if (age < 7 * 24 * 60 * 60 * 1000) setFirstWeek(true);
      }
    })();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-party-pink" />
            Make their whole birthday unforgettable
          </DialogTitle>
          <DialogDescription>
            You just shared a beautiful cake 🎂 — want to send a matching invite, banner and thank-you card too?
          </DialogDescription>
        </DialogHeader>

        {firstWeek && (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2 text-center">
            <p className="text-sm font-bold text-amber-900">
              🎁 First-week welcome offer — 30% off applied automatically.
            </p>
          </div>
        )}

        <div className="space-y-3 mt-2">
          <div className="rounded-xl border-2 border-party-pink/40 bg-gradient-to-br from-party-pink/5 to-party-purple/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold">
                  <Gift className="w-4 h-4 text-party-pink" />
                  Party Pack
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Invitation, thank-you cards, cake topper &amp; banner. One-time, permanent.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs line-through text-muted-foreground">{p.partyPackStrike}</div>
                <div className="text-lg font-bold text-party-pink">{p.partyPack}</div>
              </div>
            </div>
            <Button asChild className="w-full mt-3 bg-gradient-to-r from-party-purple to-party-pink text-white font-bold">
              <Link to="/pricing">Unlock Party Pack</Link>
            </Button>
          </div>

          <div className="rounded-xl border-2 border-gold/40 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold">
                  <Crown className="w-4 h-4 text-gold" />
                  Lifetime Access
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unlimited cakes, all themes, AI Party Planner &amp; every future feature.
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gold">{p.lifetime}</div>
                <div className="text-xs text-muted-foreground">one-time</div>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-3 border-2 border-gold/60 font-bold">
              <Link to="/pricing">See Lifetime →</Link>
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-xs text-muted-foreground hover:text-foreground underline mx-auto"
        >
          No thanks, maybe later
        </button>
      </DialogContent>
    </Dialog>
  );
}

export default PostShareUpgradeModal;

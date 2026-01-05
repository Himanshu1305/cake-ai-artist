import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const BlogExitIntentPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('blog_exit_popup_dismissed');
    if (dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves through top of viewport
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
      }
    };

    // Small delay before attaching listener to avoid immediate triggers
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const handleDismiss = () => {
    setShowPopup(false);
    sessionStorage.setItem('blog_exit_popup_dismissed', 'true');
  };

  const handleSubscribe = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('blog_subscribers')
        .upsert({
          email: email.toLowerCase().trim(),
          user_id: user?.id || null,
          is_active: true,
          unsubscribed_at: null,
        }, {
          onConflict: 'email',
        });

      if (error) {
        console.error('Subscription error:', error);
        toast({
          title: "Subscription failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "You're in! 🎉",
        description: "Weekly cake inspiration coming your way.",
      });

      sessionStorage.setItem('blog_exit_popup_dismissed', 'true');
      setShowPopup(false);
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showPopup} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md border-party-pink/30 bg-gradient-to-br from-background to-party-purple/5">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-party flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Wait! Want more cake ideas?
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Get weekly inspiration delivered to your inbox. No spam, just cake.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              className="flex-1"
            />
            <Button
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="bg-gradient-party hover:opacity-90"
            >
              {isSubmitting ? "..." : "Subscribe"}
            </Button>
          </div>
          
          <button
            onClick={handleDismiss}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, I'll pass
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

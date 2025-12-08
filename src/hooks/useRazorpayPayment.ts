import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = "rzp_live_Rp0dR29v14TRpM";

export const useRazorpayPayment = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Don't remove script as it might be used by other components
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

  const handlePayment = async (tier: "tier_1_49" | "tier_2_99") => {
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
          } finally {
            setIsLoading(null);
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

  return {
    user,
    isLoading,
    razorpayLoaded,
    handlePayment,
  };
};

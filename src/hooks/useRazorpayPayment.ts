import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PaymentTier = 
  | "tier_1_49" 
  | "tier_2_99" 
  | "monthly_inr" 
  | "monthly_gbp" 
  | "monthly_cad" 
  | "monthly_aud" 
  | "monthly_usd";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = "rzp_live_Rp0dR29v14TRpM";

export const useRazorpayPayment = (country: string = "US") => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      // Cleanup polling on unmount
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
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

  // Check payment status manually or via polling
  const checkPaymentStatus = useCallback(async (orderId?: string) => {
    const orderToCheck = orderId || currentOrderId;
    if (!orderToCheck) return null;

    setIsCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-payment-status", {
        body: { order_id: orderToCheck },
      });

      if (error) {
        console.error("Error checking payment status:", error);
        return null;
      }

      if (data?.status === "paid" && data?.is_member) {
        // Payment was successful! Stop polling and show success
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setCurrentOrderId(null);
        setIsLoading(null);

        toast.success("🎉 Welcome to the Lifetime Club!", {
          description: `You're member #${data.member_number}! ${data.recovered ? "Payment recovered successfully." : "Check your email for details."}`,
          duration: 10000,
        });

        setTimeout(() => {
          navigate("/");
        }, 2000);

        return data;
      }

      return data;
    } catch (err) {
      console.error("Failed to check payment status:", err);
      return null;
    } finally {
      setIsCheckingStatus(false);
    }
  }, [currentOrderId, navigate]);

  // Start polling for payment status
  const startPolling = useCallback((orderId: string) => {
    // Clear any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      checkPaymentStatus(orderId);
    }, 5000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }, 300000);
  }, [checkPaymentStatus]);

  // Handle subscription flow
  const handleSubscription = async (tier: PaymentTier) => {
    setIsLoading(tier);

    try {
      // Create subscription via edge function
      const { data: subData, error: subError } = await supabase.functions.invoke(
        "create-razorpay-subscription",
        { body: { tier, country } }
      );

      if (subError) {
        console.error("Subscription error:", subError);
        throw new Error("Failed to create subscription");
      }

      // Check if plans are not yet configured (placeholder IDs)
      if (subData?.error?.includes("not yet configured") || subData?.message?.includes("coming soon")) {
        toast.info("Monthly subscription coming very soon!", {
          description: subData.message || "For now, grab our Lifetime Deal at 96% off - never pay again!",
          duration: 5000,
        });
        setIsLoading(null);
        return;
      }

      if (!subData?.subscription_id) {
        throw new Error(subData?.error || "Failed to create subscription");
      }

      setCurrentSubscriptionId(subData.subscription_id);

      // Configure Razorpay checkout for subscription
      const options = {
        key: RAZORPAY_KEY_ID,
        subscription_id: subData.subscription_id, // Use subscription_id instead of order_id
        name: "Cake AI Artist",
        description: `Monthly Premium - ${subData.display_amount}`,
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#e84393",
        },
        handler: async function (response: any) {
          // Subscription payment successful
          // Webhook will handle the subscription.activated event
          setCurrentSubscriptionId(null);
          toast.success("🎉 Subscription activated!", {
            description: "Welcome to Cake AI Artist Premium! Your subscription is now active.",
            duration: 10000,
          });

          setTimeout(() => {
            navigate("/");
          }, 2000);
          setIsLoading(null);
        },
        modal: {
          ondismiss: function () {
            setIsLoading(null);
            setCurrentSubscriptionId(null);
            toast.info("Payment window closed.");
          },
          confirm_close: true,
          escape: false,
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Subscription payment failed:", response.error);
        setCurrentSubscriptionId(null);
        toast.error("Payment failed", {
          description: response.error.description || "Please try again or use a different payment method.",
        });
        setIsLoading(null);
      });
      razorpay.open();

    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error("Subscription failed", {
        description: error.message || "Please try again.",
      });
      setIsLoading(null);
    }
  };

  // Handle one-time payment flow
  const handleOneTimePayment = async (tier: PaymentTier) => {
    setIsLoading(tier);

    try {
      // Create order via edge function with country for localized pricing
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { tier, country } }
      );

      if (orderError || !orderData) {
        console.error("Order error:", orderError);
        throw new Error(orderData?.error || "Failed to create order");
      }

      // Store order ID for polling/manual check
      setCurrentOrderId(orderData.order_id);

      // Start polling for payment status (for QR code payments)
      startPolling(orderData.order_id);

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
        notes: {
          user_id: user.id,
          tier: tier,
        },
        theme: {
          color: "#e84393",
        },
        handler: async function (response: any) {
          // Stop polling since we got callback
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

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
                  amount: orderData.amount,
                  currency: orderData.currency,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              console.error("Verification error:", verifyError);
              throw new Error(verifyData?.error || "Payment verification failed");
            }

            // Success!
            setCurrentOrderId(null);
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
              description: "Please click 'Check Payment Status' button or contact support@cakeaiartist.com",
            });
          } finally {
            setIsLoading(null);
          }
        },
        modal: {
          ondismiss: function () {
            // Don't clear order ID - user might have paid via QR
            setIsLoading(null);
            toast.info("Payment window closed. If you paid via QR code, click 'Check Payment Status'.");
          },
          confirm_close: true,
          escape: false,
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setCurrentOrderId(null);
        toast.error("Payment failed", {
          description: response.error.description || "Please try again or use a different payment method.",
        });
        setIsLoading(null);
      });
      razorpay.open();

    } catch (error: any) {
      console.error("Payment error:", error);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      toast.error("Payment failed", {
        description: error.message || "Please try again.",
      });
      setIsLoading(null);
    }
  };

  const handlePayment = async (tier: PaymentTier) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please sign in to continue", {
        description: "You need to be logged in to subscribe.",
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

    // Route to appropriate payment flow
    if (tier.startsWith("monthly_")) {
      await handleSubscription(tier);
    } else {
      await handleOneTimePayment(tier);
    }
  };

  return {
    user,
    isLoading,
    razorpayLoaded,
    handlePayment,
    currentOrderId,
    currentSubscriptionId,
    checkPaymentStatus,
    isCheckingStatus,
  };
};

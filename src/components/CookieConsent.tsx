import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useCookieConsent } from "@/hooks/useCookieConsent";

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const CookieConsent = () => {
  const { showBanner, setShowBanner, preferences, setPreferences } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
    setShowBanner(false);
    
    // Initialize Google Analytics and other tracking here
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  };

  const handleRejectAll = () => {
    const rejected = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(rejected));
    setShowBanner(false);

    // Deny consent for tracking
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }
  };

  const handleSavePreferences = () => {
    const savedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(savedPreferences));
    setShowBanner(false);

    // Update consent based on preferences
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: preferences.analytics ? "granted" : "denied",
        ad_storage: preferences.marketing ? "granted" : "denied",
      });
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto bg-card/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with icon */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  Cookie Preferences
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRejectAll}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                You can choose which cookies to accept.{" "}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Learn more in our Privacy Policy
                </Link>
              </p>

              {/* Cookie Details */}
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 mb-4 bg-muted/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        Necessary Cookies
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Essential for the website to function. Cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-4 text-sm font-medium text-primary">
                      Always Active
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        Analytics Cookies
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        Marketing Cookies
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Used to deliver personalized ads relevant to you.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({ ...preferences, marketing: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1 sm:flex-initial"
                >
                  {showDetails ? "Hide Details" : "Customize"}
                </Button>
                
                <div className="flex gap-3 flex-1">
                  <Button
                    variant="outline"
                    onClick={handleRejectAll}
                    className="flex-1"
                  >
                    Reject All
                  </Button>
                  
                  {showDetails ? (
                    <Button
                      onClick={handleSavePreferences}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Save Preferences
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Accept All
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

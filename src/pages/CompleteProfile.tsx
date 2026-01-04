import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { CountryPicker } from "@/components/CountryPicker";
import { useGeoContext } from "@/contexts/GeoContext";
import { User } from "@supabase/supabase-js";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { detectedCountry } = useGeoContext();
  const [user, setUser] = useState<User | null>(null);
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Set default country from geo-detection
  useEffect(() => {
    if (detectedCountry && !country) {
      const mappedCountry = detectedCountry === 'GB' ? 'UK' : detectedCountry;
      setCountry(mappedCountry);
    }
  }, [detectedCountry, country]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);
      
      // Check if user already has country set
      const { data: profile } = await supabase
        .from('profiles')
        .select('country')
        .eq('id', user.id)
        .single();
      
      if (profile?.country) {
        // Country already set, redirect to gallery
        navigate("/gallery");
        return;
      }
      
      setCheckingProfile(false);
    };
    
    checkUser();
  }, [navigate]);

  const handleComplete = async () => {
    if (!country) {
      toast.error("Please select your country");
      return;
    }
    
    if (!user) {
      toast.error("Session expired. Please sign in again.");
      navigate("/auth");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ country })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Profile completed!");
      navigate("/gallery");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get user's display name from Google metadata
  const displayName = user?.user_metadata?.full_name || 
                      user?.user_metadata?.name || 
                      user?.email?.split('@')[0] || 
                      'there';

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-celebration flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-party-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-celebration flex flex-col">
      <Helmet>
        <title>Complete Your Profile - Cake AI Artist</title>
        <meta name="description" content="Complete your profile to access the best AI cake designer." />
        <meta name="robots" content="noindex" />
      </Helmet>
      
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-surface-elevated/90 backdrop-blur-sm border-2 border-party-pink/30">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎂</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Almost there!
            </h1>
            <p className="text-foreground/70">
              Welcome, <span className="font-semibold text-party-pink">{displayName}</span>!
            </p>
            <p className="text-foreground/70 mt-1">
              Complete your profile to continue.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="country">Select your country</Label>
              <CountryPicker
                value={country}
                onValueChange={setCountry}
                fullWidth
              />
              <p className="text-xs text-muted-foreground">
                This determines your pricing. Cannot be changed later.
              </p>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full bg-party-pink hover:bg-party-pink/90"
              disabled={loading || !country}
            >
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default CompleteProfile;

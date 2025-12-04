import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const sendWelcomeEmail = async (userEmail: string, userFirstName: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: { 
          email: userEmail, 
          firstName: userFirstName,
          isPremium: false 
        }
      });
      
      if (error) {
        console.error("Failed to send welcome email:", error);
      } else {
        console.log("Welcome email sent successfully");
      }
    } catch (err) {
      console.error("Error sending welcome email:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input based on mode
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ firstName, lastName, email, password });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Logged in successfully!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            }
          },
        });

        if (error) throw error;
        
        // Send welcome email
        await sendWelcomeEmail(email, firstName.trim());
        
        toast.success("Account created successfully! You can now log in.");
        setIsLogin(true);
        // Clear signup fields
        setFirstName("");
        setLastName("");
        setPassword("");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-celebration flex items-center justify-center p-4">
      <Helmet>
        <title>{isLogin ? "Sign In" : "Sign Up"} - Best AI Cake Designer | Cake AI Artist</title>
        <meta name="description" content={`${isLogin ? "Sign in to" : "Create an account for"} the best AI cake designer and best virtual cake creator. Access your custom cake gallery and premium features.`} />
        <meta name="keywords" content="best ai cake designer login, sign up best virtual cake, AI cake account, best cake generator access" />
        <link rel="canonical" href="https://cakeaiartist.com/auth" />
      </Helmet>
      
      <Card className="w-full max-w-md p-8 bg-surface-elevated/90 backdrop-blur-sm border-2 border-party-pink/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🎂 Cake Creator
          </h1>
          <p className="text-foreground/70">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-party-pink hover:bg-party-pink/90 mt-2"
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          {isLogin ? (
            <button
              onClick={() => setIsLogin(false)}
              className="text-party-purple hover:underline transition-colors"
            >
              Don't have an account? Sign up
            </button>
          ) : (
            <button
              onClick={() => setIsLogin(true)}
              className="text-party-purple hover:underline transition-colors"
            >
              Already have an account? Log in
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-foreground/70 hover:text-foreground text-sm"
          >
            ← Back to home
          </button>
        </div>
      </Card>
      <Footer />
    </div>
  );
};

export default Auth;

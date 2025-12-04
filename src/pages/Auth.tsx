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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;
      
      toast.success("Password reset email sent! Check your inbox.");
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

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
        <title>{isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Sign Up"} - Best AI Cake Designer | Cake AI Artist</title>
        <meta name="description" content={`${isForgotPassword ? "Reset your password for" : isLogin ? "Sign in to" : "Create an account for"} the best AI cake designer and best virtual cake creator. Access your custom cake gallery and premium features.`} />
        <meta name="keywords" content="best ai cake designer login, sign up best virtual cake, AI cake account, best cake generator access" />
        <link rel="canonical" href="https://cakeaiartist.com/auth" />
      </Helmet>
      
      <Card className="w-full max-w-md p-8 bg-surface-elevated/90 backdrop-blur-sm border-2 border-party-pink/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🎂 Cake Creator
          </h1>
          <p className="text-foreground/70">
            {isForgotPassword 
              ? "Reset your password" 
              : isLogin 
                ? "Welcome back!" 
                : "Create your account"}
          </p>
        </div>

        {isForgotPassword ? (
          /* Forgot Password Form */
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <Button
              type="submit"
              className="w-full bg-party-pink hover:bg-party-pink/90"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-party-purple hover:underline transition-colors text-sm"
              >
                ← Back to login
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Google Sign-in Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-border hover:bg-surface-elevated"
              onClick={async () => {
                setLoading(true);
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/`,
                    },
                  });
                  if (error) throw error;
                } catch (error: any) {
                  toast.error(error.message || "Failed to sign in with Google");
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-elevated px-2 text-muted-foreground">Or continue with email</span>
              </div>
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-party-purple hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
          </>
        )}

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

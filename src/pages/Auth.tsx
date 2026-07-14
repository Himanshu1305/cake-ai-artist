import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { CountryPicker } from "@/components/CountryPicker";
import { useGeoContext } from "@/contexts/GeoContext";
import { getCountryHomePath, withWelcomeFlag } from "@/lib/postLoginRedirect";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  country: z.string().min(2, "Please select your country"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  ageConfirmed: z.literal(true, { errorMap: () => ({ message: "You must confirm you are at least 13 years old" }) }),
});

const PROFILE_LOOKUP_TIMEOUT_MS = 2500;

const withTimeout = <T,>(promise: PromiseLike<T>, timeoutMs: number): Promise<T | null> =>
  new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => resolve(null), timeoutMs);
    Promise.resolve(promise)
      .then((value) => resolve(value))
      .catch(() => resolve(null))
      .finally(() => window.clearTimeout(timeoutId));
  });

// After login, always land users on the cake creator so the primary CTA is obvious.
// Country landing pages are SEO entry points, not the post-login destination.
const POST_LOGIN_DESTINATION = '/free-ai-cake-designer';

const getPostLoginPath = async (userId: string | undefined, detectedCountry?: string | null) => {
  if (!userId) return POST_LOGIN_DESTINATION;

  const result = await withTimeout(
    supabase
      .from('profiles')
      .select('country')
      .eq('id', userId)
      .maybeSingle(),
    PROFILE_LOOKUP_TIMEOUT_MS
  );

  if (!result || result.error) return POST_LOGIN_DESTINATION;
  return result.data?.country ? POST_LOGIN_DESTINATION : '/complete-profile';
};

const Auth = () => {
  const navigate = useNavigate();
  const { detectedCountry } = useGeoContext();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    // Check URL for ?mode=reset on mount (e.g. page refresh after reset email click)
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'reset' || sessionStorage.getItem('password_reset_in_progress')) {
      setIsResetMode(true);
    }
  }, []);


  // Set default country from geo-detection
  useEffect(() => {
    if (detectedCountry && !country) {
      // Map GB to UK for our country picker
      const mappedCountry = detectedCountry === 'GB' ? 'UK' : detectedCountry;
      setCountry(mappedCountry);
    }
  }, [detectedCountry, country]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
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
    mountedRef.current = true;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    // Set up auth state listener for OAuth signups and password reset
    const { data: { subscription } } = supabase.auth.onAuthStateChange(

      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // User clicked password reset email link — store flag and show reset form
          sessionStorage.setItem('password_reset_in_progress', 'true');
          setIsResetMode(true);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          // This SIGNED_IN fires after PASSWORD_RECOVERY — skip navigation, stay on reset form
          if (sessionStorage.getItem('password_reset_in_progress')) {
            return;
          }

          const user = session.user;
          const isOAuthUser = user.app_metadata?.provider === 'google';

          if (isOAuthUser) {
            // Check if welcome email was already sent (use localStorage flag)
            const welcomeSentKey = `welcome_sent_${user.id}`;
            if (!localStorage.getItem(welcomeSentKey)) {
              // Extract name from Google metadata
              const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
              const nameParts = fullName.split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';

              // Send welcome email via Brevo (deferred)
              timeoutIds.push(setTimeout(async () => {
                if (!mountedRef.current) return;
                try {
                  await addContactToBrevo(user.email || '', firstName, lastName);
                  localStorage.setItem(welcomeSentKey, 'true');
                } catch (err) {
                  console.error('Failed to send OAuth welcome email:', err);
                }
              }, 0));
            }
          }

          // Check if user has country set after the auth event finishes.
          timeoutIds.push(setTimeout(async () => {
            if (!mountedRef.current) return;
            const path = await getPostLoginPath(user.id, detectedCountry);
            if (mountedRef.current) navigate(path, { replace: true });
          }, 0));
        }
      }
    );

    // Check if user is already logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mountedRef.current) return;
      // Don't redirect away if we're in password reset mode
      if (sessionStorage.getItem('password_reset_in_progress')) return;
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'reset') return;

      if (session) {
        const path = await getPostLoginPath(session.user.id, detectedCountry);
        if (mountedRef.current) navigate(path, { replace: true });
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      timeoutIds.forEach(clearTimeout);
    };
  }, [navigate, detectedCountry]);


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      sessionStorage.removeItem('password_reset_in_progress');
      toast.success("Password updated successfully!");
      setIsResetMode(false);
      navigate(getCountryHomePath(detectedCountry));
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const addContactToBrevo = async (userEmail: string, userFirstName: string, userLastName: string) => {
    try {
      const { error } = await supabase.functions.invoke('add-contact-to-brevo', {
        body: { 
          email: userEmail, 
          firstName: userFirstName,
          lastName: userLastName
        }
      });
      
      if (error) {
        console.error("Failed to add contact to Brevo:", error);
      } else {
        console.log("Contact added to Brevo successfully");
      }
    } catch (err) {
      console.error("Error adding contact to Brevo:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input based on mode
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ firstName, lastName, country, email, password, ageConfirmed });
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

        // Navigate immediately after the session is stored. Do not wait on profile reads here;
        // auth listeners will refresh the signed-in UI, and country can be completed later.
        navigate(getCountryHomePath(detectedCountry), { replace: true });

      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              country: country,
            }
          },
        });

        if (error) throw error;

        // Supabase returns {user: null, session: null} with no error for already-registered emails (when email confirmation is on)
        if (!data.user && !data.session) {
          toast.info("If this email is registered, you'll receive a confirmation email. Try logging in instead.");
          setIsLogin(true);
          return;
        }

        // Link anonymous page visits to the new user
        if (data.user) {
          try {
            const sessionId = sessionStorage.getItem('page_tracking_session');
            if (sessionId) {
              await supabase.rpc('link_session_visits_to_user', {
                p_user_id: data.user.id,
                p_session_id: sessionId
              });
            }
          } catch (linkError) {
            console.error('Failed to link page visits:', linkError);
            // Don't fail signup if this fails
          }

          // Handle referral bonus if ?ref= param is present
          try {
            const refParam = new URLSearchParams(window.location.search).get('ref');
            if (refParam && refParam !== data.user.id) {
              // Write referral row — service role RLS required on server; use anon key here
              // This fires and forgets; the bonus grant is handled by a server trigger or admin job
              await supabase.from('referral_bonuses' as any).insert({
                user_id: data.user.id,
                referred_by: refParam,
                bonus_granted: false,
              });
              // Grant 2 bonus generations to both referrer and new user
              await supabase.functions.invoke('grant-referral-bonus', {
                body: { new_user_id: data.user.id, referrer_id: refParam },
              });
            }
          } catch (refError) {
            console.error('Failed to process referral:', refError);
            // Non-fatal: don't block signup
          }
        }

        // Adds to Brevo marketing list (List #3) for re-engagement campaigns. Welcome email is sent separately via send-welcome-email edge function using Resend.
        await addContactToBrevo(email, firstName.trim(), lastName.trim());

        toast.success("Welcome! Let's design your first cake.");
        navigate(withWelcomeFlag(getCountryHomePath(detectedCountry)));
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-celebration flex flex-col">
      <Helmet>
        <title>{isResetMode ? "Set New Password" : isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Sign Up"} — Cake AI Artist</title>
        <meta name="description" content={`${isResetMode ? "Set a new password for" : isForgotPassword ? "Reset your password for" : isLogin ? "Sign in to" : "Create an account for"} Cake AI Artist, the best AI cake designer for personalized celebration cakes.`} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://cakeaiartist.com/auth" />
      </Helmet>
      
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img loading="lazy" decoding="async" src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-surface-elevated/90 backdrop-blur-sm border-2 border-party-pink/30">
          <div className="text-center mb-8">
            <p className="text-foreground/70">
              {isResetMode
                ? "Set your new password"
                : isForgotPassword
                  ? "Reset your password"
                  : isLogin
                    ? "Welcome back!"
                    : "Create your account"}
            </p>
          </div>

          {isResetMode ? (
            /* Set New Password Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your new password. Must be at least 8 characters.
              </p>
              <Button
                type="submit"
                className="w-full bg-party-pink hover:bg-party-pink/90"
                disabled={loading}
              >
                {loading ? "Updating..." : "Set New Password"}
              </Button>
            </form>
          ) : isForgotPassword ? (
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <CountryPicker
                        value={country}
                        onValueChange={setCountry}
                        fullWidth
                      />
                      <p className="text-xs text-muted-foreground">
                        Used to personalise your experience. Email support@cakeaiartist.com to change.
                      </p>
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

                {/* Age Verification Checkbox (GDPR) */}
                {!isLogin && (
                  <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <input
                      type="checkbox"
                      id="ageConfirmed"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-party-pink focus:ring-party-pink"
                      required
                    />
                    <label htmlFor="ageConfirmed" className="text-sm text-foreground/80">
                      I confirm that I am at least 13 years old and agree to the{" "}
                      <a href="/terms" target="_blank" className="text-party-purple hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" target="_blank" className="text-party-purple hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                )}

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
      </div>
      <Footer />
    </div>
  );
};

export default Auth;

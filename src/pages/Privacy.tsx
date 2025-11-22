import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Home, Shield, Lock, Eye, Database, Mail } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-celebration">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            <span className="bg-gradient-party bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-xl text-foreground/80">
            Your privacy matters to us <span className="floating-flame">🔒</span>
          </p>
        </div>

        {/* Privacy Cards */}
        <div className="space-y-6">
          <Card className="p-8 bg-surface-elevated border-party-pink/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-party rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Our Privacy Commitment</h2>
                <p className="text-foreground/80 text-lg">
                  At Cake Magic Creator, we respect your privacy and are committed to protecting your personal information. 
                  We believe in transparency and want you to understand exactly what data we collect and how we use it.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-purple/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Data We Collect</h2>
                <div className="text-foreground/80 space-y-2">
                  <p className="font-semibold text-foreground">For Free Users:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>We do NOT store any personal information</li>
                    <li>We do NOT collect or retain your name inputs</li>
                    <li>We do NOT save your cake designs</li>
                    <li>Your data is processed temporarily and immediately deleted</li>
                  </ul>
                  
                  <p className="font-semibold text-foreground mt-4">For Premium Users:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name (for account identification)</li>
                    <li>Email address (for login and communication)</li>
                    <li>Usage statistics (to track your 100 annual generations)</li>
                    <li>Payment information (processed securely through our payment provider)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-gold/30 border-2 shadow-gold">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-celebration rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">How We Use Your Data</h2>
                <div className="text-foreground/80 space-y-2">
                  <p>We use the minimal data we collect only for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Providing and improving our cake generation service</li>
                    <li>Managing premium subscriptions and usage limits</li>
                    <li>Sending important service updates (premium users only)</li>
                    <li>Responding to customer support requests</li>
                  </ul>
                  <p className="mt-4 font-semibold text-foreground">
                    We NEVER sell, rent, or share your personal information with third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-mint/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-mint rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Data Security</h2>
                <div className="text-foreground/80 space-y-2">
                  <p>We implement industry-standard security measures to protect your information:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>All data transmissions are encrypted using SSL/TLS</li>
                    <li>Secure password storage with industry-standard hashing</li>
                    <li>Regular security audits and updates</li>
                    <li>Restricted access to personal data (premium users only)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-pink/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-pink rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Email Communications</h2>
                <div className="text-foreground/80 space-y-2">
                  <p>We may use your email address to send you information about:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Promotional offers and special deals</li>
                    <li>New features and product updates</li>
                    <li>Blog posts and educational content</li>
                    <li>Important service announcements</li>
                  </ul>
                  <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border">
                    <p className="font-semibold text-foreground mb-2">Your Control:</p>
                    <p className="text-sm">You can unsubscribe from promotional emails at any time using the link in the email footer.</p>
                    <p className="text-sm mt-2">Service-critical emails (password resets, account security) cannot be unsubscribed from as they're essential for your account safety.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-coral/30 border-2 shadow-party">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Freemium Model Details</h2>
              <div className="text-foreground/80 space-y-3">
                <div className="p-4 bg-surface rounded-lg border border-border">
                  <h3 className="font-bold text-lg text-foreground mb-2">Free Tier</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Unlimited cake generations</li>
                    <li>Basic cake customization options</li>
                    <li>No data storage or registration required</li>
                    <li>100% anonymous usage</li>
                  </ul>
                </div>
                <div className="p-4 bg-gradient-party/10 rounded-lg border border-party-pink/30">
                  <h3 className="font-bold text-lg text-foreground mb-2">Premium Tier</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>100 premium cake generations per year</li>
                    <li>Advanced customization options</li>
                    <li>Priority support and faster processing</li>
                    <li>Save and access your cake history</li>
                    <li>High-resolution downloads</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-purple/30 border-2 shadow-party">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Your Rights</h2>
              <div className="text-foreground/80 space-y-2">
                <p>As a premium user, you have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access your personal data at any time</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and all associated data</li>
                  <li>Export your data in a standard format</li>
                  <li>Opt-out of promotional communications</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-gold/30 border-2 shadow-gold">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Changes to This Policy</h2>
              <p className="text-foreground/80">
                We may update this privacy policy from time to time. Premium users will be notified of any significant 
                changes via email. Continued use of our service after changes indicates acceptance of the updated policy.
              </p>
              <p className="text-foreground/80 mt-4">
                <strong>Last Updated:</strong> January 2025
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-party/10 border-party-pink/30 border-2 shadow-party">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Questions?</h2>
              <p className="text-foreground/80 text-lg">
                If you have any questions or concerns about our privacy policy, please contact our support team.
              </p>
              <Link to="/">
                <Button size="lg" className="mt-4 bg-gradient-party text-white hover:opacity-90 transition-opacity">
                  Back to Creating Cakes
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

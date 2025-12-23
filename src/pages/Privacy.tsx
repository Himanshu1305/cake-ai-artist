import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Home, Shield, Lock, Eye, Database, Mail, Scale, Clock, Globe, Users, Calendar } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-celebration">
      <Helmet>
        <title>Privacy Policy - Your Data Protection | Cake AI Artist</title>
        <meta name="description" content="Read Cake AI Artist's privacy policy. Learn how we protect your data and ensure secure use of the best AI cake generator platform." />
        <meta name="keywords" content="privacy policy, data protection, cake ai artist privacy, secure virtual cake designer, GDPR" />
        <link rel="canonical" href="https://cakeaiartist.com/privacy" />
        <meta property="og:title" content="Privacy Policy - Your Data Protection | Cake AI Artist" />
        <meta property="og:description" content="Read Cake AI Artist's privacy policy. Learn how we protect your data and ensure secure use of the best AI cake generator." />
        <meta property="og:url" content="https://cakeaiartist.com/privacy" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy - Your Data Protection | Cake AI Artist" />
        <meta name="twitter:description" content="Read Cake AI Artist's privacy policy. Learn how we protect your data." />
      </Helmet>
      
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

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
          <p className="text-sm text-muted-foreground">
            Last Updated: January 2025 | Effective Date: January 1, 2025
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
                  At Cake AI Artist, we respect your privacy and are committed to protecting your personal information. 
                  We believe in transparency and want you to understand exactly what data we collect and how we use it.
                </p>
              </div>
            </div>
          </Card>

          {/* Legal Basis for Processing (GDPR Article 6) */}
          <Card className="p-8 bg-surface-elevated border-party-purple/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Legal Basis for Processing</h2>
                <div className="text-foreground/80 space-y-3">
                  <p>Under GDPR, we process your personal data based on the following legal grounds:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Consent (Article 6(1)(a)):</strong> For marketing emails, analytics cookies, and optional data collection. You can withdraw consent at any time.</li>
                    <li><strong>Contract Performance (Article 6(1)(b)):</strong> To provide our cake generation service, manage your account, and process premium subscriptions.</li>
                    <li><strong>Legitimate Interests (Article 6(1)(f)):</strong> For service improvement, fraud prevention, and security purposes.</li>
                    <li><strong>Legal Obligation (Article 6(1)(c)):</strong> To comply with tax, accounting, and legal requirements.</li>
                  </ul>
                </div>
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
                    <li>Usage statistics (to track your annual generations)</li>
                    <li>Payment information (processed securely through our payment provider)</li>
                    <li>Generated cake images and designs</li>
                    <li>Occasion dates and recipient names (for reminders)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Retention Policy */}
          <Card className="p-8 bg-surface-elevated border-gold/30 border-2 shadow-gold">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-celebration rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Data Retention Policy</h2>
                <div className="text-foreground/80 space-y-2">
                  <p>We retain your data only as long as necessary:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Account Data:</strong> Retained until you delete your account</li>
                    <li><strong>Generated Images:</strong> Stored for the duration of your account (up to 20-100 images based on tier)</li>
                    <li><strong>Transaction Records:</strong> Retained for 7 years for tax/legal compliance</li>
                    <li><strong>Analytics Data:</strong> Anonymized after 26 months</li>
                    <li><strong>Support Communications:</strong> Retained for 3 years after resolution</li>
                  </ul>
                  <p className="mt-4">
                    You can request deletion of your data at any time through your{" "}
                    <Link to="/settings" className="text-party-pink hover:underline font-medium">
                      Settings page
                    </Link>.
                  </p>
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
                    <li>Sending occasion reminders (if enabled)</li>
                  </ul>
                  <p className="mt-4 font-semibold text-foreground">
                    We NEVER sell, rent, or share your personal information with third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* International Data Transfers */}
          <Card className="p-8 bg-surface-elevated border-party-mint/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-purple rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">International Data Transfers</h2>
                <div className="text-foreground/80 space-y-2">
                  <p>Your data may be processed in countries outside your residence:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>United States:</strong> Cloud infrastructure and AI processing</li>
                    <li><strong>European Union:</strong> Database hosting and backup services</li>
                  </ul>
                  <p className="mt-4">
                    For transfers outside the EU/EEA, we ensure appropriate safeguards including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                    <li>Data Processing Agreements with all third-party processors</li>
                    <li>Adequacy decisions where applicable</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Third-Party Data Processors */}
          <Card className="p-8 bg-surface-elevated border-party-mint/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-coral rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Third-Party Data Processors</h2>
                <div className="text-foreground/80 space-y-2">
                  <p>We work with trusted service providers who process data on our behalf:</p>
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-background/50 rounded-lg border border-border">
                      <p className="font-semibold text-foreground">Database & Authentication</p>
                      <p className="text-sm">Supabase Inc. (USA) - Data hosting, user authentication, file storage</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border">
                      <p className="font-semibold text-foreground">AI Image Generation</p>
                      <p className="text-sm">Google Cloud (USA) - Gemini AI for cake image generation</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border">
                      <p className="font-semibold text-foreground">Email Services</p>
                      <p className="text-sm">Resend Inc. (USA) - Transactional and marketing emails</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border">
                      <p className="font-semibold text-foreground">Payment Processing</p>
                      <p className="text-sm">Stripe Inc. (USA) - Secure payment processing (PCI-DSS compliant)</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border">
                      <p className="font-semibold text-foreground">Analytics</p>
                      <p className="text-sm">Google Analytics (USA) - Website analytics (with consent only)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cookie Details */}
          <Card className="p-8 bg-surface-elevated border-party-pink/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-orange rounded-full flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Cookies We Use</h2>
                <div className="text-foreground/80 space-y-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse mt-4">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-semibold">Cookie Name</th>
                          <th className="text-left py-2 px-3 font-semibold">Purpose</th>
                          <th className="text-left py-2 px-3 font-semibold">Duration</th>
                          <th className="text-left py-2 px-3 font-semibold">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="py-2 px-3">sb-*-auth-token</td>
                          <td className="py-2 px-3">User authentication session</td>
                          <td className="py-2 px-3">1 year</td>
                          <td className="py-2 px-3">Necessary</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">cookieConsent</td>
                          <td className="py-2 px-3">Stores your cookie preferences</td>
                          <td className="py-2 px-3">1 year</td>
                          <td className="py-2 px-3">Necessary</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">_ga, _gid</td>
                          <td className="py-2 px-3">Google Analytics (with consent)</td>
                          <td className="py-2 px-3">2 years / 24h</td>
                          <td className="py-2 px-3">Analytics</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">_gcl_*</td>
                          <td className="py-2 px-3">Google Ads conversion tracking</td>
                          <td className="py-2 px-3">90 days</td>
                          <td className="py-2 px-3">Marketing</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-sm">
                    You can manage your cookie preferences at any time using the "Cookie Settings" link in the footer.
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
                    <li>Row-Level Security (RLS) for database protection</li>
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

          {/* Minimum Age Requirement */}
          <Card className="p-8 bg-surface-elevated border-party-coral/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Age Requirement</h2>
                <div className="text-foreground/80 space-y-2">
                  <p className="font-semibold text-lg text-foreground">
                    You must be at least 13 years old to use Cake AI Artist.
                  </p>
                  <p>
                    We do not knowingly collect personal information from children under 13. If you are a parent or 
                    guardian and believe your child has provided us with personal information, please contact us 
                    immediately at{" "}
                    <a href="mailto:support@cakeaiartist.com" className="text-party-pink hover:underline font-medium">
                      support@cakeaiartist.com
                    </a>.
                  </p>
                  <p>
                    If you are between 13-16 years old (or the applicable age of digital consent in your jurisdiction), 
                    you may need parental consent to create an account.
                  </p>
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
                    <li>5 generations per day, 12 per month</li>
                    <li>Basic cake customization options</li>
                    <li>No data storage or registration required</li>
                    <li>100% anonymous usage</li>
                  </ul>
                </div>
                <div className="p-4 bg-gradient-party/10 rounded-lg border border-party-pink/30">
                  <h3 className="font-bold text-lg text-foreground mb-2">Premium Tier</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>150 premium cake generations per year</li>
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
              <h2 className="text-2xl font-bold text-foreground">Your Rights (GDPR Articles 15-22)</h2>
              <div className="text-foreground/80 space-y-2">
                <p>As a user, you have the following rights under GDPR:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Right of Access (Art. 15):</strong> Request a copy of your personal data</li>
                  <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate data</li>
                  <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your account and data</li>
                  <li><strong>Right to Data Portability (Art. 20):</strong> Export your data in a machine-readable format</li>
                  <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time for consent-based processing</li>
                </ul>
                <div className="mt-4 p-4 bg-party-pink/10 rounded-lg border border-party-pink/30">
                  <p className="font-semibold text-foreground mb-2">Exercise Your Rights:</p>
                  <p className="text-sm">
                    Visit your{" "}
                    <Link to="/settings" className="text-party-pink hover:underline font-medium">
                      Settings page
                    </Link>{" "}
                    to export or delete your data, or contact us at{" "}
                    <a href="mailto:support@cakeaiartist.com" className="text-party-pink hover:underline font-medium">
                      support@cakeaiartist.com
                    </a>.
                  </p>
                </div>
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
                If you have any questions or concerns about our privacy policy, please contact us at{' '}
                <a href="mailto:support@cakeaiartist.com" className="text-party-pink hover:underline font-medium">
                  support@cakeaiartist.com
                </a>
              </p>
              <p className="text-foreground/80 text-sm">
                For GDPR-related inquiries, you may also contact your local Data Protection Authority.
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
      <Footer />
    </div>
  );
};

export default Privacy;

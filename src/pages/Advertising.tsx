import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Home, Megaphone, Eye, UserCheck, Shield, Baby, Link2, Mail, Settings } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Advertising = () => {
  return (
    <div className="min-h-screen bg-gradient-celebration">
      <Helmet>
        <title>Advertising Disclosure - How We Use Ads | Cake AI Artist</title>
        <meta name="description" content="Learn about advertising on Cake AI Artist. Understand how we use Google AdSense, personalized ads, and your choices for ad preferences." />
        <meta name="keywords" content="advertising disclosure, google adsense, ad policy, cake ai artist ads, personalized advertising" />
        <link rel="canonical" href="https://cakeaiartist.com/advertising" />
        <meta property="og:title" content="Advertising Disclosure - How We Use Ads | Cake AI Artist" />
        <meta property="og:description" content="Learn about advertising on Cake AI Artist and your choices for ad preferences." />
        <meta property="og:url" content="https://cakeaiartist.com/advertising" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Advertising Disclosure - How We Use Ads | Cake AI Artist" />
        <meta name="twitter:description" content="Learn about advertising on Cake AI Artist and your choices for ad preferences." />
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
              Advertising Disclosure
            </span>
          </h1>
          <p className="text-xl text-foreground/80">
            How advertising supports our free service <span className="floating-flame">📢</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Last Updated: January 2025
          </p>
        </div>

        {/* Advertising Cards */}
        <div className="space-y-6">
          <Card className="p-8 bg-surface-elevated border-party-pink/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-party rounded-full flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Our Advertising Practices</h2>
                <p className="text-foreground/80 text-lg">
                  Cake AI Artist is a free service that relies on advertising revenue to cover operational costs 
                  and continue providing our AI cake generation technology at no charge to users. 
                  We partner with reputable advertising networks to display relevant, non-intrusive advertisements.
                </p>
                <p className="text-foreground/80">
                  We are committed to maintaining a positive user experience while ensuring our advertising 
                  practices are transparent, ethical, and compliant with all applicable regulations.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-purple/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Types of Advertisements</h2>
                <div className="text-foreground/80 space-y-3">
                  <p>We display the following types of advertisements on our platform:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Display Ads:</strong> Banner and rectangle advertisements shown in sidebars and between content sections.</li>
                    <li><strong>In-Article Ads:</strong> Responsive advertisements placed within blog posts and long-form content.</li>
                    <li><strong>Auto Ads:</strong> Google AdSense automatically optimized placements that adapt to your device and screen size.</li>
                  </ul>
                  <p className="mt-4">
                    All advertisements are clearly distinguishable from our editorial content and are labeled appropriately.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-gold/30 border-2 shadow-gold">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-celebration rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Personalized Advertising</h2>
                <div className="text-foreground/80 space-y-3">
                  <p>
                    We use Google AdSense, which may display personalized advertisements based on your interests 
                    and browsing behavior. Google uses cookies and similar technologies to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Remember your ad preferences</li>
                    <li>Show ads relevant to your interests</li>
                    <li>Limit the number of times you see an ad</li>
                    <li>Measure the effectiveness of advertising campaigns</li>
                  </ul>
                  <p className="mt-4">
                    You can control personalized advertising through your{" "}
                    <a 
                      href="https://adssettings.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-party-pink hover:underline font-medium"
                    >
                      Google Ad Settings
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-mint/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-purple rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Third-Party Advertisers</h2>
                <div className="text-foreground/80 space-y-3">
                  <p>Our primary advertising partner is:</p>
                  <div className="p-4 bg-background/50 rounded-lg border border-border mt-4">
                    <p className="font-semibold text-foreground">Google AdSense</p>
                    <p className="text-sm mt-2">
                      Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of 
                      the DART cookie enables it to serve ads based on your visit to our site and other sites 
                      on the Internet.
                    </p>
                    <p className="text-sm mt-2">
                      You may opt out of the use of the DART cookie by visiting the{" "}
                      <a 
                        href="https://policies.google.com/technologies/ads" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-party-pink hover:underline"
                      >
                        Google ad and content network privacy policy
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-coral/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-coral rounded-full flex items-center justify-center flex-shrink-0">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Your Ad Choices</h2>
                <div className="text-foreground/80 space-y-3">
                  <p>You have several options to control advertising on our site and across the web:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Google Ad Settings:</strong>{" "}
                      <a 
                        href="https://adssettings.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-party-pink hover:underline"
                      >
                        Manage your Google ad preferences
                      </a>
                    </li>
                    <li>
                      <strong>NAI Opt-Out:</strong>{" "}
                      <a 
                        href="https://optout.networkadvertising.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-party-pink hover:underline"
                      >
                        Network Advertising Initiative opt-out page
                      </a>
                    </li>
                    <li>
                      <strong>DAA Opt-Out:</strong>{" "}
                      <a 
                        href="https://optout.aboutads.info" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-party-pink hover:underline"
                      >
                        Digital Advertising Alliance opt-out
                      </a>
                    </li>
                    <li>
                      <strong>Cookie Settings:</strong> Use our cookie consent banner or the "Cookie Settings" 
                      link in the footer to manage advertising cookies on our site.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-orange/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-orange rounded-full flex items-center justify-center flex-shrink-0">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Children's Advertising</h2>
                <div className="text-foreground/80 space-y-3">
                  <p>
                    We are committed to protecting children's privacy and complying with the Children's 
                    Online Privacy Protection Act (COPPA) and similar regulations worldwide.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We do not knowingly collect personal information from children under 13</li>
                    <li>We do not display targeted advertising to users we know are under 13</li>
                    <li>Our advertising partners are required to comply with COPPA requirements</li>
                    <li>If you believe a child has provided personal information, please contact us immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-pink/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-party-mint rounded-full flex items-center justify-center flex-shrink-0">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Affiliate Links Disclosure</h2>
                <div className="text-foreground/80 space-y-3">
                  <p>
                    In accordance with FTC guidelines, we disclose that some links on our website may be 
                    affiliate links. This means:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We may earn a commission if you make a purchase through these links</li>
                    <li>There is no additional cost to you</li>
                    <li>Affiliate relationships do not influence our editorial content or recommendations</li>
                    <li>We only recommend products and services we genuinely believe in</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-surface-elevated border-party-purple/30 border-2 shadow-party">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-party rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
                <div className="text-foreground/80 space-y-3">
                  <p>
                    If you have questions about our advertising practices or want to report an inappropriate 
                    advertisement, please contact us:
                  </p>
                  <div className="p-4 bg-background/50 rounded-lg border border-border mt-4">
                    <p><strong>Email:</strong>{" "}
                      <a 
                        href="mailto:support@cakeaiartist.com" 
                        className="text-party-pink hover:underline"
                      >
                        support@cakeaiartist.com
                      </a>
                    </p>
                    <p className="mt-2"><strong>Subject Line:</strong> Advertising Inquiry</p>
                  </div>
                  <p className="mt-4">
                    We take all feedback seriously and will respond to your inquiry within 48 business hours.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Related Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              to="/privacy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-party-pink text-white rounded-lg hover:bg-party-pink/90 transition-colors font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-party-purple text-white rounded-lg hover:bg-party-purple/90 transition-colors font-medium"
            >
              Terms of Service
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-party-pink text-party-pink rounded-lg hover:bg-party-pink/10 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Advertising;

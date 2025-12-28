import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { BreadcrumbSchema } from "@/components/SEOSchema";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Terms of Service - User Agreement | Cake AI Artist</title>
        <meta name="description" content="Read the terms of service for Cake AI Artist, the best AI cake generator. Understand your rights and responsibilities when using our virtual cake designer platform." />
        <meta name="keywords" content="terms of service, user agreement, cake ai artist terms, best AI cake generator policy" />
        <link rel="canonical" href="https://cakeaiartist.com/terms" />
        <meta property="og:title" content="Terms of Service - User Agreement | Cake AI Artist" />
        <meta property="og:description" content="Read the terms of service for Cake AI Artist, the best AI cake generator. Understand your rights and responsibilities." />
        <meta property="og:url" content="https://cakeaiartist.com/terms" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service - User Agreement | Cake AI Artist" />
        <meta name="twitter:description" content="Read the terms of service for Cake AI Artist, the best AI cake generator." />
      </Helmet>
      
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://cakeaiartist.com" },
          { name: "Terms of Service", url: "https://cakeaiartist.com/terms" },
        ]}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">

        <article className="bg-card/50 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Cake AI Artist, you accept and agree to be bound by these Terms of Service. 
                If you don't agree with any part of these terms, please don't use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Service Description</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Cake AI Artist is an AI-powered tool that generates personalized cake designs based on user input. 
                We provide both free and premium subscription tiers with different feature sets.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Free users can generate up to 3 cakes per day. Premium subscribers get unlimited generations, 
                priority processing, and access to advanced customization features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide accurate information when creating an account</li>
                <li>Keep your account credentials secure</li>
                <li>Not use the service for illegal or unauthorized purposes</li>
                <li>Not attempt to reverse engineer or copy our AI technology</li>
                <li>Not generate content that is offensive, defamatory, or infringes on others' rights</li>
                <li>Not use automated tools to access the service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>Your Content:</strong> You retain ownership of any text, names, or other content you input into our service. 
                However, by using our service, you grant us a license to process this content to generate your cake designs.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>Generated Images:</strong> Images generated through our service are yours to use for personal purposes. 
                Premium subscribers receive a commercial use license. Free users may use images for personal, non-commercial purposes only.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Our Platform:</strong> The Cake AI Artist platform, including our AI technology, design, and code, 
                remains our exclusive property. All rights reserved.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Premium Subscription Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Premium subscriptions are billed monthly or annually, depending on your chosen plan. 
                All fees are non-refundable except as required by law or stated in our refund policy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can cancel your subscription at any time. Your premium access will continue until the end of your current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Refund and Cancellation Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We offer a 7-day money-back guarantee for new premium subscribers. If you're not satisfied within the first 7 days, 
                contact us at support@cakeaiartist.com for a full refund.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                After the 7-day period, no refunds will be issued for partial months. You may cancel anytime to prevent future charges.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Service Limitations and Availability</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. We may need to perform maintenance, 
                updates, or experience technical difficulties that temporarily affect availability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cake AI Artist is provided "as is" without warranties of any kind. We are not liable for any damages arising from 
                your use of the service, including but not limited to direct, indirect, incidental, or consequential damages. 
                Our total liability is limited to the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Account Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend your account if you violate these terms, engage in fraudulent activity, 
                or misuse the service. You may also delete your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these terms or your use of the service will be resolved through binding arbitration 
                in accordance with the rules of the American Arbitration Association. You agree to waive your right to a jury trial 
                or to participate in a class action lawsuit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms of Service from time to time. We'll notify you of significant changes via email or 
                through a prominent notice on our website. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Email: support@cakeaiartist.com<br />
                Response time: Within 24-48 hours
              </p>
            </section>

            <section className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                By using Cake AI Artist, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;

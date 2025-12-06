import { motion } from "framer-motion";
import { Shield, Lock, Award, Users, Clock, CheckCircle } from "lucide-react";

const trustBadges = [
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared with third parties",
    color: "text-party-purple"
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Full compliance with EU data protection regulations",
    color: "text-party-pink"
  },
  {
    icon: Award,
    title: "10,000+ Happy Users",
    description: "Trusted by party planners, parents & professionals worldwide",
    color: "text-gold"
  },
  {
    icon: Users,
    title: "Built by Team CakeAIartist",
    description: "Passionate team dedicated to making celebrations memorable",
    color: "text-party-coral"
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "Reliable service when you need it most",
    color: "text-party-purple"
  },
  {
    icon: CheckCircle,
    title: "Satisfaction Guaranteed",
    description: "Love your designs or we'll make it right",
    color: "text-party-pink"
  }
];

export const TrustBadges = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Why Trust Cake AI Artist?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We're committed to providing you with a secure, reliable, and delightful experience
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {trustBadges.map((badge, index) => (
          <motion.div
            key={badge.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="group"
          >
            <div className="bg-surface-elevated/80 backdrop-blur-sm rounded-xl p-6 h-full border border-border/50 hover:border-party-pink/30 transition-all duration-300 hover:shadow-lg hover:shadow-party-pink/5 text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-background mb-4 ${badge.color}`}>
                <badge.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2 leading-tight">
                {badge.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {badge.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Indicators Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-party-purple" />
          <span>256-bit SSL Encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-party-pink" />
          <span>No Credit Card Required</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-gold" />
          <span>4.9★ Average Rating</span>
        </div>
      </motion.div>
    </section>
  );
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24-48 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Contact Us - Best AI Cake Designer Support | Cake AI Artist</title>
        <meta name="description" content="Have questions about the best AI cake designer? Contact Cake AI Artist for support with the best virtual cake creator. We typically respond within 24-48 hours." />
        <meta name="keywords" content="contact best ai cake designer, best virtual cake support, cake generator help, customer service" />
        <link rel="canonical" href="https://cakeaiartist.com/contact" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">Contact the Best AI Cake Designer</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Have a question about the best virtual cake creator? We&apos;d love to hear from you. 
              Drop us a message and we&apos;ll get back to you as soon as possible.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg">
                <Mail className="h-6 w-6 text-party-purple mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                  <p className="text-muted-foreground">support@cakemagic.com</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For general inquiries and support
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg">
                <Clock className="h-6 w-6 text-party-purple mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                  <p className="text-muted-foreground">Within 24-48 hours</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We typically respond during business hours (Mon-Fri, 9am-5pm EST)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-party-purple mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Quick Answers</h3>
                  <p className="text-muted-foreground">
                    Need help right away? Check our <Link to="/faq" className="text-party-purple hover:underline">FAQ page</Link> for instant answers to common questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more..."
                  rows={6}
                  className="w-full"
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;

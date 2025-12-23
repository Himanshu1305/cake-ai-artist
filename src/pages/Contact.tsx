import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { LocalBusinessSchema } from "@/components/SEOSchema";

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
        <title>Contact Us - Questions, Feedback, Whatever | Cake AI Artist</title>
        <meta name="description" content="Got a question? Found a bug? Want to say hi? We read everything and reply within a day or two. Really." />
        <meta name="keywords" content="contact support, cake artist help, virtual cake customer service" />
        <link rel="canonical" href="https://cakeaiartist.com/contact" />
        <meta property="og:title" content="Contact Us - Questions, Feedback, Whatever | Cake AI Artist" />
        <meta property="og:description" content="Got a question? Found a bug? Want to say hi? We reply within a day or two." />
        <meta property="og:url" content="https://cakeaiartist.com/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cakeaiartist.com/hero-cake.jpg" />
        <meta property="og:site_name" content="Cake AI Artist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us - Questions, Feedback, Whatever" />
        <meta name="twitter:description" content="Got a question? Found a bug? Want to say hi? We reply within a day or two." />
        <meta name="twitter:image" content="https://cakeaiartist.com/hero-cake.jpg" />
      </Helmet>
      
      <LocalBusinessSchema 
        name="Cake AI Artist"
        url="https://cakeaiartist.com"
        email="support@cakeaiartist.com"
      />
      
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
          <span>Cake AI Artist</span>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">Get in Touch</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Questions, feedback, feature requests, bug reports—we read it all. 
              Not just into a void, either. Actual humans respond.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg">
                <Mail className="h-6 w-6 text-party-purple mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                  <p className="text-muted-foreground">support@cakeaiartist.com</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For anything, really
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg">
                <Clock className="h-6 w-6 text-party-purple mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">When We Reply</h3>
                  <p className="text-muted-foreground">Usually within 24-48 hours</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Business hours are Mon-Fri, 9am-5pm EST, but sometimes we check on weekends too
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-party-purple mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Quick Answers</h3>
                  <p className="text-muted-foreground">
                    Need help now? Our <Link to="/faq" className="text-party-purple hover:underline">FAQ page</Link> has 
                    answers to the stuff people ask most. Might solve your problem faster.
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
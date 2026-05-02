import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const HOMEPAGE_FAQS = [
  {
    question: "Is this AI cake generator really free?",
    answer:
      "Yes — Cake AI Artist is a free AI cake generator. You can design AI cakes for birthdays, anniversaries and any celebration without paying a rupee or dollar upfront. Free users get 5 lifetime AI cake designs and 5 gallery slots; upgrade only if you want unlimited designs, party packs and high-resolution downloads.",
  },
  {
    question: "What is the best AI cake designer?",
    answer:
      "Cake AI Artist is rated 4.9 by thousands of users for designing personalized cakes in 30 seconds. It combines AI image generation trained on real cake design with name placement, occasion-aware styling and color theming — which is why it consistently ranks as the best AI cake designer for birthdays, anniversaries and celebrations.",
  },
  {
    question: "Can I design a personalized birthday cake online for free?",
    answer:
      "Yes — you can start designing a personalized birthday cake for free, no signup required for your first design. Type a name, pick an occasion, and the best personalized cake designer on the web generates a unique cake image in about 30 seconds.",
  },
  {
    question: "How does an AI cake designer work?",
    answer:
      "An AI cake designer takes the details that matter — name, age, occasion, colors, theme — and turns them into a unique cake image. Cake AI Artist runs purpose-built models that understand cake structure (layers, frosting, toppers, candles) so the result actually looks like a cake you'd order, not a generic AI rendering.",
  },
  {
    question: "Can I design cakes for occasions other than birthdays?",
    answer:
      "Absolutely. While birthdays are our most popular use case, Cake AI Artist designs personalized cakes for any occasion — anniversaries, weddings, baby showers, retirements, graduations, Diwali, Holi, Christmas, Eid, Easter and more. Just pick your occasion in the creator and the AI tailors the cake design, message, decorations and color palette to match.",
  },
  {
    question: "Is Cake AI Artist good for birthdays, anniversaries and weddings?",
    answer:
      "Yes — it's designed for every celebration. Birthdays, anniversaries, weddings, baby showers, retirements, graduations and more. Each occasion has its own templates, color palettes and message styles, so the cake design feels right for the moment.",
  },
  {
    question: "Can I download or print my AI-designed cake?",
    answer:
      "Yes. Every cake comes as a high-resolution image you can download, share on social media, or take to your local baker as a reference for a real cake. Premium users also get matching party printables (invitations, banners, thank-you cards) generated from the same design.",
  },
  {
    question: "Why is Cake AI Artist the best personalized cake designer?",
    answer:
      "Generic AI tools can't reliably spell names on cakes or match a cake style to an occasion. Cake AI Artist is specialized for cakes — name placement, occasion-aware design, multi-tier layouts, character options and a curated color system — which is why people call it the best personalized cake designer online.",
  },
];

export const HomepageFAQ = () => {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Frequently Asked Questions about the Best AI Cake Designer
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about designing personalized cakes with AI.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {HOMEPAGE_FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

/**
 * Hub-and-spoke internal linking: renders 3-4 sibling AI cake tool links as an
 * in-content "Related tools" section. Pass `exclude` = the current page path so
 * a page never links to itself. Complements the site-wide footer link groups.
 */
const ALL_TOOLS: { to: string; title: string; desc: string }[] = [
  { to: "/free-ai-cake-designer", title: "Free AI Cake Designer", desc: "Design any cake online free in about 30 seconds." },
  { to: "/3d-cake-designer", title: "3D Cake Designer", desc: "Photorealistic 3D cake renders from three angles." },
  { to: "/photo-cake-maker", title: "Photo Cake Maker", desc: "Add a personal photo and name to a cake design." },
  { to: "/ai-birthday-cake-with-name", title: "Birthday Cake with Name", desc: "Any name on a birthday cake, spelled correctly." },
  { to: "/wedding-cake-designer", title: "Wedding Cake Designer", desc: "Visualise multi-tier wedding cakes in seconds." },
  { to: "/anniversary-cake-designer", title: "Anniversary Cake Designer", desc: "Anniversary cakes with a photo and names." },
  { to: "/personalized-cake-online", title: "Personalised Cake Online", desc: "Custom cakes designed around any occasion." },
  { to: "/eggless-cake-design", title: "Eggless Cake Design", desc: "Photorealistic egg-free cake designs, free to try." },
];

interface RelatedToolsProps {
  /** Current page path to exclude from the list, e.g. "/photo-cake-maker". */
  exclude?: string;
  /** How many sibling tools to show (default 4). */
  count?: number;
  heading?: string;
}

export const RelatedTools = ({ exclude, count = 4, heading = "Related AI cake tools" }: RelatedToolsProps) => {
  const tools = ALL_TOOLS.filter((t) => t.to !== exclude).slice(0, count);
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link key={tool.to} to={tool.to} className="block">
              <Card className="p-5 h-full border-2 hover:border-party-pink/40 transition-colors">
                <h3 className="font-bold mb-1">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

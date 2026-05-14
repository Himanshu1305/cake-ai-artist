import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, BookOpen } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_time: string | null;
  featured_image: string | null;
}

interface Props {
  countryCode: "IN" | "UK" | "AU" | "CA";
  countryName: string;
}

/**
 * Country-specific blog strip for landing pages.
 * Pulls latest 3 published posts where target_country = countryCode OR is universal (null).
 */
export const CountryBlogFeed = ({ countryCode, countryName }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("slug, title, excerpt, category, read_time, featured_image")
          .eq("is_published", true)
          .or(`target_country.eq.${countryCode},target_country.is.null`)
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(3);
        setPosts((data || []) as Post[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [countryCode]);

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-party-pink uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              From our {countryName} kitchen
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Fresh cake ideas for {countryName}
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm font-bold text-party-purple hover:text-party-pink transition-colors"
          >
            See all articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {p.featured_image && (
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={p.featured_image}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-party-purple uppercase mb-2">
                  <span>{p.category}</span>
                  {p.read_time && <span className="text-muted-foreground">· {p.read_time}</span>}
                </div>
                <h3 className="text-base font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-party-pink transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

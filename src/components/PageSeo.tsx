import { Helmet } from "react-helmet-async";

/**
 * Reusable per-route SEO head. Enforces self-referencing canonical + og:url,
 * so new pages can't accidentally leak equity to the homepage.
 *
 * Existing pages (Index, NamedCakePage, ThemedCakePage, generators) already
 * use <Helmet> directly with their own schema components — no need to
 * refactor them. Use <PageSeo /> for all new pages (age-milestone,
 * relationship, editorial pillars, "vs" posts) going forward.
 */

const SITE = "https://cakeaiartist.com";
const DEFAULT_OG_IMAGE = `${SITE}/hero-cake.jpg`;

export interface PageSeoProps {
  /** Absolute path starting with "/" — e.g. "/blog/history-of-birthday-cakes" */
  path: string;
  /** <60 chars, primary keyword first */
  title: string;
  /** <160 chars, hook + keyword */
  description: string;
  /** og:type — "website" for landing pages, "article" for editorial/blog. */
  type?: "website" | "article";
  /** Absolute URL to social preview image. Defaults to hero cake. */
  image?: string;
  /** Set true to noindex a page (draft, thin, or gated content). */
  noindex?: boolean;
  /** Optional keywords string (only used when explicitly passed). */
  keywords?: string;
  /** Any JSON-LD schema objects to inject alongside the head tags. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const PageSeo = ({
  path,
  title,
  description,
  type = "website",
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  keywords,
  jsonLd,
}: PageSeoProps) => {
  const url = `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta
        name="robots"
        content={noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}
      />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Cake AI Artist" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageSeo;

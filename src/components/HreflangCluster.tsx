import { Helmet } from "react-helmet-async";

/**
 * hreflang cluster for the country landing pages.
 *
 * /uk, /usa, /canada, /australia and /india carry near-identical copy with
 * local pricing, spellings and examples. Without hreflang, Google reads them
 * as duplicates of one another, picks one and files the rest under
 * "Alternate page with proper canonical" — which is what Search Console
 * showed on 2026-10-30 (22 pages).
 *
 * Declaring the cluster tells Google they are regional variants of the same
 * page rather than duplicates, so each can be indexed and served to its own
 * country. The homepage is x-default for everyone else.
 *
 * Rules that make this valid, and that a future edit must preserve:
 *   - every page in the cluster lists EVERY page in the cluster, itself
 *     included (the set must be symmetric, or Google ignores it)
 *   - each page keeps its own self-referencing canonical
 *   - language-REGION codes are lowercase-hyphen-uppercase, e.g. en-GB
 */

const SITE = "https://cakeaiartist.com";

export const HREFLANG_ALTERNATES: { hrefLang: string; path: string }[] = [
  { hrefLang: "en-GB", path: "/uk" },
  { hrefLang: "en-US", path: "/usa" },
  { hrefLang: "en-CA", path: "/canada" },
  { hrefLang: "en-AU", path: "/australia" },
  { hrefLang: "en-IN", path: "/india" },
  { hrefLang: "x-default", path: "/" },
];

export const HreflangCluster = () => (
  <Helmet>
    {HREFLANG_ALTERNATES.map(({ hrefLang, path }) => (
      <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={`${SITE}${path}`} />
    ))}
  </Helmet>
);

export default HreflangCluster;

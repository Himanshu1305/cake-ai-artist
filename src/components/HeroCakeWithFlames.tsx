/**
 * Hero cake image with naturally flickering candle flames.
 *
 * Served from /public/hero-cake.webp so it can be preloaded
 * via a stable URL in index.html (improves LCP).
 */
interface Props {
  className?: string;
  alt?: string;
}

export const HeroCakeWithFlames = ({
  className = "",
  alt = "AI-designed celebration cake with flickering candle flames",
}: Props) => {
  return (
    <img
      src="/hero-cake.webp"
      alt={alt}
      width={1200}
      height={1200}
      className={`relative block w-full h-auto rounded-3xl shadow-elegant ring-1 ring-gold/30 ${className}`}
      loading="eager"
      decoding="async"
      // @ts-expect-error fetchpriority is valid HTML, types lag
      fetchpriority="high"
    />
  );
};

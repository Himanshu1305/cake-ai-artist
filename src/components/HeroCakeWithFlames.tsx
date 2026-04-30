import heroCakeAnimated from "@/assets/hero-cake-animated.webp";

/**
 * Hero cake image with naturally flickering candle flames.
 *
 * The flicker is baked into an animated WebP — a soft warm glow pulses
 * around each real flame in the source photograph, so alignment is
 * pixel-perfect by construction at any size.
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
      src={heroCakeAnimated}
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

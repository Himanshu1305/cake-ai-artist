import heroCakeAnimated from "@/assets/hero-cake-animated.webp";
import heroCake from "@/assets/hero-cake.jpg";

/**
 * Hero cake image with naturally flickering candle flames.
 *
 * The flames are baked into an animated WebP — flicker is a soft warm glow
 * pulsing around each real flame in the source photograph, so alignment is
 * pixel-perfect by construction at any size. Falls back to the static jpg
 * if the browser cannot decode animated WebP.
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
    <div className={`relative ${className}`}>
      <picture>
        <source srcSet={heroCakeAnimated} type="image/webp" />
        <img
          src={heroCake}
          alt={alt}
          className="relative block w-full h-auto rounded-3xl shadow-elegant ring-1 ring-gold/30"
          loading="eager"
        />
      </picture>
      <img
        src={heroCakeAnimated}
        alt=""
        aria-hidden="true"
        className="relative block w-full h-auto rounded-3xl shadow-elegant ring-1 ring-gold/30"
        loading="eager"
      />
    </div>
  );
};

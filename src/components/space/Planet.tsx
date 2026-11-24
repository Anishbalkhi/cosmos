import Image from "next/image";
import clsx from "clsx";

/**
 * Real planet photographs (public domain, NASA missions), stored in /public/planets:
 *  sun – NASA SDO/AIA · earth – Apollo 17 · moon – NASA LRO · mars – NASA/USGS Viking
 *  jupiter – NASA/ESA Hubble · saturn – NASA Cassini · neptune – NASA Voyager 2
 * Round discs are cut out with a transparent background; Saturn keeps its black sky.
 */
export type PlanetName = "sun" | "earth" | "moon" | "mars" | "jupiter" | "saturn" | "neptune";

const ALT: Record<PlanetName, string> = {
  sun: "The Sun, photographed by NASA's Solar Dynamics Observatory",
  earth: "Earth, photographed by the Apollo 17 crew",
  moon: "The Moon, photographed by NASA's Lunar Reconnaissance Orbiter",
  mars: "Mars and Valles Marineris, NASA Viking mosaic",
  jupiter: "Jupiter, photographed by the Hubble Space Telescope",
  saturn: "Saturn and its rings, photographed by NASA's Cassini",
  neptune: "Neptune, photographed by NASA's Voyager 2",
};

export function Planet({
  name,
  className,
  shade = "none",
  glow,
  priority,
  sizes = "(max-width: 768px) 60vw, 480px",
  decorative = true,
  eager,
}: {
  name: PlanetName;
  className?: string;
  /** "side": a terminator shadow, like a half-lit planet on a magazine cover */
  shade?: "none" | "side" | "soft";
  /** css colour for an atmospheric glow behind the disc */
  glow?: string;
  priority?: boolean;
  sizes?: string;
  decorative?: boolean;
  /** load now even while off screen (for planets that animate in from outside the viewport) */
  eager?: boolean;
}) {
  const wide = name === "saturn";
  return (
    <div className={clsx("pointer-events-none relative", wide ? "aspect-[1200/532]" : "aspect-square", className)} aria-hidden={decorative || undefined}>
      {glow && <div className="absolute inset-[-14%] rounded-full blur-2xl" style={{ background: `radial-gradient(circle, ${glow}, transparent 65%)` }} />}
      <Image
        src={`/planets/${name}.webp`}
        alt={decorative ? "" : ALT[name]}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : eager ? "eager" : undefined}
        className={clsx("object-contain", wide && "mix-blend-screen")}
      />
      {shade !== "none" && !wide && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              shade === "side"
                ? "radial-gradient(circle at 24% 22%, transparent 0%, transparent 26%, rgba(0,0,0,0.6) 46%, rgba(0,0,0,0.97) 66%)"
                : "radial-gradient(circle at 35% 30%, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import clsx from "clsx";
import { Container } from "./Section";
import { MiniBlackHole } from "@/components/product/World";
import { Planet, type PlanetName } from "@/components/space/Planet";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";
import { goldHoleFrag } from "@/components/gl/sceneShaders";

// a soft atmosphere colour for each planet's glow
const GLOW: Partial<Record<PlanetName, string>> = {
  earth: "rgba(120,170,255,0.35)",
  moon: "rgba(246,220,174,0.22)",
  mars: "rgba(232,120,70,0.3)",
  jupiter: "rgba(232,184,109,0.3)",
  neptune: "rgba(110,150,255,0.35)",
  sun: "rgba(255,170,80,0.35)",
};

const POST = { threshold: 0.75, bloom: 0.45, streak: 0.15, aberration: 0.012, exposure: 1.1, grain: 0.035, vignette: 0.25 };

/**
 * Header band used by inner pages: eyebrow, big title and intro over either a living scene
 * (`scene`: a fragment shader from the reference pins, full bleed) or a celestial body that
 * differs per page (`visual`).
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
  visual = "blackhole",
  scene,
  blend = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  visual?: PlanetName | "blackhole";
  scene?: string;
  /** on a page with the shared night sky behind it: no grain panel and no bottom rule, it opens straight onto the sky */
  blend?: boolean;
}) {
  const wide = visual === "saturn";
  return (
    <section
      className={clsx(
        "relative pt-16 pb-16 sm:pt-24 sm:pb-20",
        // a blended header is not its own stacking context, so its visual can be screened onto the sky behind the
        // page, and it only clips sideways: the black hole's disk can run on below it instead of ending in a line
        blend ? "overflow-x-clip" : "grain isolate overflow-hidden border-b border-line",
        scene && "flex min-h-[62vh] flex-col justify-end sm:min-h-[70vh]",
      )}
    >
      {scene ? (
        <>
          <div className="absolute inset-0 -z-20" aria-hidden>
            <ShaderCanvas frag={scene} scale={0.55} post={POST} />
          </div>
          {/* the type sits on the darker lower-left of every scene */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-space via-space/45 to-transparent" aria-hidden />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-space/70 via-transparent to-transparent" aria-hidden />
        </>
      ) : (
        <div
          data-parallax="0.3"
          className={clsx(
            "absolute",
            blend ? "z-0" : "-z-10",
            visual === "blackhole"
              ? // a live black hole, screened onto the sky; on phones it sits up in the corner, clear of the type, and
                // on wide screens inside the content width (it was pinned to the far edge with its disk cut off)
                "-top-10 -right-28 aspect-square w-[300px] opacity-60 mix-blend-screen [mask-image:radial-gradient(closest-side,#000_55%,transparent)] sm:top-[2%] sm:right-[max(2%,calc((100vw-80rem)/2))] sm:w-[560px] sm:opacity-100"
              : wide
                ? "top-[22%] -right-40 w-[460px] sm:right-[2%] sm:w-[440px]"
                : "top-[18%] -right-24 w-[340px] sm:right-[6%] sm:w-[300px]",
            // on phones the planet sits behind the headline and intro: keep it dim enough to read over
            visual !== "blackhole" && "opacity-30 sm:opacity-90",
          )}
        >
          {visual === "blackhole" ? (
            blend ? <ShaderCanvas frag={goldHoleFrag} scale={0.6} maxDpr={1.5} post={POST} /> : <MiniBlackHole className="w-full" />
          ) : (
            <Planet name={visual} shade={wide ? "none" : "soft"} glow={GLOW[visual]} className="w-full" sizes="(max-width: 640px) 340px, 300px" />
          )}
        </div>
      )}
      <Container className="relative z-10">
        <p className="eyebrow mb-6 text-flare-soft">{eyebrow}</p>
        <h1 className="display relative max-w-4xl text-5xl text-balance sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-star/75 [text-shadow:0_1px_14px_rgb(0_0_0/0.9)] sm:text-lg sm:text-dust">{intro}</p>
        )}
        {children}
      </Container>
    </section>
  );
}

import type { ReactNode } from "react";
import clsx from "clsx";
import { Container } from "./Section";
import { MiniBlackHole } from "@/components/product/World";
import { Planet, type PlanetName } from "@/components/space/Planet";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";

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
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  visual?: PlanetName | "blackhole";
  scene?: string;
}) {
  const wide = visual === "saturn";
  return (
    <section
      className={clsx(
        "grain relative isolate overflow-hidden border-b border-line pt-16 pb-16 sm:pt-24 sm:pb-20",
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
            "absolute -z-10",
            wide ? "top-[22%] -right-40 w-[460px] sm:right-[2%] sm:w-[440px]" : "top-[18%] -right-24 w-[340px] sm:right-[6%] sm:w-[300px]",
            // on phones the planet sits behind the headline and intro: keep it dim enough to read over
            visual === "blackhole" ? "opacity-80" : "opacity-30 sm:opacity-90",
          )}
        >
          {visual === "blackhole" ? (
            <MiniBlackHole className="w-full" />
          ) : (
            <Planet name={visual} shade={wide ? "none" : "soft"} glow={GLOW[visual]} className="w-full" sizes="(max-width: 640px) 340px, 300px" />
          )}
        </div>
      )}
      <Container>
        <p className="eyebrow mb-6 text-flare-soft">{eyebrow}</p>
        <h1 className="display max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
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

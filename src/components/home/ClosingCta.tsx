"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WaitlistForm } from "@/components/layout/WaitlistForm";
import { LeafStar } from "@/components/brand/LeafStar";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { dawnFrag } from "@/components/gl/sectionShaders";

const POST: PostSettings = { threshold: 0.85, bloom: 0.45, streak: 0.28, aberration: 0, exposure: 1.0, grain: 0.03, vignette: 0.3 };

/** The Earth photograph (NASA, public domain) as a power-of-two canvas, so the GPU can mipmap it. */
function useEarthTexture() {
  const [tex, setTex] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const c = document.createElement("canvas");
      c.width = c.height = 1024;
      c.getContext("2d")!.drawImage(img, 0, 0, 1024, 1024);
      setTex(c);
    };
    img.src = "/planets/earth.webp";
    return () => {
      alive = false;
    };
  }, []);
  return tex;
}

/**
 * "Explore with intention. Find your Cosmos." over a sunrise seen from orbit: Earth's curved
 * horizon low in the frame, its night side dark, the atmosphere glowing along the limb, and the
 * sun climbing over the edge as the section scrolls in. The headline sits in clean dark space.
 */
export function ClosingCta() {
  const section = useRef<HTMLElement>(null);
  const rise = useRef(0);
  const earth = useEarthTexture();
  const textures = useCallback((): Record<string, TexImageSource> => (earth ? { uEarth: earth } : {}), [earth]);

  const uniforms = useCallback(() => {
    const el = section.current;
    let target = 0;
    if (el) {
      const r = el.getBoundingClientRect();
      // 0 as the section enters, 1 once it is settled in view
      target = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.9)));
    }
    rise.current += (target - rise.current) * 0.05;
    return { uRise: rise.current };
  }, []);

  return (
    <section ref={section} id="waitlist" className="relative isolate scroll-mt-24 overflow-hidden pt-32 pb-[34vh] sm:pt-40">
      {/* both ends dissolve: into the night of the journal above, and into the footer below (no hard edge) */}
      <div className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,#000_35%,#000_78%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_35%,#000_78%,transparent)]" aria-hidden>
        {earth && <ShaderCanvas frag={dawnFrag} uniforms={uniforms} textures={textures} scale={0.75} maxDpr={1.75} post={POST} />}
      </div>
      {/* wide enough for "Find your Cosmos." on one centred line at the largest size (it overflowed a 4xl column) */}
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <LeafStar live className="mx-auto h-12 w-12" />
        <p className="bracket mt-8 text-star/80">[ Your next discovery starts here ]</p>
        <h2 data-split className="display mt-6 text-6xl sm:text-8xl lg:text-9xl">
          Explore with intention.
          <br />
          <em className="text-flare-soft">Find your Cosmos.</em>
        </h2>
        <p className="mx-auto mt-8 max-w-lg text-star/80">Join the waitlist for launch-day access and a first-order welcome gift.</p>
        <WaitlistForm size="lg" className="mx-auto mt-10 max-w-lg" />
      </div>
    </section>
  );
}

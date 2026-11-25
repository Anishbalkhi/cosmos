"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WaitlistForm } from "@/components/layout/WaitlistForm";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { eclipseFrag } from "@/components/gl/sectionShaders";
import clsx from "clsx";

const POST: PostSettings = { threshold: 0.85, bloom: 0.45, streak: 0.1, aberration: 0, exposure: 1.0, grain: 0.03, vignette: 0.3 };

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
 * The launch date over an eclipse seen from space: as the section scrolls in, Earth rises across the
 * Sun until only the corona and a gold ring of sunlight through its atmosphere are left, the one bright
 * thing on the screen. The heading sits in the dark above; the form fades in once the eclipse is nearly
 * total (at once for reduced motion), and stays.
 */
export function ClosingCta({ title = "The first batch ships the week of 11 December." }: { title?: string } = {}) {
  const section = useRef<HTMLElement>(null);
  const rise = useRef(0);
  const earth = useEarthTexture();
  const textures = useCallback((): Record<string, TexImageSource> => (earth ? { uEarth: earth } : {}), [earth]);
  const [shown, setShown] = useState(false);

  // the form arrives just after totality (92% of the way in): earlier, the last bright bead of Sun sat right
  // behind the email field as it appeared
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const check = () => {
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight - r.top) / (window.innerHeight * 0.9);
      if (reduced || p >= 0.92) {
        setShown(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
    <section ref={section} id="waitlist" className="relative isolate scroll-mt-24 overflow-hidden pt-16 pb-[34vh] sm:pt-20 sm:pb-[28vh]">
      {/* both ends dissolve: into the night of the journal above, and into the footer below (no hard edge) */}
      <div className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,#000_35%,#000_78%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_35%,#000_78%,transparent)]" aria-hidden>
        {earth && <ShaderCanvas frag={eclipseFrag} uniforms={uniforms} textures={textures} scale={0.75} maxDpr={1.75} post={POST} />}
      </div>
      {/* wide enough for "Find your Cosmos." on one centred line at the largest size (it overflowed a 4xl column) */}
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <h2 className="display mx-auto max-w-3xl text-4xl text-balance sm:text-5xl lg:text-6xl">{title}</h2>
        <div className={clsx("transition-[opacity,translate] duration-1000 ease-cosmic motion-reduce:transition-none", shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}>
          <WaitlistForm size="lg" className="mx-auto mt-10 max-w-lg" />
          <p className="mx-auto mt-4 max-w-xs text-sm text-balance text-dust sm:max-w-md">We’ll email you the day it’s ready, with a gift on your first order.</p>
        </div>
      </div>
    </section>
  );
}

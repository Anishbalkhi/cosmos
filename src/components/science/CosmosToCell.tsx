"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";
import { zoomFrag, zoomNoiseTexture } from "@/components/gl/zoomShaders";

gsap.registerPlugin(ScrollTrigger);

// ordered by shrinking scale, so every transition really is a zoom in
const STOPS = [
  { scale: "10²⁴ m", title: "The cosmic web", body: "Galaxies hang on threads of dark matter, like dew on a spider's web." },
  { scale: "10²¹ m", title: "A galaxy", body: "A hundred thousand light years of stars. Every atom in you was forged in one." },
  {
    scale: "10⁻⁷ m",
    title: "The surface of a cell",
    body: "Inside you, a cosmos of its own. Every cell is studded with receptors, and the endocannabinoid system is a network of them: part of how the body regulates sleep, mood and focus.",
  },
  { scale: "10⁻¹⁰ m", title: "An atom", body: "Almost entirely empty space, held together by balance. From the largest scale to the smallest, it's balance all the way down." },
];

const N = STOPS.length;
// built once, shared by every mount: the 3D noise lookup the cosmic web and atom cloud read
let noiseTex: HTMLCanvasElement | null = null;
const textures = () => ({ uNoise: (noiseTex ??= zoomNoiseTexture()) });
const POST = { threshold: 0.7, bloom: 0.55, streak: 0.12, aberration: 0.015, exposure: 1.1, grain: 0.035, vignette: 0.3 };

/**
 * "From the cosmos to your cells" (reference pin 1051520212973196525, a Powers of Ten journey):
 * scrolling dives through four 3D scales (the cosmic web, a galaxy, a neuron, an atom), each scale
 * opening out of the centre of the last, with one caption per stop.
 */
export function CosmosToCell() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef({ target: 0, current: 0 });
  const [active, setActive] = useState(0);

  const uniforms = useCallback(() => {
    const s = stage.current;
    s.current += (s.target - s.current) * 0.08;
    // dev-only: window.__stage = 0..3 freezes the zoom on one scale for inspection
    const dbg = process.env.NODE_ENV !== "production" ? (window as Window & { __stage?: number }).__stage : undefined;
    return { uStage: dbg ?? s.current };
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // hold on each scale, zoom between them
          const x = self.progress * (N - 1);
          const i = Math.min(Math.floor(x), N - 2);
          const k = Math.min(1, Math.max(0, (x - i - 0.3) / 0.45));
          const v = i + k * k * (3 - 2 * k);
          stage.current.target = v;
          if (reduced) stage.current.current = v;
          setActive(Math.round(v));
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative bg-black" style={{ height: `${N * 100}vh` }} aria-labelledby="c2c-title">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <ShaderCanvas frag={zoomFrag} uniforms={uniforms} textures={textures} scale={0.6} post={POST} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50" aria-hidden />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pt-24 pb-14 sm:px-8 sm:pt-28">
          <div>
            <p className="eyebrow mb-4">Zoom in</p>
            <h2 id="c2c-title" className="display max-w-xl text-4xl sm:text-6xl">
              From the cosmos <em className="text-flare-soft">to your cells.</em>
            </h2>
          </div>

          <div className="relative min-h-44 sm:min-h-40">
            {STOPS.map((s, i) => (
              <div
                key={s.title}
                className={clsx(
                  "absolute inset-x-0 bottom-0 max-w-xl transition-[opacity,transform,filter] duration-700 ease-cosmic",
                  i === active ? "translate-y-0 opacity-100 blur-0" : "translate-y-4 opacity-0 blur-sm",
                )}
                aria-hidden={i !== active}
              >
                <p className="font-mono text-xs tracking-[0.18em] text-flare-soft">
                  {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · {s.scale}
                </p>
                <h3 className="display mt-2 text-4xl sm:text-5xl">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-star/80 [text-shadow:0_2px_16px_rgb(0_0_0/0.9)]">{s.body}</p>
              </div>
            ))}
          </div>

          {/* scale ruler */}
          <div className="absolute top-1/2 right-5 hidden -translate-y-1/2 flex-col gap-3 sm:right-8 sm:flex" aria-hidden>
            {STOPS.map((s, i) => (
              <span key={s.title} className={clsx("flex items-center justify-end gap-3 font-mono text-[11px] tracking-[0.14em] transition-colors duration-500", i === active ? "text-star" : "text-star/35")}>
                {s.scale}
                <span className={clsx("h-px transition-all duration-500", i === active ? "w-10 bg-flare" : "w-4 bg-white/30")} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

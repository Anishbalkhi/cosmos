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
  { exp: "24", title: "The cosmic web", body: "Galaxies hang on threads of dark matter, like dew on a spider’s web." },
  { exp: "21", title: "A galaxy", body: "A hundred thousand light years of stars. Every atom in you was forged in one." },
  {
    exp: "17",
    title: "Where stars are born",
    body: "The Orion Nebula, 1,344 light years away, photographed by Hubble: a cloud of gas where new stars are still forming.",
  },
  {
    exp: "−7",
    title: "The surface of a cell",
    body: "Inside you, a cosmos of its own. Every cell is studded with receptors, and the endocannabinoid system is a network of them: part of how the body regulates sleep, mood and focus.",
  },
  { exp: "−10", title: "An atom", body: "Almost entirely empty space, held together by balance. From the largest scale to the smallest, it’s balance all the way down." },
];

const N = STOPS.length;
// built once, shared by every mount: the 3D noise lookup the cosmic web and atom cloud read
let noiseTex: HTMLCanvasElement | null = null;
const textures = () => ({ uNoise: (noiseTex ??= zoomNoiseTexture()) });
// low aberration and grain: the cosmic web's coloured fringes and speckle were the noisiest image on the site
const POST = { threshold: 0.7, bloom: 0.55, streak: 0.12, aberration: 0.004, exposure: 1.1, grain: 0.02, vignette: 0.3 };

/** 10 to the power of e, metres, with a real superscript (the Unicode superscript digits sat at different heights) */
function Scale({ exp }: { exp: string }) {
  return (
    <>
      10<sup className="relative -top-[0.35em] ml-px align-baseline text-[0.8em]">{exp}</sup> m
    </>
  );
}

const ss = (lo: number, hi: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - lo) / (hi - lo)));
  return k * k * (3 - 2 * k);
};
// The Orion step (2) is a real photograph over the drawn scenes. The shader has four scales (web, galaxy,
// cell, atom); while the photograph is up the galaxy keeps zooming a little behind it, then the shader jumps
// to the cell under the white-out, so the step costs no extra shader work.
function shaderStage(v: number) {
  if (v <= 1) return v;
  if (v < 2) return 1 + 0.4 * (v - 1);
  if (v < 2.55) return 1.4;
  if (v < 3) return 2;
  return v - 1;
}

/**
 * "From the cosmos to your cells" (reference pin 1051520212973196525, a Powers of Ten journey):
 * scrolling dives through five scales (the cosmic web, a galaxy, the Orion Nebula, the surface of a cell,
 * an atom), each opening out of the centre of the last, with one caption per stop. The nebula is Hubble's
 * 2006 Orion mosaic (NASA, ESA, M. Robberto and the Hubble Orion Treasury Project Team; public domain):
 * the zoom accelerates into its core and washes to white through the glowing gas (reference: an Orion
 * zoom where the frame brightens ~6x over 9 s, then whites out in a tenth of a second), and the cell is there
 * when the white clears.
 */
export function CosmosToCell() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef({ target: 0, current: 0 });
  const photo = useRef<HTMLDivElement>(null);
  const white = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  const uniforms = useCallback(() => {
    const s = stage.current;
    s.current += (s.target - s.current) * 0.08;
    // dev-only: window.__stage = 0..4 freezes the zoom on one scale for inspection
    const dbg = process.env.NODE_ENV !== "production" ? (window as Window & { __stage?: number }).__stage : undefined;
    const v = dbg ?? s.current;
    // the photograph: opens out of the centre of the galaxy, holds, then the dive into its core
    const ph = photo.current;
    if (ph) {
      const open = ss(1.2, 1.9, v);
      const dive = Math.min(1, Math.max(0, (v - 2) / 0.6));
      // full size throughout (a scaled-down photo shows its square edges): it opens as a soft circle instead
      const zoom = Math.exp(dive * dive * Math.log(8));
      const gone = v >= 2.6 ? 0 : 1;
      ph.style.opacity = String(open * gone);
      ph.style.transform = `scale(${zoom.toFixed(4)})`;
      ph.style.filter = dive > 0 ? `brightness(${(1 + 1.8 * dive * dive).toFixed(3)})` : "none";
      ph.style.setProperty("--open", `${(5 + 130 * open).toFixed(1)}%`);
      ph.style.visibility = open * gone > 0.002 ? "visible" : "hidden";
    }
    if (white.current) white.current.style.opacity = String(ss(2.4, 2.6, v) * (1 - ss(2.62, 2.9, v)));
    return { uStage: shaderStage(v) };
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
          // hold on each scale, zoom between them (the change takes 60% of each step, so nothing pops on a quick scroll)
          const x = self.progress * (N - 1);
          const i = Math.min(Math.floor(x), N - 2);
          const k = Math.min(1, Math.max(0, (x - i - 0.2) / 0.6));
          const v = i + k * k * (3 - 2 * k);
          stage.current.target = v;
          if (reduced) stage.current.current = v;
          setActive(Math.round(v));
        },
        // the scale ruler only shows while the scene is held on screen, not while it scrolls in or out under the header
        onToggle: (self) => setPinned(self.isActive),
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative" style={{ height: `${N * 85}vh` }} aria-labelledby="c2c-title">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* the scene's top and bottom fade into the page's night sky, so it enters and leaves without an edge */}
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_84%,transparent)]" aria-hidden>
          <ShaderCanvas frag={zoomFrag} uniforms={uniforms} textures={textures} scale={0.6} post={POST} />
        {/* the Orion Nebula: its core (the Trapezium) sits 44% across and 44% down the photograph */}
        <div
          ref={photo}
          className="absolute inset-0 origin-[44%_44%]"
          style={{
            visibility: "hidden",
            WebkitMaskImage: "radial-gradient(circle at 44% 44%, #000 calc(var(--open, 25%) - 22%), transparent var(--open, 25%))",
            maskImage: "radial-gradient(circle at 44% 44%, #000 calc(var(--open, 25%) - 22%), transparent var(--open, 25%))",
          }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- scaled every frame by the zoom; a plain image avoids layout work */}
          <img src="/planets/orion.webp" alt="" className="h-full w-full object-cover object-[44%_44%]" decoding="async" />
        </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>
        <div ref={white} className="absolute inset-0 bg-[#fbe9e0] opacity-0" aria-hidden />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pt-24 pb-14 sm:px-8 sm:pt-28">
          <div>
            <p className="eyebrow mb-4">Zoom in</p>
            <h2 id="c2c-title" className="display max-w-xl text-4xl sm:text-6xl">
              From the cosmos to your cells.
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
                  {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · <Scale exp={s.exp} />
                </p>
                <h3 className="display mt-2 text-4xl [text-shadow:0_2px_18px_rgb(0_0_0/0.9)] sm:text-5xl">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-star/85 [text-shadow:0_2px_16px_rgb(0_0_0/0.9)]">{s.body}</p>
              </div>
            ))}
          </div>

          {/* scale ruler */}
          <div
            className={clsx(
              "absolute top-1/2 right-5 hidden -translate-y-1/2 flex-col gap-3.5 transition-opacity duration-500 sm:right-8 sm:flex",
              pinned ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          >
            {STOPS.map((s, i) => (
              <span key={s.title} className={clsx("flex items-center justify-end gap-3 font-mono text-xs tracking-[0.12em] transition-colors duration-500", i === active ? "text-star" : "text-star/55")}>
                <span>
                  <Scale exp={s.exp} />
                </span>
                <span className={clsx("h-px transition-all duration-500", i === active ? "w-10 bg-flare" : "w-4 bg-white/30")} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

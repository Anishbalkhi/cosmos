"use client";

import { useEffect, useRef } from "react";

/**
 * Planets passing the camera at two seams of the home page, scrubbed by the scroll (references:
 * "Planetary motions", where each planet sweeps past in under a second, lit from behind; "Silent Orbit",
 * where a rock passes so close it blacks out the frame and hides the cut).
 *
 * Each planet sits at a fixed point in space; scrolling moves the camera toward it at a steady rate, so
 * its size and its distance from the middle of the screen both grow as 1/z: it creeps in small and far,
 * then accelerates and leaves by the nearest edge, with no easing curve needed. Real NASA photographs,
 * darkened to a crescent lit from the side facing the middle of the screen, and slightly out of focus
 * once they come very close. Behind the content, in front of the sky; nothing else moves while one passes.
 */

type Pass = {
  planet: "saturn" | "moon";
  /** the stop whose arrival the pass leads into */
  stop: number;
  /** scroll range, in screen heights before that stop's top reaches the top of the screen */
  from: number;
  to: number;
  /** position in space (x right, y up, in units of half the screen's shorter side) and width */
  x: number;
  y: number;
  w: number;
  /** distance from the camera at the start and the end of the pass */
  z0: number;
  z1: number;
  /** light from this direction (screen space, x right, y down): the lit crescent faces it */
  light: [number, number];
  /** how far the shadow sits off the globe's centre, as a fraction of its diameter: more = a wider crescent */
  phase: number;
  /** fade out over the last part of the pass (a pass that ends filling the screen) */
  fadeOut?: number;
  /** the share of the pass spent approaching (default all of it): the rest holds at z1, the screen filled */
  approach?: number;
};

const PASSES: Pass[] = [
  // leaving the Needs wheel for the range: Saturn, small and far up to the right, sweeps out past the right edge
  { planet: "saturn", stop: 3, from: 1.2, to: 0.1, x: 0.95, y: 0.42, w: 0.7, z0: 7, z1: 0.15, light: [-0.82, 0.57], phase: 0.26 },
  // through How it works into the standards: the Moon comes straight at the camera, lit from up to the right
  // (it sits a little right of centre, so its lit edge leaves by that side and its night side fills the
  // screen), blacks out the sky behind the dose clock for a moment, and is gone just as the paper section arrives
  { planet: "moon", stop: 6, from: 2.1, to: 0.85, x: 0.1, y: -0.06, w: 0.62, z0: 8, z1: 0.08, light: [0.75, -0.66], phase: 0.36, approach: 0.88, fadeOut: 0.08 },
];

// image boxes: Saturn's photo is 1200 x 532 with the globe in the middle (about a third of the width)
const ASPECT = { saturn: 532 / 1200, moon: 1 };
const GLOBE = { saturn: 0.335, moon: 1 }; // globe diameter as a fraction of the box width

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function FlyBys() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const BASE = 1000; // each planet box is 1000 px wide and scaled from there

    let ranges: { lo: number; hi: number }[] = [];
    const measure = () => {
      const vh = window.innerHeight;
      ranges = PASSES.map((p) => {
        const s = document.querySelector<HTMLElement>(`[data-stop="${p.stop}"]`);
        const top = s ? s.getBoundingClientRect().top + window.scrollY : 0;
        return { lo: top - p.from * vh, hi: top - p.to * vh };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    let raf = 0;
    let lastY = NaN;
    let lastW = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const y = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (y === lastY && vw === lastW) return;
      lastY = y;
      lastW = vw;
      const f = Math.min(vw, vh) * 0.5;
      // a narrow (portrait) screen runs out of width before a planet has grown: draw them bigger there
      const big = vw < vh ? 1.6 : 1;
      PASSES.forEach((p, i) => {
        const node = items[i];
        const r = ranges[i];
        const u = r ? (y - r.lo) / (r.hi - r.lo) : -1;
        if (u <= 0 || u >= 1) {
          node.style.visibility = "hidden";
          return;
        }
        const z = p.z0 + (p.z1 - p.z0) * Math.min(1, u / (p.approach ?? 1));
        const s = ((p.w * big) / z) * f / BASE;
        const sx = vw / 2 + (p.x / z) * f;
        const sy = vh / 2 - (p.y / z) * f;
        // out of focus once it's bigger than the screen's shorter side (scaled, since the filter sits under the transform)
        const px = ((p.w * big) / z) * f * GLOBE[p.planet];
        const blur = clamp((px / Math.min(vw, vh) - 0.9) * 5, 0, 7) / s;
        const fadeIn = clamp(u / 0.12);
        const fadeOut = p.fadeOut ? clamp((1 - u) / p.fadeOut) : 1;
        node.style.visibility = "visible";
        node.style.opacity = String(fadeIn * fadeOut);
        node.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%) scale(${s})`;
        node.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
      });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 -z-[45] overflow-hidden">
      {PASSES.map((p) => {
        const src = `/planets/${p.planet}.webp`;
        const h = 1000 * ASPECT[p.planet];
        // the shadow: a soft dark disc a little off the globe's centre, away from the light, leaving a crescent
        const g = GLOBE[p.planet];
        const [lx, ly] = p.light;
        const cx = 50 - lx * g * p.phase * 100;
        const cy = 50 - (ly * g * p.phase * 100) / ASPECT[p.planet];
        const rx = g * 50 * 1.04;
        const ry = rx / ASPECT[p.planet];
        return (
          <div key={p.planet} className="absolute top-0 left-0 origin-center" style={{ width: 1000, height: h, visibility: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the same file is the shadow's mask; one plain image keeps them aligned */}
            <img src={src} alt="" className="absolute inset-0 h-full w-full" decoding="async" />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, rgba(2,3,8,0.97) 0%, rgba(2,3,8,0.95) 72%, rgba(2,3,8,0) 100%), linear-gradient(${Math.round((Math.atan2(lx, -ly) * 180) / Math.PI)}deg, rgba(2,3,8,0.55), rgba(2,3,8,0) 70%)`,
                WebkitMaskImage: `url(${src})`,
                maskImage: `url(${src})`,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

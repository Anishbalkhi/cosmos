"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

/**
 * Earth turning from a thin crescent to full as its section scrolls by (reference: a 20-second orbit
 * of Earth where the lit side grows from a crescent with city lights to a full disc). Two real
 * NASA images: the Apollo 17 photograph for the day side, and the Suomi NPP "Black Marble" city lights,
 * projected to the same view (centred 33.5°S 38°E), for the night side.
 *
 * The night is a soft shadow disc, masked to the photograph's own outline, that slides off the globe
 * away from the Sun (on the left) as the section moves up the screen; the lights only show inside it,
 * so they go out as the night side shrinks. CSS layers and one scroll value; reduced motion shows a
 * still half-lit Earth.
 */
export function EarthPhase({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // the shadow's centre, in % of the box: 66% leaves a thin crescent on the left, 160% clears the disc
    const set = (k: number) => {
      el.style.setProperty("--night", `${66 + 94 * k}%`);
      el.style.setProperty("--lights", String(Math.max(0, 1 - k * 1.15)));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      set(0.4);
      return;
    }
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the globe's top comes into view at the bottom of the screen, 1 when its bottom reaches the top
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      // spread over the whole letter: still turning while the second paragraph is read
      const k = Math.min(1, Math.max(0, (p - 0.15) / 0.72));
      set(k * k * (3 - 2 * k));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // a narrower soft edge: a real terminator is soft over a few hundred km, not a quarter of the globe
  const shadow = "radial-gradient(ellipse 53% 53% at var(--night) 50%, rgba(1,2,6,0.97) 0%, rgba(1,2,6,0.97) 90%, rgba(1,2,6,0) 100%)";
  const nightOnly = "radial-gradient(ellipse 53% 53% at var(--night) 50%, #000 0%, #000 78%, transparent 96%)";

  return (
    <div ref={root} className={clsx("pointer-events-none relative aspect-square", className)} style={{ "--night": "66%", "--lights": 1 } as React.CSSProperties} aria-hidden>
      {/* the atmosphere's glow, strongest on the sunlit side */}
      {/* (a plain gradient: the blur filter it had left a faint square round the glow) */}
      <div className="absolute inset-[-14%] rounded-full" style={{ background: "radial-gradient(circle at 40% 50%, rgba(120,170,255,0.3), rgba(120,170,255,0.08) 45%, transparent 66%)" }} />
      {/* eslint-disable @next/next/no-img-element -- the photographs double as each other's masks; plain images keep the layers aligned */}
      <img src="/planets/earth.webp" alt="" className="absolute inset-0 h-full w-full" decoding="async" />
      <div
        className="absolute inset-0"
        style={{ background: shadow, WebkitMaskImage: "url(/planets/earth.webp)", maskImage: "url(/planets/earth.webp)", WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}
      />
      <img
        src="/planets/earth-night.webp"
        alt=""
        className="absolute inset-0 h-full w-full mix-blend-screen"
        style={{ opacity: "var(--lights)", filter: "brightness(1.7) saturate(1.2)", WebkitMaskImage: nightOnly, maskImage: nightOnly } as React.CSSProperties}
        decoding="async"
      />
      {/* eslint-enable @next/next/no-img-element */}
      {/* the atmosphere: a thin blue rim all round the disc, night side included */}
      <div className="absolute inset-[1.6%] rounded-full shadow-[inset_0_0_0_1px_rgba(150,190,255,0.22),0_0_14px_1px_rgba(120,170,255,0.32)]" />
    </div>
  );
}

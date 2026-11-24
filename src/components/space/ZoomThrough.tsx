"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Planet, type PlanetName } from "@/components/space/Planet";

gsap.registerPlugin(ScrollTrigger);

export type ZoomStop = { planet: PlanetName; glow?: string; title: string; body: string };

/**
 * Scroll-driven match cuts through worlds (reference pin 880313058437018020, "A Trip To Space!"):
 * each world rushes toward the camera, and the next one opens out of its centre as it passes.
 * Real NASA planet photographs; the caption for each stop rides along with it.
 */
export function ZoomThrough({ stops, eyebrow }: { stops: ZoomStop[]; eyebrow: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const worlds = gsap.utils.toArray<HTMLElement>(".zt-world");
      const caps = gsap.utils.toArray<HTMLElement>(".zt-cap");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.7 },
      });
      gsap.set(worlds, { scale: 0.02, opacity: 0 });
      gsap.set(caps, { opacity: 0, y: 30 });
      worlds.forEach((w, i) => {
        const last = i === worlds.length - 1;
        // emerges from the centre of the previous world...
        tl.to(w, { scale: 0.42, opacity: 1, duration: 0.5, ease: "power2.out" }, i === 0 ? 0 : i - 0.45);
        tl.to(w, { scale: last ? 0.9 : 0.75, duration: 0.45 }, i + 0.05);
        tl.to(caps[i], { opacity: 1, y: 0, duration: 0.25 }, i + 0.05);
        if (!last) {
          // ...then rushes past the camera as the cut happens
          tl.to(w, { scale: 9, opacity: 0, duration: 0.55, ease: "power3.in" }, i + 0.5);
          tl.to(caps[i], { opacity: 0, y: -30, duration: 0.2 }, i + 0.6);
          tl.fromTo(".zt-flash", { opacity: 0 }, { opacity: 0.5, duration: 0.08, yoyo: true, repeat: 1 }, i + 0.92);
        }
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    // reduced motion: no pinned flight, just the last world with every caption listed over it
    <section
      ref={root}
      className="relative h-[var(--zt-h)] bg-black motion-reduce:h-auto"
      style={{ "--zt-h": `${stops.length * 110 + 40}vh` } as React.CSSProperties}
    >
      <div className="sticky top-0 grid h-dvh place-items-center overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:gap-10 motion-reduce:py-32">
        <div
          className="absolute inset-0 opacity-60"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 12% 22%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 78% 14%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 64% 72%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 30% 82%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 90% 56%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 44% 40%, #fff 50%, transparent 51%)",
          }}
        />
        {stops.map((s, i) => (
          <div
            key={s.title}
            className={`zt-world absolute top-1/2 left-1/2 w-[min(70vmin,560px)] -translate-x-1/2 -translate-y-1/2 ${i < stops.length - 1 ? "motion-reduce:hidden" : "motion-reduce:opacity-30"}`}
            aria-hidden
          >
            <Planet name={s.planet} shade={s.planet === "sun" ? "none" : "soft"} glow={s.glow} className="w-full" sizes="560px" />
          </div>
        ))}
        <div className="zt-flash pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(255_244_228/0.9),transparent_60%)] opacity-0" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(0_0_0/0.75)_80%)]" aria-hidden />

        <p className="eyebrow absolute top-24 left-1/2 -translate-x-1/2 whitespace-nowrap sm:top-28 motion-reduce:relative motion-reduce:inset-auto motion-reduce:translate-x-0">
          {eyebrow}
        </p>
        {stops.map((s) => (
          <div key={s.title} className="zt-cap absolute inset-x-0 bottom-[10%] px-6 text-center motion-reduce:relative motion-reduce:bottom-auto">
            <h2 className="display text-5xl sm:text-7xl">{s.title}</h2>
            <p className="mx-auto mt-4 max-w-md text-star/85 [text-shadow:0_2px_20px_rgb(0_0_0/0.9)]">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

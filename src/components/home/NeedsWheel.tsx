"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import { comingSoon, getProduct, needs, type NeedId } from "@/lib/data";
import { scrollToY } from "@/lib/experience";
import { Planet, type PlanetName } from "@/components/space/Planet";

gsap.registerPlugin(ScrollTrigger);

// which real planet stands for each need, and the colour of its atmosphere
const WORLD: Record<NeedId, { planet: PlanetName; label: string; atmo: string }> = {
  rest: { planet: "neptune", label: "Neptune", atmo: "110,150,255" },
  balance: { planet: "earth", label: "Earth", atmo: "120,175,255" },
  focus: { planet: "jupiter", label: "Jupiter", atmo: "232,184,109" },
  ease: { planet: "mars", label: "Mars", atmo: "232,120,70" },
};

const N = needs.length;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/**
 * "What do you need more of?" as a wheel of worlds (reference: the "PLANET EARTH" site pin,
 * in.pinterest.com/pin/467811480027251025): the chosen need is a giant planet rising as a
 * horizon under its name, the neighbours wait at the screen edges, and scrolling (or clicking
 * a neighbour) turns the wheel — the horizon rolls away sideways as the next world rises.
 */
export function NeedsWheel() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const worlds = useRef<(HTMLDivElement | null)[]>([]);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  // true while the wheel is between two worlds: the side labels step aside so a passing planet never sits under one
  const [turning, setTurning] = useState(false);

  useEffect(() => {
    const el = section.current;
    const st = stage.current;
    if (!el || !st) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let current = 0;
    let shown = 0;
    let moving = false;
    let raf = 0;
    // 0..1 over the last stretch of the section: the worlds set below the horizon before the section ends,
    // so none is cut off by the edge of the pinned stage as it scrolls away
    let exit = 0;

    const layout = (f: number) => {
      const W = st.clientWidth;
      const H = st.clientHeight;
      const phone = W < 640;
      const D = phone ? W * 1.3 : clamp(W * 0.58, 480, 860); // horizon planet diameter
      const side = phone ? 64 : 120; // neighbour size at the edge
      worlds.current.forEach((w, i) => {
        if (!w) return;
        const rel = i - f;
        const a = Math.abs(rel);
        const s = Math.sign(rel);
        const t = Math.min(a, 1);
        const e = easeOut(t);
        // horizon (centre, below the fold) → neighbour (screen edge, mid height) → beyond (off screen)
        // neighbours sit just inside the screen edge (whole, not a sliver)
        const x = W / 2 + s * ((W * 0.5 - side * 0.75) * e + Math.max(0, a - 1) * W * 0.35);
        const y = lerp(H + D * 0.16, H * 0.56, e) + exit * exit * D * 0.75;
        const scale = lerp(1, side / D, Math.pow(t, 0.7));
        w.style.width = w.style.height = `${D}px`;
        w.style.transform = `translate3d(${x - D / 2}px, ${y - D / 2}px, 0) scale(${scale}) rotate(${-rel * 18}deg)`;
        w.style.opacity = String(clamp(1.8 - a, 0, 1) * (1 - exit * 0.5));
        w.style.zIndex = String(10 - Math.round(a * 3));
      });
    };

    const tick = () => {
      current += (target - current) * (reduced ? 1 : 0.1);
      if (Math.abs(target - current) < 0.0005) current = target;
      layout(current);
      const r = Math.round(current);
      if (r !== shown) {
        shown = r;
        setActive(r);
      }
      const m = Math.abs(current - r) > 0.04 || Math.abs(target - current) > 0.04;
      if (m !== moving) {
        moving = m;
        setTurning(m);
      }
      raf = requestAnimationFrame(tick);
    };

    const ctx = gsap.context(() => {
      trigger.current = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // each world holds for a stretch of scroll and the wheel only turns in between
          // (a visual "snap": no scroll snapping, which fights the smooth-scroll library)
          exit = clamp((self.progress - 0.9) / 0.1, 0, 1);
          const x = self.progress * (N - 1);
          const i = Math.min(Math.floor(x), N - 2);
          const k = x - i;
          const s = clamp((k - 0.25) / 0.5, 0, 1);
          target = i + s * s * (3 - 2 * s);
        },
      });
    }, el);
    layout(0);
    raf = requestAnimationFrame(tick);
    const onResize = () => layout(current);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ctx.revert();
      trigger.current = null;
    };
  }, []);

  // clicking a neighbour scrolls the wheel to it
  const goTo = (i: number) => {
    const t = trigger.current;
    if (!t) return;
    scrollToY(t.start + (t.end - t.start) * (i / (N - 1)), 1.4);
  };

  const prev = active > 0 ? needs[active - 1] : null;
  const next = active < N - 1 ? needs[active + 1] : null;

  return (
    <section
      ref={section}
      // the whole section fades in and out at its ends (in page coordinates, so only while it enters and leaves):
      // the pinned worlds never end on a hard clipped edge against the shared sky
      className="relative [mask-image:linear-gradient(to_bottom,transparent,#000_22vh,#000_calc(100%-40vh),transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_22vh,#000_calc(100%-40vh),transparent)]"
      style={{ height: `${N * 85 + 15}vh` }} aria-labelledby="orbit-title">
      <div ref={stage} className="sticky top-0 h-dvh overflow-hidden">
        {/* the shared sky (UniverseStage) is the backdrop; a glow where the horizon rises */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 transition-[background] duration-700"
          style={{ background: `radial-gradient(ellipse 60% 70% at 50% 100%, rgba(${WORLD[needs[active].id].atmo},0.22), transparent 70%)` }}
          aria-hidden
        />

        {/* the worlds */}
        {needs.map((n, i) => (
          <div
            key={n.id}
            ref={(el) => {
              worlds.current[i] = el;
            }}
            className="absolute top-0 left-0 origin-center will-change-transform"
            aria-hidden
          >
            <div className="relative h-full w-full">
              <div className="absolute inset-0 animate-spin-slow [animation-duration:240s]">
                <Planet name={WORLD[n.id].planet} className="h-full w-full" sizes="860px" eager />
              </div>
              {/* lit from above, atmosphere at the limb */}
              <div
                // inset to the photo's disc (it fills ~97% of the image): a full-size overlay put a dark ring outside the planet
                className="absolute inset-[1.6%] rounded-full"
                style={{
                  background: "radial-gradient(circle at 50% 18%, transparent 45%, rgba(0,0,0,0.55) 80%)",
                  boxShadow: `inset 0 0 50px rgba(${WORLD[n.id].atmo},0.45), 0 0 90px 10px rgba(${WORLD[n.id].atmo},0.28)`,
                }}
              />
            </div>
          </div>
        ))}

        {/* title block: the old need leaves quickly, then the new one rises in (never two words on top of each other) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-24 text-center sm:pt-28">
          <p className="eyebrow">Find your orbit</p>
          <h2 id="orbit-title" className="sr-only">
            What do you need more of?
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.18em] text-star/60" aria-hidden>
            What do you need more of? · {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </p>
          <div className="relative mt-4 sm:mt-6">
            {needs.map((n, i) => {
              const product = n.product ? getProduct(n.product) : undefined;
              const on = i === active;
              return (
                <div
                  key={n.id}
                  className={clsx(
                    "transition-[opacity,transform] ease-cosmic",
                    i === 0 ? "relative" : "absolute inset-x-0 top-0",
                    on ? "translate-y-0 opacity-100 delay-200 duration-500" : "-translate-y-3 opacity-0 duration-200",
                  )}
                  aria-hidden={!on}
                >
                  <p className="display text-[22vw] leading-[0.85] sm:text-[9rem] lg:text-[11rem]">{n.name}</p>
                  <p className="mx-auto mt-4 max-w-md text-base text-star/80 [text-shadow:0_2px_18px_rgb(0_0_0/0.9)] sm:text-lg">{n.line}</p>
                  <div className={clsx("mt-6", on ? "pointer-events-auto" : "pointer-events-none")}>
                    {product ? (
                      <Link
                        href={`/products/${product.slug}`}
                        data-sfx="press"
                        tabIndex={on ? 0 : -1}
                        className="inline-flex h-12 items-center gap-2 rounded-full bg-star px-6 text-sm font-semibold text-space transition-transform hover:scale-105"
                      >
                        Meet {product.name} <span aria-hidden>→</span>
                      </Link>
                    ) : (
                      // not a product yet: a quiet dashed chip that says so, and where to hear first
                      <Link
                        href="/#waitlist"
                        tabIndex={on ? 0 : -1}
                        className="inline-flex h-12 items-center gap-2 rounded-full border border-dashed border-star/25 px-6 text-sm text-star/75 transition-colors hover:border-star/50 hover:text-star"
                      >
                        {comingSoon.name} is coming · <span className="underline decoration-flare underline-offset-4">Join the waitlist</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* neighbours at the edges: click to turn the wheel */}
        {prev && (
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            className={clsx(
              "bracket absolute top-[56%] left-4 z-20 -translate-y-[calc(50%+4.5rem)] text-star/80 transition-[color,opacity] duration-300 hover:text-flare-soft sm:left-8 sm:-translate-y-[calc(50%+7rem)]",
              turning && "pointer-events-none opacity-0",
            )}
          >
            ← {prev.name} · {WORLD[prev.id].label}
          </button>
        )}
        {next && (
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            className={clsx(
              "bracket absolute top-[56%] right-4 z-20 -translate-y-[calc(50%+4.5rem)] text-star/80 transition-[color,opacity] duration-300 hover:text-flare-soft sm:right-8 sm:-translate-y-[calc(50%+7rem)]",
              turning && "pointer-events-none opacity-0",
            )}
          >
            {next.name} · {WORLD[next.id].label} →
          </button>
        )}

        {/* progress ticks */}
        <div className="absolute right-5 bottom-8 z-20 flex gap-2.5 sm:right-8" aria-hidden>
          {needs.map((n, i) => (
            <span
              key={n.id}
              className={clsx("h-1 rounded-full transition-all duration-500", i === active ? "w-10 bg-flare shadow-[0_0_10px_var(--color-flare)]" : "w-4 bg-white/45")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

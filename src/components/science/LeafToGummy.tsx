"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { processFrag } from "@/components/gl/objectShaders";

gsap.registerPlugin(ScrollTrigger);

export type ProcessStep = { n: string; title: string; body: string };

const POST: PostSettings = { threshold: 0.95, bloom: 0.5, streak: 0.2, aberration: 0.008, exposure: 1.0, grain: 0.035, vignette: 0.25 };

/**
 * "From leaf to gummy in four steps" as one continuous 3D object, scrubbed by scroll:
 * the fan leaf (Source) burns away from the tips into a single golden drop (Extract),
 * the drop sets into a gummy (Dose), and the gummy turns inside lab scan rings (Test).
 * Holds on each step, transforms between them.
 */
export function LeafToGummy({ steps }: { steps: ProcessStep[] }) {
  const N = steps.length;
  const section = useRef<HTMLElement>(null);
  const stage = useRef({ target: 0, current: 0 });
  const [active, setActive] = useState(0);

  const uniforms = useCallback(() => {
    const s = stage.current;
    s.current += (s.target - s.current) * 0.08;
    // dev-only: window.__process = 0..3 freezes the sequence on one step for inspection
    const dbg = process.env.NODE_ENV !== "production" ? (window as Window & { __process?: number }).__process : undefined;
    return { uStage: dbg ?? s.current, uGum: [1.0, 0.6, 0.1] as [number, number, number], uZoom: window.innerWidth < 640 ? 1.25 : 1 };
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
          const x = self.progress * (N - 1);
          const i = Math.min(Math.floor(x), N - 2);
          // each change takes 60% of its step: the leaf no longer snaps into the drop on a quick scroll
          const k = Math.min(1, Math.max(0, (x - i - 0.2) / 0.6));
          const v = i + k * k * (3 - 2 * k);
          stage.current.target = v;
          if (reduced) stage.current.current = v;
          setActive(Math.round(v));
        },
      });
    }, el);
    return () => ctx.revert();
  }, [N]);

  return (
    <section ref={section} className="relative" style={{ height: `${N * 90}vh` }} aria-labelledby="process-title">
      {/* the whole pinned layer is screened onto the page's night sky (a sticky element is its own stacking context,
          so the blend has to sit here, not on the canvas): the scene's black drops out, white type stays white */}
      <div className="sticky top-0 h-dvh overflow-hidden mix-blend-screen">
        {/* phones: the object sits below the step list; wider screens: to the right of it, edges faded out */}
        <div
          className="absolute inset-x-0 top-[50%] bottom-0 [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_88%,transparent)] sm:top-0 sm:left-[34%] sm:[mask-image:radial-gradient(closest-side,#000_70%,transparent)]"
          aria-hidden
        >
          <ShaderCanvas frag={processFrag} uniforms={uniforms} post={POST} scale={0.85} maxDpr={1.75} />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-start px-5 pt-24 sm:justify-center sm:px-8 sm:pt-0">
          <p className="eyebrow mb-5">How we make it</p>
          <h2 id="process-title" className="display max-w-md text-4xl sm:text-5xl lg:text-6xl">
            From leaf to gummy in four steps.
          </h2>
          <ol className="mt-8 max-w-sm space-y-4 sm:mt-12 sm:space-y-5">
            {steps.map((s, i) => (
              <li
                key={s.n}
                className={clsx(
                  "border-l pl-5 transition-[opacity,border-color] duration-700",
                  active === i ? "border-leaf opacity-100" : "border-white/10 opacity-45",
                )}
              >
                <p className="font-mono text-xs tracking-[0.18em] text-leaf">{s.n}</p>
                <h3 className={clsx("mt-1 text-xl", active === i ? "font-semibold" : "font-normal")}>{s.title}</h3>
                {/* only the step on screen opens up, so four steps fit any laptop height */}
                <p className={clsx("mt-2 text-sm leading-relaxed text-star/75", active === i ? "block" : "hidden")}>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

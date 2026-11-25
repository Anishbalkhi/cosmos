"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";
import { Planet } from "@/components/space/Planet";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: "01", title: "Choose your need", body: "Rest, balance or focus. Each formula pairs leaf extract with Ayurvedic botanicals for one job." },
  { n: "02", title: "Take one gummy", body: "Start with one. Effects build gently over 45 to 90 minutes, so give it a full two hours." },
  { n: "03", title: "Notice the shift", body: "Calm, not a high. Keep a note of how you feel: it becomes your personal dosing guide." },
];

// marks on the orbit, one per step (degrees clockwise from the top), with the time each stands for
const MARKS = [
  { at: 0, label: "Take one" },
  { at: 120, label: "45–90 min" },
  { at: 240, label: "2 hours" },
];

/**
 * The shadow over the Moon for an illuminated fraction p (0 new, 1 full), lit from the right as it waxes.
 * In a unit circle (y down): the dark limb on the left, closed by the terminator, an ellipse whose
 * half-width is |cos(πp)| and bulges right while it is a crescent, left once it is gibbous.
 */
function shadowPath(p: number) {
  const k = Math.cos(Math.PI * Math.min(1, Math.max(0, p)));
  const rx = Math.max(0.0001, Math.abs(k));
  const sweep = k > 0 ? 0 : 1;
  return `M0,-1 A1,1 0 0 0 0,1 A${rx.toFixed(4)},1 0 0 ${sweep} 0,-1 Z`;
}

/**
 * "Start low. Go slow." as the Moon waxing (a real NASA photograph): a thin crescent when you start,
 * filling as you scroll through the steps, full by the last, the way the effect builds over two
 * hours. A thin orbit round it fills in with the steps, marked with the times they stand for.
 */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const shadow = useRef<SVGPathElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const moon = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { p: 0 };
    const render = () => {
      const p = state.p;
      // a clear crescent at the start, full at the end
      shadow.current?.setAttribute("d", shadowPath(0.18 + 0.82 * p));
      arc.current?.setAttribute("stroke-dashoffset", String(1 - p));
      if (halo.current) halo.current.style.opacity = String(0.25 + 0.75 * p);
      if (moon.current) moon.current.style.transform = `rotate(${(-12 + 12 * p).toFixed(2)}deg) scale(${(0.94 + 0.06 * p).toFixed(3)})`;
    };
    render();
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setStep(Math.min(2, Math.floor(self.progress * 3)));
        if (reduced) {
          state.p = self.progress;
          render();
        } else gsap.to(state, { p: self.progress, duration: 0.7, ease: "power2.out", overwrite: true, onUpdate: render });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={section} className="relative h-[300vh]" aria-labelledby="how-title">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* the Moon and its orbit */}
        <div
          className="absolute top-[76%] left-1/2 w-[min(58vw,280px)] -translate-x-1/2 -translate-y-1/2 sm:top-1/2 sm:left-[68%] sm:w-[min(48vmin,460px)]"
          aria-hidden
        >
          <div className="relative aspect-square">
            {/* cool moonlight round it, growing as it fills */}
            <div
              ref={halo}
              className="absolute -inset-[30%] rounded-full bg-[radial-gradient(closest-side,rgb(170_190_255/0.16),rgb(120_140_220/0.06)_45%,transparent_70%)]"
            />
            {/* the orbit: a faint ring, the part travelled so far lit, and a mark per step */}
            <svg viewBox="-60 -60 120 120" className="absolute -inset-[14%] overflow-visible">
              <circle r="56" fill="none" stroke="rgb(243 238 230 / 0.12)" strokeWidth="0.35" strokeDasharray="0.8 1.6" />
              <circle
                ref={arc}
                r="56"
                fill="none"
                stroke="var(--color-flare)"
                strokeWidth="0.6"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
                transform="rotate(-90)"
                style={{ filter: "drop-shadow(0 0 1.5px var(--color-flare))" }}
              />
              {MARKS.map((m, i) => {
                const a = ((m.at - 90) * Math.PI) / 180;
                const x = Math.cos(a) * 56;
                const y = Math.sin(a) * 56;
                const lx = Math.cos(a) * 64;
                const ly = Math.sin(a) * 64;
                const on = step >= i;
                return (
                  <g key={m.label}>
                    <circle cx={x} cy={y} r={on ? 1.6 : 1.1} fill={on ? "var(--color-flare)" : "#07080f"} stroke={on ? "none" : "rgb(243 238 230 / 0.4)"} strokeWidth="0.35" style={{ transition: "r 0.5s, fill 0.5s" }} />
                    <text
                      // phones: the steps say the same, and the labels would run off the screen
                      className="hidden sm:inline"
                      x={lx}
                      y={ly + 1.4}
                      textAnchor={Math.abs(lx) < 4 ? "middle" : lx > 0 ? "start" : "end"}
                      fontSize="3.6"
                      letterSpacing="0.6"
                      fill={on ? "#f3eee6" : "#9d99a8"}
                      fontFamily="var(--font-geist-mono)"
                      style={{ transition: "fill 0.5s" }}
                    >
                      {m.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div ref={moon} className="absolute inset-0 will-change-transform">
              <Planet name="moon" className="h-full w-full" sizes="(max-width: 640px) 72vw, 460px" />
              {/* the night side: earthshine keeps it faintly visible, the terminator soft as on the real Moon */}
              <svg viewBox="-1 -1 2 2" className="absolute inset-[1.6%] h-[96.8%] w-[96.8%]">
                <defs>
                  <filter id="how-terminator" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="0.025" />
                  </filter>
                </defs>
                <path ref={shadow} d={shadowPath(0.18)} fill="#03040a" fillOpacity="0.93" filter="url(#how-terminator)" />
              </svg>
            </div>
          </div>
        </div>
        <div className="feather-y absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent [--feather:16%] sm:bg-gradient-to-r sm:from-black/70 sm:via-black/25" aria-hidden />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-start px-5 pt-24 sm:px-8 sm:pt-28">
          <p className="eyebrow mb-5">How it works</p>
          <h2 id="how-title" className="display max-w-xl text-4xl sm:text-6xl lg:text-7xl">
            Start low. <em className="text-flare-soft">Go slow.</em>
          </h2>
          <ol className="mt-8 max-w-md space-y-4 sm:mt-8 sm:space-y-4">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className={clsx(
                  "border-l pl-5 transition-[opacity,border-color] duration-700",
                  // every step stays readable; the current one is lit
                  step === i ? "border-flare opacity-100" : "border-white/15 opacity-70",
                )}
              >
                <p className="font-mono text-xs tracking-[0.18em] text-flare-soft">{s.n}</p>
                <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
                {/* phones: only the current step shows its detail, leaving room for the Moon */}
                <p className={clsx("mt-2 text-sm leading-relaxed text-star/75 sm:block", step === i ? "block" : "hidden")}>{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-dust">
            Read the full{" "}
            <Link href="/science#dosing" className="text-star underline decoration-flare underline-offset-4">
              dosing guide
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

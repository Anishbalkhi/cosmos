"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// the first two hours after one gummy, on one clock (minutes); these follow the dosing copy in lib/data.ts
const SPAN = 120;
const MARKS = [
  { at: 0, time: "0 min", label: "Take one", note: "With or after food" },
  { at: 45, time: "45 min", label: "It starts", note: "Effects usually begin" },
  { at: 90, time: "90 min", label: "Fully felt", note: "Give it this long" },
  { at: 120, time: "2 hours", label: "Decide", note: "Only then consider a second" },
];

const STEPS = [
  { n: "01", title: "Choose your need", body: "Rest, balance or focus. Each formula pairs 5 mg of leaf extract with two ingredients for one job." },
  { n: "02", title: "Take one gummy", body: "Start with one. Effects build over 45 to 90 minutes, so give it a full two hours before taking more." },
  { n: "03", title: "Notice the shift", body: "Calm, not a high. Note how you feel: after a few days it becomes your own dosing guide." },
];

/**
 * "Start low. Go slow." as one plain clock: the first two hours after a single gummy, drawn as a line
 * that fills in once when it comes into view, with the three steps underneath. No pinning, no scene:
 * a short, calm section between two big ones. Vertical on phones.
 */
export function HowItWorks() {
  const clock = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = clock.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="py-20 sm:py-28" aria-labelledby="how-title">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow mb-4">How to take it</p>
            <h2 id="how-title" className="display text-4xl sm:text-5xl">
              Start low. Go slow.
            </h2>
          </Reveal>
          <Link href="/science#dosing" className="text-sm text-star underline decoration-flare underline-offset-4 hover:text-flare-soft">
            Read the full dosing guide
          </Link>
        </div>

        {/* the clock */}
        <div ref={clock} className="relative mt-14 sm:mt-16">
          {/* track and fill: across on wide screens, down on phones */}
          <div className="absolute top-[7px] right-0 left-0 hidden h-px bg-white/15 sm:block" aria-hidden />
          <div
            className={clsx(
              "absolute top-[7px] right-0 left-0 hidden h-px origin-left bg-flare transition-transform duration-[1.8s] ease-cosmic motion-reduce:transition-none sm:block",
              on ? "scale-x-100" : "scale-x-0",
            )}
            aria-hidden
          />
          <div className="absolute top-2 bottom-2 left-[7px] w-px bg-white/15 sm:hidden" aria-hidden />
          <div
            className={clsx(
              "absolute top-2 bottom-2 left-[7px] w-px origin-top bg-flare transition-transform duration-[1.8s] ease-cosmic motion-reduce:transition-none sm:hidden",
              on ? "scale-y-100" : "scale-y-0",
            )}
            aria-hidden
          />
          <ol className="relative grid gap-8 sm:block sm:h-32">
            {MARKS.map((m, i) => (
              <li
                key={m.at}
                style={{ "--x": `${(m.at / SPAN) * 100}%` } as React.CSSProperties}
                className={clsx(
                  "relative pl-8 sm:absolute sm:top-0 sm:left-[var(--x)] sm:w-48 sm:pl-0",
                  i === 0 ? "sm:text-left" : i === MARKS.length - 1 ? "sm:-translate-x-full sm:text-right" : "sm:-translate-x-1/2 sm:text-center",
                )}
              >
                <span
                  className={clsx(
                    "absolute top-[3px] left-0 block h-[15px] w-[15px] rounded-full border-2 border-space transition-colors duration-700 sm:static sm:inline-block",
                    on ? "bg-flare" : "bg-white/30",
                  )}
                  style={{ transitionDelay: on ? `${i * 420}ms` : "0ms" }}
                  aria-hidden
                />
                <span className="block font-mono text-xs tracking-[0.12em] text-flare-soft sm:mt-3">{m.time}</span>
                <span className="mt-1 block font-semibold text-star">{m.label}</span>
                <span className="mt-0.5 block text-sm text-dust">{m.note}</span>
              </li>
            ))}
          </ol>
        </div>

        <ol className="mt-14 grid gap-8 border-t border-line pt-10 sm:mt-12 md:grid-cols-3 md:gap-10">
          {STEPS.map((s, i) => (
            <li key={s.n}>
              <Reveal delay={i * 100}>
                <p className="font-mono text-xs tracking-[0.16em] text-flare-soft">{s.n}</p>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dust">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

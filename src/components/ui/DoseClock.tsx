"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

// the first two hours after one gummy, on one clock (minutes); these follow the dosing copy in lib/data.ts
const SPAN = 120;
const MARKS = [
  { at: 0, time: "0 min", label: "Take one", note: "With or after food" },
  { at: 45, time: "45 min", label: "It starts", note: "Effects usually begin" },
  { at: 90, time: "90 min", label: "Fully felt", note: "Give it this long" },
  { at: 120, time: "2 hours", label: "Decide", note: "Only then consider a second" },
];

/**
 * "Start low. Go slow." as one plain clock: the first two hours after a single gummy, a line that
 * fills in once when it comes into view. Across on wide screens, down on phones. Used on the home
 * page (How to take it) and the Science page's dosing guide.
 */
export function DoseClock({ className }: { className?: string }) {
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
    <div ref={clock} className={clsx("relative", className)}>
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
  );
}

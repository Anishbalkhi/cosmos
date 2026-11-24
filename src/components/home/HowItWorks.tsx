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

/**
 * "Start low. Go slow." as a slow flight toward the Sun (reference pin 880313058437041334):
 * scrolling flies the camera past Neptune (step 01) and Saturn (step 02) until the Sun
 * fills the frame (step 03). Real NASA photographs throughout.
 */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (st) => setStep(Math.min(2, Math.floor(st.progress * 3))),
        },
      });
      // Neptune grows out of the haze and slides past on the left
      // (each planet is gone before the next stage, so the Sun alone fills the last frame)
      tl.fromTo(".fly-neptune", { scale: 0.12, xPercent: 0, yPercent: 0, opacity: 0 }, { scale: 0.55, opacity: 1, duration: 0.55 }, 0)
        .to(".fly-neptune", { scale: 3.2, xPercent: -150, yPercent: -40, duration: 0.85, ease: "power2.in" }, 0.55)
        .to(".fly-neptune", { opacity: 0, duration: 0.3 }, 1.1)
        // Saturn follows on the right
        .fromTo(".fly-saturn", { scale: 0.1, opacity: 0 }, { scale: 0.5, opacity: 1, duration: 0.6 }, 1.0)
        .to(".fly-saturn", { scale: 3.0, xPercent: 140, yPercent: 55, duration: 0.8, ease: "power2.in" }, 1.6)
        .to(".fly-saturn", { opacity: 0, duration: 0.3 }, 2.1)
        // the Sun, small and far all along, grows until it fills the frame
        .fromTo(".fly-sun", { scale: 0.08 }, { scale: 0.35, duration: 2.0 }, 0)
        .to(".fly-sun", { scale: 1.25, duration: 1.0, ease: "power2.inOut" }, 2.0)
        .fromTo(".fly-haze", { opacity: 0.35 }, { opacity: 1, duration: 3.0 }, 0)
        .fromTo(".fly-stars", { scale: 1 }, { scale: 1.8, duration: 3.0 }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative h-[300vh] border-y border-line bg-black" aria-labelledby="how-title">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* the flight: warm haze, stars rushing outward, planets passing, the Sun ahead */}
        <div className="fly-haze absolute inset-0 bg-[radial-gradient(circle_at_62%_48%,rgb(232_150_70/0.28),rgb(120_70_30/0.12)_35%,transparent_70%)]" aria-hidden />
        <div
          className="fly-stars absolute inset-0 opacity-60"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 12% 22%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 78% 14%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 64% 72%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 30% 82%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 90% 56%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 44% 40%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 20% 60%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 85% 85%, #fff 50%, transparent 51%)",
          }}
        />
        <div className="absolute top-[74%] left-[58%] w-[min(70vmin,620px)] sm:top-[48%] sm:left-[62%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <div className="fly-sun origin-center">
            <Planet name="sun" glow="rgba(255,170,80,0.6)" className="w-full" sizes="620px" />
          </div>
        </div>
        {/* screen blend on the outer box: the Cassini photo's black sky must drop out against the flight */}
        <div className="absolute top-[72%] left-[52%] w-[min(40vmin,360px)] sm:top-[44%] sm:left-[56%] -translate-x-1/2 -translate-y-1/2 mix-blend-screen" aria-hidden>
          <div className="fly-saturn origin-center opacity-0">
            <Planet name="saturn" className="w-full" sizes="360px" />
          </div>
        </div>
        <div className="absolute top-[76%] left-[56%] w-[min(34vmin,300px)] sm:top-[52%] sm:left-[60%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <div className="fly-neptune origin-center opacity-0">
            <Planet name="neptune" shade="soft" glow="rgba(110,150,255,0.35)" className="w-full" sizes="300px" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/55 to-transparent sm:bg-gradient-to-r sm:from-black/85 sm:via-black/40" aria-hidden />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-start px-5 pt-24 sm:justify-center sm:px-8 sm:pt-0">
          <p className="eyebrow mb-5">How it works</p>
          <h2 id="how-title" className="display max-w-xl text-4xl sm:text-6xl lg:text-7xl">
            Start low. <em className="text-flare-soft">Go slow.</em>
          </h2>
          <ol className="mt-8 max-w-md space-y-4 sm:mt-12 sm:space-y-6">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className={clsx(
                  "border-l pl-5 transition-[opacity,border-color] duration-700",
                  // every step stays readable; the one you're flying through is lit
                  step === i ? "border-flare opacity-100" : "border-line opacity-45",
                )}
              >
                <p className="font-mono text-xs tracking-[0.18em] text-flare-soft">{s.n}</p>
                <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
                {/* phones: only the step being flown through shows its detail, leaving room for the flight */}
                <p className={clsx("mt-2 text-sm leading-relaxed text-star/75 sm:block", step === i ? "block" : "hidden")}>{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-sm text-dust">
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

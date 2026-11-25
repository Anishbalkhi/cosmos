"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { LeafStar } from "@/components/brand/LeafStar";
import { AGE_KEY, SEEN_KEY, introNeeded, useExperience } from "@/lib/experience";
import { ambient } from "@/lib/ambient";
import { SoundToggle } from "./SoundToggle";

// dev-only: window.__gsap lets you pause / step every animation (gsap.globalTimeline) when inspecting frames
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as Window & { __gsap?: typeof gsap }).__gsap = gsap;
}

type Phase = "loading" | "start" | "portal" | "denied";

/**
 * Intro sequence after Noomo Labs:
 *  1. LOADING —— a planet travels along a pill track —— 0→100%
 *  2. ENTER [START] COSMOS →  (START also confirms 18+)
 *  3. the words part, START collapses to a point, and a portal opens on the
 *     black hole behind, grows until it swallows the screen, the site appears.
 */
export function Intro() {
  const [gone, setGone] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [pct, setPct] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const setIntroDone = useExperience((s) => s.setIntroDone);
  const setBoost = useExperience((s) => s.setBoost);
  const setPortal = useExperience((s) => s.setPortal);
  // the loading bar shows on every full page load (it also covers the black hole's shader compile);
  // returning visitors skip the age check and the portal: the curtain just fades away
  const show = !gone;

  useEffect(() => {
    document.documentElement.style.overflow = show ? "hidden" : "";
    // the portal always opens onto the hero: undo any scroll position the browser restored on reload
    if (show) {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      useExperience.getState().lenis?.scrollTo(0, { immediate: true });
    }
  }, [show]);

  // 1. loader
  useEffect(() => {
    if (!show) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const o = { v: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      // the first 90% runs on a clock; the last 10% waits until the fonts and the page have really loaded
      // on the home page it also waits for the black hole's first frame (at most 6 s), so the arrival never
      // starts on a black screen
      const hero = !!document.querySelector(".hold-stage");
      const heroReady = new Promise<void>((r) => {
        if (!hero || useExperience.getState().heroReady) return r();
        const t = setTimeout(r, 6000);
        const off = useExperience.subscribe((st) => {
          if (st.heroReady) {
            clearTimeout(t);
            off();
            r();
          }
        });
      });
      const ready = Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true })),
        heroReady,
      ]);
      // no fade-in: the bar is in the server HTML and stays visible from the first paint, even if the page is busy
      // (a fade from opacity 0 left a black screen whenever setting up the 3D scenes held the main thread)
      tl.to(o, {
          v: 90,
          duration: reduced ? 0.3 : 1.6,
          ease: "power2.out",
          onUpdate: () => setPct(Math.round(o.v)),
        }, 0.2)
        .add(() => {
          tl.pause();
          void ready.then(() => tl.resume());
        })
        .to(o, { v: 100, duration: reduced ? 0.1 : 0.45, ease: "power2.inOut", onUpdate: () => setPct(Math.round(o.v)) })
        .add(() => {}, "+=0.25")
        .add(() => {
          document.fonts?.ready.then(() =>
            gsap.to(".in-load > *", {
              y: -24,
              opacity: 0,
              duration: 0.6,
              ease: "expo.in",
              stagger: 0.05,
              onComplete: () => {
                // read now, not at first render (that one is the server's guess, which is always "first visit")
                if (introNeeded()) return setPhase("start");
                // returning visitor: no age check, no portal; the curtain fades and the arrival starts
                gsap.to(root.current, {
                  opacity: 0,
                  duration: 0.6,
                  ease: "power2.out",
                  // the arrival waits on its first frame behind the fade and starts once the curtain is gone
                  onComplete: () => {
                    setIntroDone(true);
                    setGone(true);
                  },
                });
              },
            }),
          );
        });
    }, root);
    return () => ctx.revert();
    // setIntroDone is a stable store action
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // 2. start screen enters
  useEffect(() => {
    if (phase !== "start") return;
    const ctx = gsap.context(() => {
      gsap.from(".in-word-l", { xPercent: -30, opacity: 0, duration: 1.2, ease: "expo.out" });
      gsap.from(".in-word-r", { xPercent: 30, opacity: 0, duration: 1.2, ease: "expo.out" });
      gsap.from(".in-start", { scale: 0, rotate: -90, duration: 1.1, ease: "back.out(1.6)", delay: 0.15 });
      gsap.from(".in-corner", { scale: 1.8, opacity: 0, duration: 0.8, ease: "expo.out", delay: 0.35, stagger: 0.05 });
      gsap.from(".in-legal", { opacity: 0, y: 12, duration: 0.8, delay: 0.5 });
    }, root);
    root.current?.querySelector<HTMLButtonElement>(".in-start")?.focus({ preventScroll: true });
    return () => ctx.revert();
  }, [phase]);

  // 3. portal into the black hole
  function start() {
    if (phase !== "start") return;
    setPhase("portal");
    const el = root.current!;
    const w = window.innerWidth;
    const h = window.innerHeight;
    // the portal opens exactly where START collapses, and the black hole behind starts there too
    const b = el.querySelector<HTMLElement>(".in-start")!.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    el.style.setProperty("--cx", `${cx}px`);
    el.style.setProperty("--cy", `${cy}px`);
    setPortal({ x: cx, y: cy });
    // the first opening: a window onto the arrival, already moving behind it
    const small = Math.min(220, Math.max(110, Math.min(w, h) * 0.26));
    const full = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 40;

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        // saved only now: introNeeded() is read on every render, saving earlier would unmount the intro mid-animation
        try {
          localStorage.setItem(AGE_KEY, String(Date.now()));
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
        setBoost(0);
        setGone(true);
        setIntroDone(true);
      },
    });
    tl.to(".in-word-l", { xPercent: -60, opacity: 0, filter: "blur(12px)", duration: 0.7, ease: "power3.in" }, 0)
      .to(".in-word-r", { xPercent: 60, opacity: 0, filter: "blur(12px)", duration: 0.7, ease: "power3.in" }, 0)
      .to(".in-corner", { scale: 0, opacity: 0, duration: 0.4, ease: "power2.in" }, 0)
      .to(".in-legal, .in-sound", { opacity: 0, y: 10, duration: 0.4 }, 0)
      // the button sinks into the portal as it opens round it: never a black screen with a speck
      .to(".in-start", { scale: 0.55, opacity: 0, duration: 0.45, ease: "power2.in" }, 0.05)
      .add(() => {
        setBoost(1);
        ambient.whoosh();
        // the arrival starts now, so it is already moving inside the portal as it opens
        // (no frozen ring); the intro itself unmounts when the portal has swallowed the screen
        setIntroDone(true);
      }, 0.2)
      .fromTo(el, { "--r": `${b.width * 0.3}px` }, { "--r": `${small}px`, duration: 0.9, ease: "expo.out" }, 0.2)
      .fromTo(".in-ring", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.2)
      .to({}, { duration: 0.15 })
      .to(el, { "--r": `${full}px`, duration: 1.4, ease: "expo.inOut" })
      .to(".in-ring", { opacity: 0, duration: 0.8 }, "<0.5");
  }

  if (!show) return null;

  return (
    <div
      ref={root}
      className="intro-root fixed inset-0 z-[100]"
      style={{ "--r": "0px", "--cx": "50%", "--cy": "50%" } as React.CSSProperties}
    >
      {/* glowing rim of the portal (photon ring), centred where START collapsed */}
      <div
        className="in-ring pointer-events-none absolute rounded-full opacity-0"
        style={{
          left: "var(--cx)",
          top: "var(--cy)",
          width: "calc(var(--r) * 2)",
          height: "calc(var(--r) * 2)",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 0 1.5px rgb(var(--accent-soft-rgb)), 0 0 40px 6px rgb(var(--accent-rgb) / 0.75), inset 0 0 30px 4px rgb(var(--accent-soft-rgb) / 0.55)",
        }}
      />

      {/* the curtain, with a growing hole cut out where START was */}
      <div
        className="in-curtain absolute inset-0 flex flex-col overflow-hidden bg-space"
        style={{
          WebkitMaskImage: "radial-gradient(circle at var(--cx) var(--cy), transparent var(--r), #000 calc(var(--r) + 1.5px))",
          maskImage: "radial-gradient(circle at var(--cx) var(--cy), transparent var(--r), #000 calc(var(--r) + 1.5px))",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Cosmos"
      >
        <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(1px_1px_at_10%_20%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_80%_30%,#fff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_40%_70%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_65%_85%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_25%_55%,#fff_50%,transparent_51%),radial-gradient(1px_1px_at_92%_65%,#fff_50%,transparent_51%),radial-gradient(ellipse_at_50%_120%,rgb(var(--accent-rgb)/0.22),transparent_60%)]" />

        <div className="relative flex items-center justify-between px-5 pt-5 font-mono text-[11px] tracking-[0.18em] text-dust uppercase sm:px-8 sm:text-xs">
          <span className="flex items-center gap-2">
            <LeafStar className="h-4 w-4" /> Cosmos
          </span>
          <span>[ 18+ only ]</span>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center px-4">
          {phase === "loading" && (
            <div className="in-load flex w-full max-w-[1400px] flex-col items-center gap-5 overflow-hidden px-[2vw] sm:flex-row sm:gap-[2.5vw]" aria-live="polite">
              <span className="font-wide text-[11vw] leading-none sm:text-[4.6vw]">Loading</span>
              {/* flex-1 only in the row layout: in the phone column it would zero the track's height */}
              <div className="relative h-10 w-full shrink-0 rounded-full border border-star/60 sm:h-[3.4vw] sm:w-auto sm:flex-1">
                <div className="absolute inset-y-0 right-[1.4%] left-[1.4%]">
                  <span
                    className="absolute top-1/2 aspect-square h-[76%] rounded-full"
                    style={{
                      left: `${pct}%`,
                      transform: `translate(-${pct}%, -50%)`,
                      // a real Jupiter (Hubble, public domain) travels the track
                      background: "url(/planets/jupiter.webp) center / cover no-repeat",
                      boxShadow: "0 0 30px rgb(var(--accent-rgb) / 0.55)",
                    }}
                  />
                </div>
              </div>
              <span className="font-wide w-[3.2em] text-center text-[11vw] leading-none tabular-nums sm:text-right sm:text-[4.6vw]">
                {pct}
                <sup className="text-[0.32em]">%</sup>
              </span>
            </div>
          )}

          {(phase === "start" || phase === "portal") && (
            <>
              {/* symmetric 3-column grid: START sits at the exact horizontal centre, whatever the word widths */}
              <div className="flex w-full flex-col items-center gap-6 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-[2.5vw]">
                <span className="in-word-l serif-display text-[17vw] leading-none sm:justify-self-end sm:text-[7vw]">Enter</span>
                <div className="relative">
                  {["-top-3 -left-3 border-t border-l", "-top-3 -right-3 border-t border-r", "-bottom-3 -left-3 border-b border-l", "-bottom-3 -right-3 border-b border-r"].map((c) => (
                    <span key={c} className={`in-corner absolute h-3 w-3 border-star/80 ${c}`} />
                  ))}
                  <button
                    type="button"
                    onClick={start}
                    disabled={phase !== "start"}
                    // GSAP scales this button; the hover scale lives on the inner face so CSS transitions never fight it
                    className="in-start group relative grid aspect-square w-24 max-w-28 place-items-center rounded-full text-space outline-offset-4 sm:w-[6vw] sm:min-w-24"
                    aria-label="Start. By entering you confirm you are 18 or older."
                  >
                    <span className="absolute inset-0 animate-ping rounded-full bg-star/30 [animation-duration:2.4s]" />
                    <span className="absolute inset-0 rounded-full bg-star transition-transform duration-500 ease-cosmic group-hover:scale-110 group-focus-visible:scale-110" />
                    <span className="relative font-mono text-xs font-medium tracking-[0.22em] uppercase">Start</span>
                  </button>
                </div>
                <span className="in-word-r serif-display text-[17vw] leading-none sm:justify-self-start sm:text-[7vw]">
                  the <em className="text-flare-soft">Cosmos</em>
                </span>
              </div>
              <p className="in-legal mt-12 text-center text-sm text-dust">
                By entering you confirm you are 18 or older.{" "}
                <button className="underline underline-offset-4 hover:text-star" onClick={() => setPhase("denied")} disabled={phase !== "start"}>
                  I&rsquo;m under 18
                </button>
              </p>
            </>
          )}

          {phase === "denied" && (
            <div className="text-center">
              <p className="serif-display text-[14vw] leading-none sm:text-[6vw]">Not yet.</p>
              <p className="mt-6 text-dust">Cosmos is only for adults aged 18 and over. See you in a few orbits.</p>
            </div>
          )}
        </div>

        <div className="in-sound relative flex flex-col items-center gap-3 px-5 pb-8 text-center">
          <SoundToggle />
          <p className="max-w-xs font-mono text-[11px] leading-relaxed tracking-[0.16em] text-dust uppercase">
            To make this experience more immersive we use sound effects
          </p>
        </div>
      </div>
    </div>
  );
}

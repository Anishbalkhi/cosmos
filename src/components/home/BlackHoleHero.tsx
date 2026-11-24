"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";
import { blackHoleFrag } from "@/components/gl/shaders";
import { makeCodeTexture } from "@/components/gl/codeTexture";

const codeTextures = () => ({ uCode: makeCodeTexture() });
import { scrollToY, useExperience } from "@/lib/experience";
import { ambient } from "@/lib/ambient";
import { ButtonLink } from "@/components/ui/Button";

const HOLD_MS = 1600;
const POST = { threshold: 0.85, bloom: 0.42, streak: 0.22, aberration: 0.02, exposure: 1.05, grain: 0.03, vignette: 0.35 };

/** CSS stand-in for the shader (no WebGL / before it boots). */
function CssBlackHole() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="relative aspect-square w-[min(40vmin,360px)] -translate-y-[18%]">
        <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/0.35),transparent_62%)]" />
        <div className="absolute inset-0 rounded-full shadow-[0_0_80px_20px_rgb(var(--accent-soft-rgb)/0.55),inset_0_0_40px_10px_rgba(255,220,190,0.8)]" />
        <div className="absolute inset-[6%] rounded-full bg-black" />
      </div>
    </div>
  );
}

function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`inline-block overflow-hidden pb-[0.08em] align-top ${className ?? ""}`}>
      {Array.from(text).map((ch, i) => (
        <span key={i} className="hero-anim ha-char inline-block will-change-transform">
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * Hero: a live black hole. Scroll — or click and hold, as on Noomo Labs —
 * to fall through the event horizon into the manifesto.
 */
export function BlackHoleHero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const progress = useRef(0);
  const boost = useRef(0);
  const warp = useRef({ v: 1 });
  const camera = useRef({ last: 0, lastW: 1, amp: 0, x: 0, y: 0 });
  const [p, setP] = useState(0);
  // cheaper ray-march on phones
  const [quality] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? { scale: 0.42, steps: 70 } : { scale: 0.62, steps: 120 },
  );
  const introDone = useExperience((s) => s.introDone);
  const lenis = useExperience((s) => s.lenis);
  // true until the headline lands: hides the site chrome (see [data-arriving] in globals.css)
  const [arriving, setArriving] = useState(true);

  // the arrival always plays on the hero: no scrolling until the headline has landed.
  // (overflow alone isn't enough: Lenis scrolls by script, so it has to be stopped too;
  //  this re-runs if Lenis boots after the hero)
  useEffect(() => {
    if (!arriving) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      html.style.overflow = "";
      lenis?.start();
    };
  }, [arriving, lenis]);

  // scroll progress through the 230vh section
  useEffect(() => {
    const onScroll = () => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const v = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      progress.current = v;
      setP(Math.round(v * 100) / 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const uniforms = useCallback(() => {
    boost.current += (useExperience.getState().boost - boost.current) * 0.05;
    // dev-only: window.__warp = 0..1 freezes the arrival sequence for inspection
    const dbg = process.env.NODE_ENV !== "production" ? (window as Window & { __warp?: number }).__warp : undefined;
    const w = dbg ?? warp.current.v;

    // camera with weight: shake follows how fast we're diving (plus holding / falling in),
    // eased through a spring so it builds and settles instead of switching on and off
    const now = performance.now();
    const cam = camera.current;
    const dt = Math.min(0.1, (now - cam.last) / 1000) || 0.016;
    cam.last = now;
    const speed = Math.abs(w - cam.lastW) / dt;
    cam.lastW = w;
    const target = Math.min(1, speed * 0.9) + boost.current * 0.6 + Math.max(0, progress.current - 0.4) * 0.8;
    cam.amp += (target - cam.amp) * (1 - Math.exp(-dt * 3));
    const t = now / 1000;
    const a = cam.amp * cam.amp;
    const nx = Math.sin(t * 13.1) * 0.6 + Math.sin(t * 29.7 + 1.3) * 0.3 + Math.sin(t * 71.0 + 4.1) * 0.1;
    const ny = Math.sin(t * 11.3 + 2.1) * 0.6 + Math.sin(t * 31.9 + 0.4) * 0.3 + Math.sin(t * 67.0 + 2.7) * 0.1;
    const tx = nx * 0.011 * a, ty = ny * 0.011 * a;
    cam.x += (tx - cam.x) * 0.35;
    cam.y += (ty - cam.y) * 0.35;
    const roll = Math.sin(t * 2.3) * 0.012 * a + (1 - w) * w * 0.05; // a slow bank through the dive

    // exposure swells as the vortex catches fire, then settles on the hero
    const s = 1 - w;
    const flare = Math.exp(-(((s - 0.84) / 0.09) ** 2));

    // the arrival's black hole starts exactly where the intro portal opened (the START button),
    // so you see it through the portal; without an intro it drifts in from the left
    let hole0: [number, number] = [-0.5, 0.04];
    const portal = useExperience.getState().portal;
    const st = stage.current;
    if (portal && st) {
      const r = st.getBoundingClientRect();
      const m = Math.min(r.width, r.height) || 1;
      hole0 = [(portal.x - r.left - r.width / 2) / m, (r.top + r.height / 2 - portal.y) / m - 0.11];
    }
    return {
      uPush: progress.current,
      uBoost: boost.current,
      uWarp: w,
      uSteps: quality.steps,
      uShake: [cam.x, cam.y, roll] as [number, number, number],
      uExposure: 1.0 + flare * 0.06,
      uHole0: hole0,
    };
  }, [quality.steps]);

  // entrance once the intro portal has opened: approach → hang at the edge → dive, then the headline lands
  useEffect(() => {
    if (!introDone) return;
    // start from the very top, whatever the browser restored or the wheel did during loading
    window.scrollTo(0, 0);
    useExperience.getState().lenis?.scrollTo(0, { immediate: true, force: true });
    let hurry: (() => void) | null = null;
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({ delay: 0.05 });
      // scrolling (or a key) during the arrival doesn't leave it behind: it speeds it up instead
      hurry = () => {
        if (tl.currentLabel() !== "land" && tl.timeScale() < 3) gsap.to(tl, { timeScale: 3, duration: 0.5, ease: "power2.out" });
      };
      const calm = () => {
        if (hurry) {
          window.removeEventListener("wheel", hurry);
          window.removeEventListener("touchmove", hurry);
          window.removeEventListener("keydown", hurry);
        }
        gsap.to(tl, { timeScale: 1, duration: 0.3 });
      };
      window.addEventListener("wheel", hurry, { passive: true });
      window.addEventListener("touchmove", hurry, { passive: true });
      window.addEventListener("keydown", hurry);
      if (reduced) {
        tl.set(warp.current, { v: 0 });
        tl.addLabel("land", 0);
        tl.call(() => setArriving(false), undefined, "land");
      } else {
        const rumble = { b: 0 };
        // paced like the reference video (pin 880313058437018011); v = 1 - s, see arrival() in shaders.ts
        tl.fromTo(warp.current, { v: 1 }, { v: 0.66, duration: 2.2, ease: "power1.in" }, 0) // code pours into the hole
          .addLabel("whip")
          .call(() => ambient.thump(1), undefined, "whip")
          .to(warp.current, { v: 0.5, duration: 0.6, ease: "power2.inOut" }) // the camera whips round to face it
          .to(warp.current, { v: 0.28, duration: 1.1, ease: "none" }) // light rays stream in
          .to(warp.current, { v: 0.12, duration: 1.2, ease: "power1.out" }) // the fire vortex
          .addLabel("settle")
          .to(warp.current, { v: 0, duration: 1.0, ease: "power2.out" }) // flames clear onto the hero black hole
          .fromTo(
            rumble,
            { b: 0 },
            { b: 0.85, duration: 1.7, ease: "power2.in", onUpdate: () => ambient.setBoost(rumble.b) },
            "whip",
          )
          .to(rumble, { b: 0, duration: 1.4, ease: "power2.out", onUpdate: () => ambient.setBoost(rumble.b) }, "whip+=2.3")
          .call(() => ambient.thump(0.45), undefined, "settle+=0.2")
          .addLabel("land", "settle+=0.3")
          // the header, announcement bar and sound toggle fade in with the headline, not before
          .call(() => setArriving(false), undefined, "land+=0.4");
      }
      // the headline itself always lands at normal speed
      tl.call(calm, undefined, "land");
      tl.fromTo(".ha-char", { opacity: 1, yPercent: 120, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 1.6, ease: "expo.out", stagger: 0.07 }, "land")
        .fromTo(".ha-top", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.1 }, "land+=0.2")
        .fromTo(".ha-sub", { opacity: 0, y: 24, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out" }, "land+=0.55")
        .fromTo(".ha-cta", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.1 }, "land+=0.7")
        .fromTo(".ha-bottom", { opacity: 0 }, { opacity: 1, duration: 0.8 }, "land+=0.9")
        .fromTo(".ha-rail", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "expo.inOut" }, "land+=0.9");
    }, section);
    // (if the hero unmounts mid-arrival, its data-arriving element goes with it, so the chrome reappears)
    return () => {
      if (hurry) {
        window.removeEventListener("wheel", hurry);
        window.removeEventListener("touchmove", hurry);
        window.removeEventListener("keydown", hurry);
      }
      ctx.revert();
    };
  }, [introDone]);

  // Noomo-style "click and hold" cursor
  useEffect(() => {
    const st = stage.current;
    const cur = cursor.current;
    if (!st || !cur || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const C = 2 * Math.PI * 47;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: window.innerWidth / 2, ty: window.innerHeight / 2 };
    let hold = 0;
    let lastHold = 0;
    let holding = false;
    let visible = false;
    let fired = false;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(100, now - last); // time-based: same feel at any frame rate
      last = now;
      const k = 1 - Math.pow(0.84, dt / 16.7);
      pos.x += (pos.tx - pos.x) * k;
      pos.y += (pos.ty - pos.y) * k;
      hold = Math.max(0, Math.min(1, hold + (holding ? dt / HOLD_MS : -dt / 400)));
      cur.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${visible ? (holding ? 0.82 : 1) : 0})`;
      ring.current?.setAttribute("stroke-dashoffset", String(C * (1 - hold)));
      // only while the hold changes, so the arrival's rumble isn't overwritten every frame
      if (!fired && hold !== lastHold) {
        useExperience.getState().setBoost(hold);
        ambient.setBoost(hold);
      }
      lastHold = hold;
      if (hold >= 1 && !fired) {
        fired = true;
        holding = false;
        const el = section.current!;
        scrollToY(el.offsetTop + el.offsetHeight, 2.6);
        setTimeout(() => {
          fired = false;
          useExperience.getState().setBoost(0);
          ambient.setBoost(0);
        }, 2600);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const interactive = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.("a,button");
    const move = (e: PointerEvent) => {
      const r = st.getBoundingClientRect();
      pos.tx = e.clientX - r.left;
      pos.ty = e.clientY - r.top;
      visible = !interactive(e.target);
      if (!visible) holding = false;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || interactive(e.target)) return;
      holding = true;
    };
    const up = () => (holding = false);
    const leave = () => {
      visible = false;
      holding = false;
    };
    st.addEventListener("pointermove", move);
    st.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    st.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      st.removeEventListener("pointermove", move);
      st.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      st.removeEventListener("pointerleave", leave);
    };
  }, []);

  const fadeOut = Math.max(0, 1 - p * 2.6);
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  // the bridge line rises as you pass the horizon and is gone before the manifesto surfaces
  const bridge = clamp01((p - 0.38) / 0.17) * (1 - clamp01((p - 0.68) / 0.12));

  return (
    <section ref={section} className="relative h-[230vh]" aria-label="Cosmos">
      <div
        ref={stage}
        data-arriving={arriving ? "true" : undefined}
        className="hold-stage sticky top-0 h-dvh touch-pan-y overflow-hidden bg-black select-none"
      >
        <CssBlackHole />
        <ShaderCanvas
          frag={blackHoleFrag}
          uniforms={uniforms}
          className="absolute inset-0"
          scale={quality.scale}
          maxDpr={2}
          textures={codeTextures}
          post={POST}
        />
        {/* soft fade so the headline always reads over the disk */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black via-black/55 to-transparent" />

        {/* headline layer */}
        <div
          // top padding clears the announcement bar + header the hero now sits under
          className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-5 pt-32 pb-20 sm:px-8 sm:pt-36 sm:pb-24"
          style={{ opacity: fadeOut, transform: `scale(${1 + p * 0.25})`, filter: `blur(${p * 10}px)` }}
        >
          <div className="flex items-start justify-between font-mono text-[11px] tracking-[0.18em] text-star/70 uppercase">
            <span className="hero-anim ha-top">
              [ Bangalore ]<span className="hidden sm:inline"> · Plant wisdom, thoughtfully considered</span>
            </span>
            <span className="hero-anim ha-top hidden sm:block">Soft launch · Dec 2026</span>
          </div>

          <div className="mt-auto text-center">
            {/* soft dark halo keeps the letters clear of the bright lensed ring behind them */}
            <h1
              className="serif-display text-[22vw] leading-[0.85] [text-shadow:0_4px_40px_rgb(0_0_0/0.6)] sm:text-[17vw] lg:text-[13.5rem]"
              aria-label="The Cure"
            >
              <span aria-hidden>
                <Chars text="The" />
                <span className="inline-block w-[0.25em]" />
                <Chars text="Cure" className="text-flare-soft italic" />
              </span>
            </h1>
            <p className="hero-anim ha-sub mx-auto mt-5 max-w-lg text-base text-star/80 sm:mt-6 sm:text-lg [@media(max-height:640px)]:hidden">
              Rest, balance and focus. Precisely dosed. Beautifully made.
            </p>
            {/* side by side even on phones, so the hero fits short screens; wraps on the narrowest */}
            <div className="mt-7 flex flex-row flex-wrap justify-center gap-3 sm:mt-8">
              <div className="hero-anim ha-cta">
                <ButtonLink href="/shop" arrow>
                  Shop the Cure
                </ButtonLink>
              </div>
              <div className="hero-anim ha-cta">
                <ButtonLink href="#waitlist" variant="ghost">
                  Join the waitlist
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        {/* bridge line that appears as you fall in */}
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 text-center" style={{ opacity: bridge }}>
          <p className="serif-display max-w-4xl text-4xl leading-tight sm:text-6xl lg:text-7xl" style={{ transform: `scale(${0.9 + bridge * 0.1})` }}>
            Past the event horizon,
            <br />
            <em className="text-flare-soft">the noise can&rsquo;t follow.</em>
          </p>
        </div>

        {/* Noomo-style bottom bar */}
        <div className="hero-anim ha-bottom absolute inset-x-0 bottom-0 z-10 px-5 pb-6 sm:px-8">
          <div style={{ opacity: Math.max(0, 1 - Math.max(0, p - 0.7) * 4) }}>
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 font-mono text-[11px] leading-relaxed tracking-[0.16em] whitespace-nowrap uppercase text-star/85 sm:text-xs">
            {/* indented on sm–xl so it clears the fixed sound toggle in the bottom-left corner */}
            <span className="hidden sm:ml-28 sm:inline 2xl:ml-0">Are you ready to go beyond the everyday?</span>
            <span className="sm:hidden">Go beyond</span>
            <span className="pointer-coarse:hidden">Click and hold</span>
            <span className="hidden pointer-coarse:inline">Scroll</span>
          </div>
          <div className="ha-rail mx-auto mt-3 h-[3px] max-w-7xl origin-left rounded-full bg-white/20">
            <div className="h-full rounded-full bg-flare" style={{ width: `${p * 100}%` }} />
          </div>
          </div>
        </div>

        {/* custom cursor */}
        <div
          ref={cursor}
          className="pointer-events-none absolute top-0 left-0 z-20 hidden h-24 w-24 transition-[scale] pointer-fine:block"
          style={{ transform: "scale(0)" }}
          aria-hidden
        >
          <div className="absolute inset-0 rounded-full border border-white/25 bg-white/10 backdrop-blur-md" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle ref={ring} cx="50" cy="50" r="47" fill="none" stroke="var(--color-flare)" strokeWidth="3" strokeDasharray={2 * Math.PI * 47} strokeDashoffset={2 * Math.PI * 47} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-center font-mono text-[9px] leading-tight tracking-[0.18em] uppercase">
            Click
            <br />
            and hold
          </span>
        </div>
      </div>
    </section>
  );
}

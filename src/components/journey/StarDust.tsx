"use client";

import { useEffect, useRef } from "react";
import { driveJourney, journey, stopAt } from "@/lib/journey";

const N = 160;

type Mote = { x: number; y: number; z: number; seed: number; px: number; py: number };

/**
 * Star dust across the whole home page, just in front of the shared sky and behind the content: motes in 3D drifting toward you, faster when
 * you scroll fast (and drawn as short streaks then), rising past as you go down, tinted by the
 * current stop. It is the one layer that never changes from section to section except in colour and
 * pace, which is what makes the page read as one flight. Canvas 2D, a few hundred dots a frame.
 * Off for reduced motion; paused while the tab is hidden.
 */
export function StarDust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const release = driveJourney();

    let w = 0, h = 0, dpr = 1, f = 1, ax = 1, ay = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      f = Math.min(w, h) * 0.5;
      // the world box that just fills the screen at the far plane (z = 1)
      ax = w / 2 / f;
      ay = h / 2 / f;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (m: Mote, far: boolean) => {
      m.x = (Math.random() * 2 - 1) * ax;
      m.y = (Math.random() * 2 - 1) * ay;
      m.z = far ? 0.85 + Math.random() * 0.15 : 0.08 + Math.random() * 0.92;
      m.px = NaN;
      m.py = NaN;
    };
    const motes: Mote[] = Array.from({ length: N }, () => {
      const m = { x: 0, y: 0, z: 1, seed: Math.random(), px: NaN, py: NaN };
      spawn(m, false);
      return m;
    });

    let raf = 0;
    let last = performance.now();
    let lastScroll = window.scrollY;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (document.hidden) return;

      const sy = window.scrollY;
      const dy = (sy - lastScroll) / h; // screens scrolled this frame
      lastScroll = sy;
      const s = stopAt(journey.t);
      const rush = Math.min(1.2, Math.abs(journey.v));
      const speed = 0.05 * s.dustSpeed + rush * 0.2; // depth per second
      // on the hero the black hole has its own particles: the dust only comes up to full as it scrolls away
      const vh = h || 1;
      const heroFade = 0.35 + 0.65 * Math.min(1, Math.max(0, (sy - (journey.start - vh)) / vh));
      // the same density per pixel on every screen: a phone gets far fewer motes than a laptop
      const area = Math.min(1, (w * h) / (1280 * 720));
      const shown = Math.round(N * s.dustDensity * Math.max(0.35, area));
      const [r, g, b] = s.dust.map((c) => Math.round(Math.min(1, c) * 255));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      const cx = w / 2, cy = h / 2;

      for (let i = 0; i < N; i++) {
        const m = motes[i];
        const z0 = m.z;
        m.z -= speed * dt * (0.7 + m.seed * 0.6);
        // going down the page the dust rises past, nearer motes faster (a mote at z 0.3 keeps pace with the text)
        m.y += dy * (h / f) * 0.3;
        if (m.z < 0.04) {
          spawn(m, true);
          continue;
        }
        if (m.y > ay) {
          m.y -= 2 * ay;
          m.px = NaN;
        } else if (m.y < -ay) {
          m.y += 2 * ay;
          m.px = NaN;
        }
        const sx = cx + (m.x / m.z) * f;
        const syy = cy - (m.y / m.z) * f;
        if (sx < -40 || sx > w + 40 || syy < -40 || syy > h + 40) {
          // flown past the edge of the screen: back to the far plane
          if (m.z < 0.9) spawn(m, true);
          continue;
        }
        if (i < shown) {
          const near = 1 - m.z;
          const size = 0.6 + 2.2 * near * near;
          const alpha = Math.min(1, (1 - m.z) / 0.2) * Math.min(1, (m.z - 0.04) / 0.1) * (0.22 + 0.45 * m.seed) * heroFade;
          ctx.strokeStyle = ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
          // a streak only along the flight (outward from the centre), from where the same mote sat at its
          // previous depth: scrolling up or down never draws vertical lines (they read as rain)
          const bx = cx + (m.x / z0) * f;
          const by = cy - (m.y / z0) * f;
          const moved = Math.hypot(sx - bx, syy - by);
          if (moved > 1.2) {
            const k = Math.min(1, 9 / moved);
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(sx - (sx - bx) * k, syy - (syy - by) * k);
            ctx.lineTo(sx, syy);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(sx, syy, size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        m.px = sx;
        m.py = syy;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      release();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-40 h-full w-full" />;
}

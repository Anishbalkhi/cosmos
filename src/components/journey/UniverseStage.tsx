"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { universeFrag } from "@/components/gl/journeyShaders";
import { driveJourney, journey, lightsAt, stopAt, type Stop } from "@/lib/journey";

const POST: PostSettings = { threshold: 0.75, bloom: 0.55, streak: 0.16, aberration: 0, exposure: 1.0, grain: 0.03, vignette: 0.35 };

/**
 * The one sky behind the whole home page. Fixed to the screen, under every section: sections are
 * transparent or feathered at their edges, so this is what shows at every seam, and it changes
 * stop by stop with the journey (colour script, the light object, stars streaming past).
 * It sleeps until the hero has scrolled away (the hero paints the whole screen until then).
 */
export function UniverseStage({ sky }: { sky?: Stop } = {}) {
  const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => driveJourney(), []);

  // the brand accent as linear-ish 0..1 RGB, re-read when the accent preview switches
  const accent = useRef<[number, number, number]>([1, 0.72, 0.43]);
  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim().split(/\s+/).map(Number);
      if (v.length === 3 && v.every(Number.isFinite)) accent.current = [v[0] / 255, v[1] / 255, v[2] / 255];
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-accent"] });
    return () => mo.disconnect();
  }, []);

  const uniforms = useCallback(() => {
    // a page with its own fixed sky (Science) holds that one look; the sky still rolls a little as it scrolls
    const s = sky
      ? { ...sky, veilAmt: sky.veil ? 0.7 : 0, accentAmt: 0, roll: 0.12 + journey.y * 0.012, grade: 0.7 }
      : stopAt(journey.t);
    const tint = (c: [number, number, number], on: boolean): [number, number, number] =>
      on ? [accent.current[0], accent.current[1], accent.current[2]] : c;
    const { a, b, k } = sky ? { a: sky, b: sky, k: 0 } : lightsAt(journey.t);
    // reduced motion draws one still frame: sky and stars only, no light that would sit in the wrong place
    const on = reduced ? 0 : 1;
    return {
      uAPos: a.pos,
      uAShape: [a.r, a.squash, a.fill] as [number, number, number],
      uALine: [a.w, a.split, a.arc] as [number, number, number],
      uAAng: a.arcAng,
      uACol: tint(a.color, !!a.accent),
      uAInt: a.intensity * on,
      uBPos: b.pos,
      uBShape: [b.r, b.squash, b.fill] as [number, number, number],
      uBLine: [b.w, b.split, b.arc] as [number, number, number],
      uBAng: b.arcAng,
      uBCol: tint(b.color, !!b.accent),
      uBInt: b.intensity * on,
      uLMix: k,
      uSkyTop: s.skyTop,
      uSkyLow: s.skyLow,
      uNeb: s.neb,
      // the camera moves forward with the scroll (and a little on its own) and down with it
      uCamZ: journey.y * 0.55,
      uScroll: journey.y,
      uStars: s.stars ?? 1,
      uMW: s.mw ?? 0.35,
      uVeilA: s.veil![0],
      uVeilB: s.veil![1],
      uVeil: s.veilAmt,
      uRoll: s.roll,
      uGrade: s.grade,
      // fewer stars per screen on small screens (the same density per pixel as on a laptop)
      uDensity: Math.min(1, Math.sqrt((window.innerWidth * window.innerHeight) / (1280 * 720))),
    };
  }, [reduced, sky]);

  const active = useCallback(() => !!sky || window.scrollY >= journey.start - 2, [sky]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-50" aria-hidden data-universe>
      <ShaderCanvas frag={universeFrag} uniforms={uniforms} active={active} scale={0.5} maxDpr={1.5} post={POST} />
    </div>
  );
}

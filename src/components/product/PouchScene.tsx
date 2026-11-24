"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { getProduct, type Glyph } from "@/lib/data";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { pouchFrag } from "@/components/gl/objectShaders";
import { pouchTextures, type PouchTextures } from "./pouchArt";
import { GUMMY, rgb } from "./colors";

const POST: PostSettings = { threshold: 1.0, bloom: 0.38, streak: 0.14, aberration: 0.006, exposure: 1.0, grain: 0.03, vignette: 0.28 };

const KIND: Record<Glyph, number> = { blackhole: 0, elevator: 1, moon: 2, asteroids: 2 };
// light thrown onto the pouch by its world: warm disk / blue Earth / grey-gold Moon
const WORLD_LIGHT: Record<Glyph, [number, number, number]> = {
  blackhole: [1.0, 0.62, 0.32],
  elevator: [0.3, 0.5, 1.0],
  moon: [0.7, 0.62, 0.5],
  asteroids: [0.8, 0.45, 0.3],
};
/**
 * The product as a real 3D object: its pouch, printed front and back, with gummies in orbit,
 * in front of its world. Ray-traced in the same HDR pipeline as the hero black hole.
 * - cards: the pouch sways and turns toward the cursor while the card is hovered
 * - `turntable` (product page): turns slowly all the way round; drag to spin it
 */
export function PouchScene({ slug, turntable = false, className }: { slug: string; turntable?: boolean; className?: string }) {
  const product = getProduct(slug);
  const host = useRef<HTMLDivElement>(null);
  const [tex, setTex] = useState<PouchTextures | null>(null);
  const s = useRef({ hover: 0, th: 0, lx: 0, ly: 0, tlx: 0, tly: 0, spin: 0, vel: 0, drag: false, px: 0, yaw: 0, orbit: 0, last: 0 });

  useEffect(() => {
    if (!product) return;
    let alive = true;
    pouchTextures(product)
      .then((t) => alive && setTex(t))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [product]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const st = s.current;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      st.th = inside && e.pointerType === "mouse" ? 1 : 0;
      if (inside) {
        st.tlx = x * 2 - 1;
        st.tly = y * 2 - 1;
      }
      if (st.drag) {
        const dx = e.clientX - st.px;
        st.px = e.clientX;
        st.spin += dx * 0.012;
        st.vel = dx * 0.012;
      }
    };
    const down = (e: PointerEvent) => {
      if (!turntable) return;
      st.drag = true;
      st.px = e.clientX;
      st.vel = 0;
    };
    const up = () => {
      st.drag = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [turntable]);

  const textures = useCallback((): Record<string, TexImageSource> => (tex ? { uLabel: tex.label, uWorld: tex.world } : {}), [tex]);

  const fixed = useMemo(
    () =>
      product
        ? { uKind: KIND[product.glyph], uCol: rgb(product.color), uWorldCol: WORLD_LIGHT[product.glyph], uGum: GUMMY[product.slug] ?? rgb(product.color) }
        : null,
    [product],
  );

  const uniforms = useCallback(() => {
    const st = s.current;
    const now = performance.now() / 1000;
    const dt = st.last ? Math.min(now - st.last, 0.05) : 0;
    st.last = now;
    st.hover += (st.th - st.hover) * 0.07;
    st.lx += (st.tlx - st.lx) * 0.06;
    st.ly += (st.tly - st.ly) * 0.06;
    if (!st.drag) {
      st.spin += st.vel;
      st.vel *= 0.94;
      if (turntable) st.yaw += dt * 0.32;
    }
    const base = turntable ? st.yaw - 0.35 : Math.sin(now * 0.35) * 0.42 - 0.18;
    st.orbit += dt * (0.3 + 0.55 * st.hover);
    return {
      ...fixed!,
      uYaw: base + st.spin + st.lx * 0.55 * st.hover,
      uPitch: -0.05 + st.ly * 0.16 * st.hover + Math.sin(now * 0.5) * 0.03,
      uLift: 0.05 * st.hover + Math.sin(now * 0.8) * 0.025,
      uOrbit: st.orbit,
    };
  }, [fixed, turntable]);

  if (!product) return null;
  return (
    <div
      ref={host}
      className={clsx("relative h-full w-full bg-black", turntable && "cursor-grab touch-pan-y select-none active:cursor-grabbing", className)}
      role="img"
      aria-label={`${product.name} pouch with gummies`}
    >
      {tex && (
        <div className="absolute inset-0 animate-fade-in">
          <ShaderCanvas frag={pouchFrag} textures={textures} uniforms={uniforms} post={POST} scale={0.85} maxDpr={1.75} />
        </div>
      )}
    </div>
  );
}

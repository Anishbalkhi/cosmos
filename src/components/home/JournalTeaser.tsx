"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { articles, type Article } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";
import { nebulaFlightFrag } from "@/components/gl/sectionShaders";
import { Planet } from "@/components/space/Planet";
import { TAG_PLANET, formatDate } from "@/components/journal/ArticleCard";

type RGB = [number, number, number];

// the nebula's colours: Ascension's blue/magenta at rest, retinted for the article in view
const PALETTE: Record<Article["tag"] | "rest", [RGB, RGB]> = {
  rest: [
    [0.22, 0.32, 0.95],
    [0.85, 0.22, 0.55],
  ],
  Science: [
    [0.2, 0.45, 1.0],
    [0.25, 0.85, 0.9],
  ],
  Wellbeing: [
    [0.55, 0.25, 0.95],
    [0.95, 0.3, 0.55],
  ],
  Culture: [
    [0.95, 0.55, 0.2],
    [0.75, 0.25, 0.35],
  ],
};

const POST = { threshold: 0.7, bloom: 0.5, streak: 0.08, aberration: 0.01, exposure: 1.1, grain: 0.035, vignette: 0.3 };

/**
 * "Ideas worth exploring" as an editorial index, not cards. A slow flight through nebula clouds
 * sits behind (reference pin 880313058437018080, "Ascension"); hovering an article lifts its
 * planet as a glowing orb that follows the cursor behind the type (Klick reference) and retints
 * the nebula to match.
 */
export function JournalTeaser() {
  const section = useRef<HTMLElement>(null);
  const orb = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const col = useRef<{ a: RGB; b: RGB; boost: number }>({ a: [...PALETTE.rest[0]], b: [...PALETTE.rest[1]], boost: 0 });

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  // nebula colours ease toward the hovered article's palette every frame
  const uniforms = useCallback(() => {
    const h = hoverRef.current;
    const [ta, tb] = h === null ? PALETTE.rest : PALETTE[articles[h].tag];
    const c = col.current;
    for (let i = 0; i < 3; i++) {
      c.a[i] += (ta[i] - c.a[i]) * 0.04;
      c.b[i] += (tb[i] - c.b[i]) * 0.04;
    }
    c.boost += ((h === null ? 0 : 1) - c.boost) * 0.04;
    return { uColA: [...c.a] as RGB, uColB: [...c.b] as RGB, uBoost: c.boost };
  }, []);

  // the orb trails the cursor with a soft lag
  useEffect(() => {
    const el = section.current;
    const o = orb.current;
    if (!el || !o || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const p = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      p.tx = e.clientX - r.left;
      p.ty = e.clientY - r.top;
    };
    const loop = () => {
      p.x += (p.tx - p.x) * 0.09;
      p.y += (p.ty - p.y) * 0.09;
      o.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={section} className="relative isolate overflow-hidden py-28 sm:py-36" onPointerLeave={() => setHover(null)}>
      {/* the nebula flight */}
      <div className="absolute inset-0 -z-20" aria-hidden>
        <ShaderCanvas frag={nebulaFlightFrag} uniforms={uniforms} scale={0.5} post={POST} />
      </div>
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-space via-space/25 to-space" aria-hidden />

      {/* the hovered article's planet, glowing behind the type */}
      <div
        ref={orb}
        className="pointer-events-none absolute top-0 left-0 -z-10 hidden w-[min(34vw,440px)] pointer-fine:block"
        aria-hidden
      >
        {articles.map((a, i) => (
          <div
            key={a.slug}
            className={clsx(
              "absolute inset-0 transition-[opacity,transform,filter] duration-700 ease-cosmic",
              hover === i ? "scale-100 opacity-90 blur-0" : "scale-75 opacity-0 blur-md",
            )}
          >
            <Planet name={TAG_PLANET[a.tag].planet} shade="soft" glow={TAG_PLANET[a.tag].glow} className="w-full" sizes="440px" eager />
          </div>
        ))}
        <div className="aspect-square" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-5">The field journal</p>
            <h2 data-split className="display text-5xl sm:text-6xl lg:text-7xl">
              Ideas worth <em className="text-flare-soft">exploring</em>
            </h2>
          </div>
          <ButtonLink href="/journal" variant="ghost" arrow className="shrink-0">
            Visit the journal
          </ButtonLink>
        </div>

        {/* the index */}
        <ol className="mt-16 border-b border-line">
          {articles.map((a, i) => (
            <li key={a.slug} onPointerEnter={() => setHover(i)}>
              <Reveal delay={i * 120}>
                <Link
                  href={`/journal/${a.slug}`}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className={clsx(
                    "group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 border-t border-line py-8 transition-opacity duration-500 sm:gap-x-10 sm:py-11",
                    hover !== null && hover !== i && "opacity-35",
                  )}
                >
                  <span className="pt-2 font-mono text-xs tracking-[0.18em] text-flare-soft sm:pt-4">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="bracket block text-dust">
                      [ {a.tag} ] {formatDate(a.date)} · {a.minutes} min
                    </span>
                    <span className="display mt-3 block text-[2.1rem] leading-[1.02] transition-transform duration-700 ease-cosmic group-hover:translate-x-3 sm:text-6xl lg:text-7xl">
                      {a.title}
                    </span>
                    <span className="mt-4 block max-w-xl text-sm leading-relaxed text-star/70 sm:text-base">{a.excerpt}</span>
                  </span>
                  {/* touch screens have no hover orb: a small planet marks each story instead */}
                  <span className="flex flex-col items-end gap-4 pt-1">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-line transition-[transform,background-color,border-color] duration-500 group-hover:-rotate-45 group-hover:border-flare group-hover:bg-flare group-hover:text-space sm:h-14 sm:w-14">
                      <span aria-hidden>→</span>
                    </span>
                    <Planet name={TAG_PLANET[a.tag].planet} shade="soft" className="w-12 pointer-fine:hidden" sizes="48px" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

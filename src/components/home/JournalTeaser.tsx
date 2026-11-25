"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { articles } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { starTrailsFrag } from "@/components/gl/sectionShaders";
import { Planet } from "@/components/space/Planet";
import { ArticleCover, TAG_PLANET, formatDate } from "@/components/journal/ArticleCard";

const POST: PostSettings = { threshold: 0.8, bloom: 0.35, streak: 0.05, aberration: 0.004, exposure: 1.0, grain: 0.03, vignette: 0.25 };

/**
 * "Ideas worth exploring" as an editorial index. Behind it, a calm long-exposure night sky of star
 * trails (one steady palette: it never retints). Beside the list, the hovered story's real magazine
 * cover, which crossfades from one issue to the next, so the hover shows something useful and
 * nothing ever floats over the titles.
 */
export function JournalTeaser() {
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const focus = useRef(0);

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  const uniforms = useCallback(() => {
    focus.current += ((hoverRef.current === null ? 0 : 1) - focus.current) * 0.04;
    return { uFocus: focus.current };
  }, []);

  const shown = hover ?? 0;

  return (
    <section className="relative isolate overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20" onPointerLeave={() => setHover(null)}>
      <div className="feather-y absolute inset-0 -z-20 opacity-70 [--feather:26%]" aria-hidden>
        <ShaderCanvas frag={starTrailsFrag} uniforms={uniforms} scale={0.75} maxDpr={1.75} post={POST} />
      </div>
      {/* the trails stay quiet behind the titles: a dark wash over the index column */}
      <div className="feather-y absolute inset-0 -z-10 bg-gradient-to-r from-space/75 via-space/40 to-transparent [--feather:26%]" aria-hidden />

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

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_23rem]">
          {/* the index */}
          <ol className="border-b border-line">
            {articles.map((a, i) => (
              <li key={a.slug} onPointerEnter={() => setHover(i)}>
                <Reveal delay={i * 120}>
                  <Link
                    href={`/journal/${a.slug}`}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    className={clsx(
                      "group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 border-t border-line py-8 transition-opacity duration-500 sm:gap-x-10 sm:py-10",
                      hover !== null && hover !== i && "opacity-60",
                    )}
                  >
                    <span className="pt-2 font-mono text-xs tracking-[0.18em] text-flare-soft sm:pt-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="bracket block text-dust">
                        [ {a.tag} ] {formatDate(a.date)} · {a.minutes} min
                      </span>
                      <span className="display mt-3 block text-[2.1rem] leading-[1.02] transition-transform duration-700 ease-cosmic group-hover:translate-x-2 sm:text-5xl xl:text-6xl">
                        {a.title}
                      </span>
                      <span className="mt-4 block max-w-xl text-sm leading-relaxed text-dust sm:text-base">{a.excerpt}</span>
                    </span>
                    <span className="flex flex-col items-end gap-4 pt-1">
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-line transition-[transform,background-color,border-color,color] duration-500 group-hover:-rotate-45 group-hover:border-flare group-hover:bg-flare group-hover:text-space">
                        <span aria-hidden className="text-lg font-semibold">→</span>
                      </span>
                      {/* no preview panel below lg: a small planet marks each story instead */}
                      <Planet name={TAG_PLANET[a.tag].planet} shade="soft" className="w-11 lg:hidden" sizes="44px" />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>

          {/* the hovered story's cover (the first one at rest) */}
          <div className="sticky top-28 hidden lg:block" aria-hidden>
            <div data-tilt className="relative aspect-[3/4] [transform-style:preserve-3d]">
              <div className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.18),transparent)] blur-2xl" />
              {articles.map((a, i) => (
                <div
                  key={a.slug}
                  className={clsx(
                    "absolute inset-0 transition-[opacity,transform] duration-700 ease-cosmic",
                    shown === i ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0",
                  )}
                >
                  <ArticleCover article={a} className="h-full rounded-[22px] border border-line shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]" />
                </div>
              ))}
            </div>
            <p className="bracket mt-5 text-dust">
              Issue {String(shown + 1).padStart(2, "0")} · {articles[shown].minutes} min read
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

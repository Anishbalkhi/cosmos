"use client";

import { useCallback } from "react";
import Link from "next/link";
import { articles } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { starTrailsFrag } from "@/components/gl/sectionShaders";
import { ArticleCover, formatDate } from "@/components/journal/ArticleCard";

const POST: PostSettings = { threshold: 0.8, bloom: 0.35, streak: 0.05, aberration: 0.004, exposure: 1.0, grain: 0.03, vignette: 0.25 };

/**
 * The journal as an editorial spread: one lead story with its cover, and the next two as text beside
 * it. Behind it, a calm long-exposure sky of star trails.
 */
export function JournalTeaser() {
  const uniforms = useCallback(() => ({ uFocus: 0 }), []);
  const [lead, ...rest] = articles;

  return (
    <section className="relative isolate overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20">
      <div className="feather-y absolute inset-0 -z-20 opacity-70 [--feather:26%]" aria-hidden>
        <ShaderCanvas frag={starTrailsFrag} uniforms={uniforms} scale={0.75} maxDpr={1.75} post={POST} />
      </div>
      {/* the trails stay quiet behind the titles: a dark wash over the index column */}
      <div className="feather-y absolute inset-0 -z-10 bg-gradient-to-r from-space/75 via-space/40 to-transparent [--feather:26%]" aria-hidden />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-5">Journal</p>
            <h2 className="display max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
              Notes on the plant, the law and dosing.
            </h2>
          </div>
          <ButtonLink href="/journal" variant="ghost" arrow className="shrink-0">
            Visit the journal
          </ButtonLink>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
          {/* the lead story, with its cover */}
          <Reveal>
            <Link href={`/journal/${lead.slug}`} className="group grid gap-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] sm:items-end">
              <ArticleCover article={lead} className="aspect-[3/4] rounded-[20px] border border-line transition-transform duration-700 ease-cosmic group-hover:-translate-y-1" />
              <span>
                <span className="block text-sm text-dust">
                  {lead.tag} · {formatDate(lead.date)} · {lead.minutes} min read
                </span>
                <span className="display mt-3 block text-3xl leading-[1.05] sm:text-4xl xl:text-5xl">{lead.title}</span>
                <span className="mt-4 block text-sm leading-relaxed text-dust sm:text-base">{lead.excerpt}</span>
                <span className="mt-5 inline-block text-sm text-star underline decoration-flare underline-offset-4 group-hover:text-flare-soft">Read the story</span>
              </span>
            </Link>
          </Reveal>
          {/* two more, as text */}
          <ul className="border-b border-line">
            {rest.map((a, i) => (
              <li key={a.slug}>
                <Reveal delay={(i + 1) * 120}>
                  <Link href={`/journal/${a.slug}`} className="group block border-t border-line py-7">
                    <span className="block text-sm text-dust">
                      {a.tag} · {formatDate(a.date)} · {a.minutes} min read
                    </span>
                    <span className="display mt-2 block text-2xl leading-[1.1] transition-colors group-hover:text-flare-soft sm:text-3xl">{a.title}</span>
                    <span className="mt-3 block text-sm leading-relaxed text-dust">{a.excerpt}</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

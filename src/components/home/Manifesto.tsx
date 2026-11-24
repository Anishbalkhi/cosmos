"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";
import { asteroidFieldFrag } from "@/components/gl/sectionShaders";

gsap.registerPlugin(ScrollTrigger);

const POST = { threshold: 0.8, bloom: 0.5, streak: 0.18, aberration: 0.015, exposure: 1.1, grain: 0.03, vignette: 0.25 };

const TEXT =
  "We started Cosmos to end the whispering. Cannabis wellness deserves daylight, design and rigour, not stigma. So every gummy is lab-tested, precisely dosed and clearly labelled — the care of a fine pharmacy, the taste of a maison.";

const HIGHLIGHT = new Set(["whispering.", "daylight,", "design", "rigour,"]);

/** Words light up one by one as the section scrolls past. */
export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const section = useRef<HTMLElement>(null);
  // section progress drives the asteroid parallax (near rocks slide furthest)
  const [uniforms] = useState(() => () => {
    const el = section.current;
    if (!el) return { uScroll: 0 };
    const r = el.getBoundingClientRect();
    return { uScroll: Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height))) };
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll("span").forEach((s) => (s.style.opacity = "1"));
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("span"),
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          // fully lit as soon as the paragraph's last line is on screen: wherever people stop, it reads
          scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 92%", scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    // Merged with the hero: it slides up under the last 75vh of the fall through the event horizon. Its top is
    // masked (clear for 22vh, solid by 62vh) so the asteroid field surfaces only once the fall has gone dark,
    // never as dark blobs over the bright disk. The text starts below the mask (pt-[64vh]) so it is never faded.
    <section
      ref={section}
      className="relative isolate z-10 -mt-[75vh] overflow-hidden bg-black pt-[64vh] pb-32 [mask-image:linear-gradient(to_bottom,transparent_22vh,#000_62vh)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_22vh,#000_62vh)] sm:pb-48"
    >
      {/* an ice-blue black hole through a drifting asteroid field (reference pin 018017) */}
      <div className="absolute inset-0 -z-10">
        <ShaderCanvas frag={asteroidFieldFrag} uniforms={uniforms} scale={0.6} post={POST} />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-black/20 to-black" />
      {/* scrim under the paragraph so the ring and rocks never cut into the text */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_55%_at_40%_62%,rgb(0_0_0/0.75),transparent_78%)]" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="bracket mb-10 text-flare-soft">[ Manifesto ]</p>
        <p ref={ref} className="display text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
          {TEXT.split(" ").map((w, i) => (
            <span key={i} className={HIGHLIGHT.has(w) ? "text-flare-soft italic" : undefined} style={{ opacity: 0.14 }}>
              {w}{" "}
            </span>
          ))}
        </p>
        {/* why the name: the founders' brief, in their words */}
        <div className="mt-16 grid gap-6 border-t border-line pt-10 sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-10">
          <p className="eyebrow">Why Cosmos</p>
          <p className="max-w-2xl text-lg leading-relaxed text-star/85">
            There is life beyond the noise of everyday society. When you focus on yourself and clear the junk from mind and body, Cosmos is here to help you
            build, enlighten and grow.
          </p>
          <Link href="/our-story" className="text-sm whitespace-nowrap text-star underline decoration-flare underline-offset-4 hover:text-flare-soft">
            Our story →
          </Link>
        </div>
      </div>
    </section>
  );
}

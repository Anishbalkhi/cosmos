"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { DoseClock } from "@/components/ui/DoseClock";

const STEPS = [
  { n: "01", title: "Choose your need", body: "Rest, balance or focus. Each formula pairs 5 mg of leaf extract with two ingredients for one job." },
  { n: "02", title: "Take one gummy", body: "Start with one. Effects build over 45 to 90 minutes, so give it a full two hours before taking more." },
  { n: "03", title: "Notice the shift", body: "Calm, not a high. Note how you feel: after a few days it becomes your own dosing guide." },
];

/**
 * "Start low. Go slow." as one plain clock: the first two hours after a single gummy, drawn as a line
 * that fills in once when it comes into view, with the three steps underneath. No pinning, no scene:
 * a short, calm section between two big ones. Vertical on phones.
 */
export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="how-title">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow mb-4">How to take it</p>
            <h2 id="how-title" className="display text-4xl sm:text-5xl">
              Start low. Go slow.
            </h2>
          </Reveal>
          <Link href="/science#dosing" className="text-sm text-star underline decoration-flare underline-offset-4 hover:text-flare-soft">
            Read the full dosing guide
          </Link>
        </div>

        <DoseClock className="mt-14 sm:mt-16" />

        <ol className="mt-14 grid gap-8 border-t border-line pt-10 sm:mt-12 md:grid-cols-3 md:gap-10">
          {STEPS.map((s, i) => (
            <li key={s.n}>
              <Reveal delay={i * 100}>
                <p className="font-mono text-xs tracking-[0.16em] text-flare-soft">{s.n}</p>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dust">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

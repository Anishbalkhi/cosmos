import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCta } from "@/components/home/ClosingCta";
import { LeafStar } from "@/components/brand/LeafStar";
import { EarthPhase } from "@/components/space/EarthPhase";
import { PREVIEW, Placeholder } from "@/components/ui/Placeholder";
import { UniverseStage } from "@/components/journey/UniverseStage";
import { NIGHT_SKY } from "@/lib/journey";

export const metadata: Metadata = { title: "Our Story", description: "Why we started Cosmos: to end the whispering around cannabis wellness." };

// what we believe, once: these were two lists ("What we believe" and "Four principles") that said the same
// things twice. No claims the client hasn't confirmed (doses, pharmacy standards, harvest timing).
const BELIEFS = [
  {
    title: "Out in the open",
    body: "Cannabis wellness shouldn’t be whispered about. We say what’s in every gummy, what it will and won’t do, and publish the lab report for every batch.",
  },
  { title: "Leaf, not flower", body: "We use the leaf alone: the part of the plant Ayurveda has used for centuries, and the part India’s law allows." },
  { title: "One job each", body: "Rest, balance and focus are separate formulas, so you take what you need, at the dose you need, and nothing else." },
  { title: "Made with care", body: "Tested by an independent lab and clearly labelled, in a pouch you’d be happy to leave out on the table." },
];

export default function StoryPage() {
  return (
    <>
      {/* one night sky behind the whole page (as on the home and Science pages): every section floats in it */}
      <UniverseStage sky={NIGHT_SKY} />
      <PageHeader
        blend
        visual="blackhole"
        eyebrow="Who we are"
        title={
          <>
            There is life beyond <span className="text-star/55">the everyday.</span>
          </>
        }
        intro="We named it Cosmos for that out-of-this-world feeling: knowing there is life beyond the noise. Focus on yourself, clear the junk from mind and body, and Cosmos is here to help you build, enlighten and grow."
      />

      {/* the founders' letter beside Earth turning from night to day as you read it */}
      <section className="relative py-16 sm:py-24">
        <Container className="grid items-center gap-10 sm:gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <EarthPhase className="mx-auto w-full max-w-[15rem] sm:max-w-[22rem]" />
          <Reveal>
            <p className="eyebrow text-star/60">A letter from the founders</p>
            <h2 className="display mt-5 text-4xl sm:text-5xl">Why we built this</h2>
            <div className="mt-8 max-w-[36rem] space-y-6 font-[family-name:var(--font-instrument)] text-[1.35rem] leading-[1.4] sm:text-[1.6rem]">
              {/* PLACEHOLDER: founders' letter from the client */}
              <p className="text-star/70">
                For years, the people we knew who found relief in cannabis talked about it in lowered voices, bought it from people they didn&rsquo;t trust, and
                never quite knew what they were taking.
              </p>
              <p className="text-star">
                We wanted the opposite: a product made in the open, under licence, and designed with the same care as anything else you&rsquo;d let into your
                home.
              </p>
            </div>
            <p className="mt-8 flex items-center gap-3 text-star/75">
              <LeafStar className="h-7 w-7" />
              <span className="font-[family-name:var(--font-instrument)] text-xl italic">
                <Placeholder note="founders' names" fallback="The Cosmos founders">
                  The Cosmos founders
                </Placeholder>
                , Bangalore
              </span>
            </p>
            {PREVIEW && <p className="mt-4 text-xs text-dust">Preview: placeholder letter, to be replaced with the founders&rsquo; own words and names.</p>}
          </Reveal>
        </Container>
      </section>

      {/* what we believe: four statements, once */}
      <section className="py-16 sm:py-24">
        <Container>
          <p className="eyebrow mb-5">What we believe</p>
          <h2 className="display max-w-2xl text-4xl text-balance sm:text-5xl">Four things we won&rsquo;t compromise on.</h2>
          <div className="mt-12 grid gap-x-16 gap-y-10 sm:grid-cols-2 sm:gap-y-14">
            {BELIEFS.map((b, i) => (
              <Reveal key={b.title} delay={(i % 2) * 120 + Math.floor(i / 2) * 80}>
                <h3 className="display text-3xl sm:text-4xl">{b.title}</h3>
                <p className="mt-3 max-w-lg text-base leading-relaxed text-star/75 sm:text-lg">{b.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ClosingCta title="Be among the first to try it. The first batch ships the week of 11 December." />
    </>
  );
}

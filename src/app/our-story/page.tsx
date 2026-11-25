import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Planet } from "@/components/space/Planet";
import { LeafStar } from "@/components/brand/LeafStar";

export const metadata: Metadata = { title: "Our Story", description: "Why we started Cosmos: to end the whispering around cannabis wellness." };

// three ideas, as plain statements (they were a zoom through three planets: decoration, not meaning)
const PILLARS = [
  { title: "Out in the open", body: "Cannabis wellness shouldn’t be whispered about. We publish what’s in every gummy and the lab report for every batch." },
  { title: "Made with care", body: "Each gummy is lab-tested, dosed to 5 mg and clearly labelled, with the standards you’d expect from a good pharmacy." },
  { title: "One job each", body: "Rest, balance and focus are separate formulas, so you take what you need, at the dose you need, and nothing else." },
];

// four principles as plain statements (they were cards with a planet each: decoration, not meaning)
const VALUES = [
  { title: "Honest information", body: "What’s in it, how much, and what it will and won’t do. No miracle claims." },
  { title: "Respect for the plant", body: "Leaf only, harvested before flowering, the way Ayurveda has used it for centuries." },
  { title: "Design as care", body: "A product you’re not embarrassed to leave on the bedside table." },
  { title: "Rigour", body: "Independent lab tests on every batch, published for anyone to read." },
];

export default function StoryPage() {
  return (
    <>
      <PageHeader
        visual="blackhole"
        eyebrow="Our story"
        title={
          <>
            There is life beyond <span className="text-flare-soft">the everyday.</span>
          </>
        }
        intro="We named the brand Cosmos for that out-of-this-world feeling: knowing there is life beyond the noise of everyday society. When you focus on yourself and clear the junk from mind and body, Cosmos is here to help you build, enlighten and grow."
      />

      {/* three ideas behind the brand */}
      <section className="border-y border-line py-20 sm:py-24">
        <Container>
          <p className="eyebrow">What we believe</p>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <h2 className="display text-3xl sm:text-4xl">{p.title}</h2>
                <p className="mt-4 leading-relaxed text-dust">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* the founders' note as a transmission from Earth */}
      <section className="relative overflow-hidden border-y border-line py-24 sm:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="relative mx-auto aspect-square w-full max-w-[24rem]" aria-hidden>
            {/* signal rings leaving the planet */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute inset-[18%] rounded-full border border-[rgb(var(--accent-rgb)/0.45)] animate-[signal_4.5s_ease-out_infinite]"
                style={{ animationDelay: `${i * 1.5}s` }}
              />
            ))}
            <Planet name="earth" shade="soft" glow="rgba(120,170,255,0.4)" className="absolute inset-[18%]" sizes="320px" />
          </div>
          <Reveal>
            <p className="eyebrow text-flare-soft">From the founders, Bangalore</p>
            <h2 className="display mt-5 text-4xl sm:text-5xl">Why we built this</h2>
            <div className="mt-8 space-y-6 font-[family-name:var(--font-instrument)] text-2xl leading-snug text-star/90 sm:text-[1.7rem]">
              {/* PLACEHOLDER: founders' letter from the client */}
              <p>
                For years, the people we knew who found relief in cannabis talked about it in lowered voices, bought it from people they didn&rsquo;t trust, and
                never quite knew what they were taking.
              </p>
              <p>
                We wanted the opposite: a product made in the open, under licence, tested batch by batch, and designed with the same care as anything else
                you&rsquo;d let into your home.
              </p>
            </div>
            <p className="mt-8 flex items-center gap-3 text-dust">
              <LeafStar className="h-6 w-6" />
              <span className="font-[family-name:var(--font-instrument)] text-xl italic">The Cosmos founders</span>
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <p className="eyebrow mb-5">What we stand for</p>
          <h2 className="display max-w-2xl text-4xl sm:text-5xl">Four principles, every batch.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dust">
            A culture of care and curiosity: respect for the plant, honest information and a more human way to explore cannabis.
          </p>
          <dl className="mt-12 grid border-t border-line sm:grid-cols-2 sm:gap-x-12">
            {VALUES.map((v) => (
              <div key={v.title} className="border-b border-line py-6">
                <dt className="text-lg font-semibold">{v.title}</dt>
                <dd className="mt-2 max-w-md leading-relaxed text-dust">{v.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <ClosingCta />
    </>
  );
}

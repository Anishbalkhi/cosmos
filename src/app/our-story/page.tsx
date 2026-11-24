import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCta } from "@/components/home/ClosingCta";
import { ZoomThrough, type ZoomStop } from "@/components/space/ZoomThrough";
import { Planet, type PlanetName } from "@/components/space/Planet";
import { LeafStar } from "@/components/brand/LeafStar";

export const metadata: Metadata = { title: "Our Story", description: "Why we started Cosmos: to end the whispering around cannabis wellness." };

const PILLARS: ZoomStop[] = [
  {
    planet: "earth",
    glow: "rgba(120,170,255,0.4)",
    title: "The Vision",
    body: "We built Cosmos to end the whispering. Cannabis wellness deserves daylight, design and rigour, not stigma.",
  },
  {
    planet: "jupiter",
    glow: "rgba(232,184,109,0.35)",
    title: "The Craft",
    body: "Every gummy is lab-tested, precisely dosed and clearly labelled. The care of a fine pharmacy, the taste of a maison.",
  },
  {
    planet: "sun",
    glow: "rgba(255,170,80,0.55)",
    title: "The Cure",
    body: "Rest, balance, focus, ease. One belief: the right dose at the right moment is a quiet kind of medicine.",
  },
];

// each principle gets a world (real NASA photographs): the Moon reflects light as it is, Earth is
// where the plant grows, Saturn's rings are the most considered design in the system, Mars is tested ground
const VALUES: { n: string; title: string; body: string; planet: PlanetName; glow: string }[] = [
  { n: "01", title: "Honest information", body: "What’s in it, how much, and what it will and won’t do. No miracle claims.", planet: "moon", glow: "rgba(246,220,174,0.25)" },
  { n: "02", title: "Respect for the plant", body: "Leaf only, harvested before flowering, the way Ayurveda has used it for centuries.", planet: "earth", glow: "rgba(120,170,255,0.35)" },
  { n: "03", title: "Design as care", body: "A product you’re not embarrassed to leave on the bedside table.", planet: "saturn", glow: "rgba(232,184,109,0.3)" },
  { n: "04", title: "Rigour", body: "Independent lab tests on every batch, published for anyone to read.", planet: "mars", glow: "rgba(255,130,90,0.3)" },
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

      {/* the three pillars as a flight through worlds (reference pin 880313058437018020) */}
      <ZoomThrough eyebrow="Three ideas, one cosmos" stops={PILLARS} />

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
            <p className="font-mono text-[11px] tracking-[0.18em] text-flare-soft uppercase">[ Transmission · Bangalore · from the founders ]</p>
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
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.n} delay={i * 100} className="h-full">
                <article
                  data-tilt
                  className="group grain relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-[28px] border border-line bg-space-2 p-7 transition-colors duration-500 hover:border-white/25"
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -top-[18%] -right-[28%] w-[95%] transition-transform duration-[1.4s] ease-cosmic group-hover:scale-105 group-hover:-rotate-6 ${v.planet === "saturn" ? "mix-blend-screen" : ""}`}
                  >
                    <Planet name={v.planet} shade="side" glow={v.glow} sizes="300px" />
                  </div>
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-space-2 via-space-2/70 to-transparent" />
                  <div className="relative">
                    <p className="font-mono text-xs tracking-[0.18em] text-flare">{v.n}</p>
                    <h3 className="display mt-3 text-3xl">{v.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-star/75">{v.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ClosingCta />
    </>
  );
}

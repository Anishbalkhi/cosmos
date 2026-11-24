import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ClosingCta } from "@/components/home/ClosingCta";
import { ZoomThrough, type ZoomStop } from "@/components/space/ZoomThrough";

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

const VALUES = [
  { n: "01", title: "Honest information", body: "What’s in it, how much, and what it will and won’t do. No miracle claims." },
  { n: "02", title: "Respect for the plant", body: "Leaf only, harvested before flowering, the way Ayurveda has used it for centuries." },
  { n: "03", title: "Design as care", body: "A product you’re not embarrassed to leave on the bedside table." },
  { n: "04", title: "Rigour", body: "Independent lab tests on every batch, published for anyone to read." },
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

      <section className="border-y border-line bg-space-2/50 py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow mb-5">A note from the founders</p>
            <h2 className="display text-4xl sm:text-5xl">Why we built this</h2>
          </div>
          <Reveal>
            <div className="space-y-6 text-lg leading-relaxed text-star/85">
              {/* PLACEHOLDER: founders' letter from the client */}
              <p>
                For years, the people we knew who found relief in cannabis talked about it in lowered voices, bought it from people they didn’t trust, and never quite
                knew what they were taking.
              </p>
              <p>
                We wanted the opposite: a product made in the open, under licence, tested batch by batch, and designed with the same care as anything else you’d let
                into your home.
              </p>
              <p className="text-dust">— The Cosmos founders, Bangalore</p>
            </div>
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
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.n} delay={(i % 2) * 120} className="border-t border-line pt-6">
                <p className="font-mono text-sm text-flare">{v.n}</p>
                <h3 className="mt-3 text-2xl font-bold">{v.title}</h3>
                <p className="mt-3 max-w-md text-dust">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ClosingCta />
    </>
  );
}

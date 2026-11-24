import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { LeafLegend, LeafScene } from "@/components/science/LeafScene";

export function ThePlant() {
  return (
    <section className="pt-20 pb-10 sm:pt-28 sm:pb-12">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow mb-5">The plant</p>
          <h2 data-split className="display text-4xl sm:text-5xl lg:text-6xl">
            We only use the <span className="text-leaf">leaf.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-dust sm:text-lg">
            India’s law draws a line through the cannabis plant. The flowering tops and resin are prohibited; the leaves are not. Every Cosmos gummy is made from
            Cannabis sativa leaf extract alone, under licence, and every batch is tested by an independent lab.
          </p>
          <LeafLegend className="mt-8 max-w-lg" />
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/science" arrow>
              The Science
            </ButtonLink>
            <ButtonLink href="/science#lab-reports" variant="ghost">
              See lab reports
            </ButtonLink>
          </div>
        </Reveal>
        <LeafScene className="mx-auto aspect-square w-full max-w-[640px]" />
      </Container>
    </section>
  );
}

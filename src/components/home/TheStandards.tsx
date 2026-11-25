import type { ComponentType, SVGProps } from "react";
import clsx from "clsx";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { DrawOn } from "@/components/ui/DrawOn";
import { LeafScene } from "@/components/science/LeafScene";
import { IconBox, IconDrop, IconFlask, IconNoFlower, IconPin, IconSeal, IconSprout, IconTag } from "@/components/ui/icons";

type Standard = { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; note: string };

// what is in the gummy on the left, how it reaches you on the right
const LEFT: Standard[] = [
  { icon: IconNoFlower, label: "No flower, no resin", note: "Leaf only, in every batch" },
  { icon: IconDrop, label: "Precisely dosed", note: "5 mg in every gummy" },
  { icon: IconSprout, label: "Vegan", note: "Fruit pectin, no gelatin" },
  { icon: IconFlask, label: "Lab-tested", note: "Every batch, independent lab" },
];
const RIGHT: Standard[] = [
  { icon: IconSeal, label: "Made under licence", note: "Licence no. published at launch" },
  { icon: IconTag, label: "Clearly labelled", note: "What, how much, and why" },
  { icon: IconBox, label: "Discreet delivery", note: "Plain outer box" },
  { icon: IconPin, label: "Made in India", note: "Bangalore" },
];

function Item({ s, i, side }: { s: Standard; i: number; side: "left" | "right" }) {
  const Icon = s.icon;
  return (
    <li
      style={{ "--i": i } as React.CSSProperties}
      className={clsx("flex items-center gap-4", side === "left" && "lg:flex-row-reverse lg:text-right")}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-black/60 text-flare-soft shadow-[0_0_24px_-6px_rgb(var(--accent-rgb)/0.55)]">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-mono text-[11px] font-medium tracking-[0.16em] text-star uppercase">{s.label}</span>
        <span className="mt-0.5 block text-xs text-dust">{s.note}</span>
      </span>
    </li>
  );
}

/**
 * The plant and the standards in one section (the old floating badge ticker and the leaf section,
 * merged): the law and the leaf as the headline, the leaf itself in the centre, and the eight
 * standards gathered round it, what goes in on one side and how it reaches you on the other.
 */
export function TheStandards() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="standards-title">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">The plant · our standards</p>
          <h2 id="standards-title" data-split className="display text-4xl sm:text-5xl lg:text-6xl">
            We only use the <span className="text-leaf">leaf.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-dust sm:text-lg">
            India’s law draws a line through the cannabis plant: the flowering tops and resin are prohibited, the leaves are not. Every Cosmos gummy is made
            from Cannabis sativa leaf extract alone, under licence, and tested by an independent lab.
          </p>
        </Reveal>

        <DrawOn className="mt-12 grid items-center gap-x-10 gap-y-10 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
          <ul className="order-2 grid gap-6 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:gap-9">
            {LEFT.map((s, i) => (
              <Item key={s.label} s={s} i={i} side="left" />
            ))}
          </ul>
          <LeafScene className="order-1 mx-auto aspect-square w-full max-w-[520px] lg:order-2" />
          <ul className="order-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-9">
            {RIGHT.map((s, i) => (
              <Item key={s.label} s={s} i={i + 4} side="right" />
            ))}
          </ul>
        </DrawOn>

        <div className="mt-12 flex flex-wrap justify-center gap-3 sm:mt-14">
          <ButtonLink href="/science" arrow>
            The Science
          </ButtonLink>
          <ButtonLink href="/science#lab-reports" variant="ghost">
            See lab reports
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

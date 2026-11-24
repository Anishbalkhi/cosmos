import { LeafStar } from "@/components/brand/LeafStar";

const ITEMS = ["Lab-tested every batch", "Sativa leaf only", "Made under licence", "Precisely dosed", "Vegan", "No flower, no resin", "Clearly labelled", "Made in India"];

export function ProofMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="Our standards" className="overflow-hidden border-y border-line py-7">
      <ul className="flex w-max animate-marquee items-center gap-10">
        {row.map((t, i) => (
          <li key={i} className="flex items-center gap-10 text-2xl font-semibold whitespace-nowrap text-star/80 sm:text-3xl" aria-hidden={i >= ITEMS.length}>
            {t}
            <LeafStar className="h-6 w-6" />
          </li>
        ))}
      </ul>
    </section>
  );
}

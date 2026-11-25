import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { LeafStar } from "@/components/brand/LeafStar";

type Row = { label: string; note: string };

// what goes into the gummy, and how it reaches you
const IN: Row[] = [
  { label: "Leaf only", note: "No flower, no resin, in any batch" },
  { label: "5 mg per gummy", note: "Of Cannabis sativa leaf extract" },
  { label: "Vegan", note: "Fruit pectin instead of gelatin" },
  { label: "Lab-tested", note: "Every batch, by an independent lab" },
];
const OUT: Row[] = [
  { label: "Made under licence", note: "Licence number published at launch" },
  { label: "Clearly labelled", note: "What’s in it, how much, and why" },
  { label: "Discreet delivery", note: "In a plain outer box" },
  { label: "Made in India", note: "In Bangalore" },
];

function Table({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] tracking-[0.16em] text-space/55 uppercase">{title}</h3>
      <dl className="mt-4 border-t border-space/15">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 border-b border-space/15 py-4">
            <dt className="font-semibold text-space">{r.label}</dt>
            <dd className="text-space/70">{r.note}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * The plant and its standards as the page's one light section: warm paper, dark text, a plain table of
 * facts. A deliberate break from the dark space scenes either side, so it reads as a statement of
 * fact rather than another scene.
 */
export function TheStandards() {
  return (
    <section className="px-3 py-10 sm:px-5 sm:py-14" aria-labelledby="standards-title">
      <div className="rounded-[28px] bg-star text-space sm:rounded-[36px]">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:py-24">
          <Reveal>
            <LeafStar className="h-9 w-9" color="#4f7a1f" />
            <h2 id="standards-title" className="display mt-8 text-4xl sm:text-5xl lg:text-6xl">
              We only use the leaf.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-space/75 sm:text-lg">
              India’s law draws a line through the cannabis plant: the flowers and resin are prohibited, the leaves are not. Every Cosmos gummy is made from
              sativa leaf extract alone, under licence, and tested by an independent lab.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/science"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-space px-6 text-sm font-semibold text-star transition-colors hover:bg-space-3"
              >
                The Science <span aria-hidden>→</span>
              </Link>
              <Link
                href="/science#lab-reports"
                className="inline-flex h-12 items-center rounded-full border border-space/25 px-6 text-sm font-semibold text-space transition-colors hover:border-space/50 hover:bg-space/5"
              >
                See lab reports
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 xl:gap-12">
            <Table title="In the gummy" rows={IN} />
            <Table title="How it reaches you" rows={OUT} />
          </div>
        </Container>
      </div>
    </section>
  );
}

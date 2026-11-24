import { CoaLink } from "@/components/product/CoaLink";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, inr, needOf, products, site } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { GlyphBadge } from "@/components/product/Pouch";
import { PouchScene } from "@/components/product/PouchScene";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";
import { binaryFrag, whirlpoolFrag } from "@/components/gl/sectionShaders";
import { Planet } from "@/components/space/Planet";
import { BuyBox } from "@/components/product/AddToCart";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { Accordion } from "@/components/ui/Accordion";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) return {};
  return { title: p.name, description: `${p.tagline} ${p.count} cannabis leaf gummies, ${p.mgPerGummy} mg each. Lab-tested.` };
}

export default function ProductPage(props: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductPageContent params={props.params} />
    </Suspense>
  );
}

async function ProductPageContent({ params }: { params: PageProps<"/products/[slug]">["params"] }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const need = needOf(p.need);
  const others = products.filter((o) => o.slug !== p.slug);
  const perGummy = Math.round(p.price / p.count);

  return (
    <>
      {/* main block */}
      <section className="relative overflow-hidden">
        <Container className="grid gap-10 py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-16">
          <div className="relative aspect-square overflow-hidden rounded-[32px] border border-line bg-black">
            {/* the pouch turns all the way round (front and back label); drag to spin it */}
            <PouchScene slug={p.slug} turntable />
            <span className="pointer-events-none absolute top-5 left-5 rounded-full border border-white/20 bg-black/30 px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase backdrop-blur">
              For {need.name}
            </span>
            <span className="pointer-events-none absolute right-5 bottom-5 font-mono text-[11px] tracking-[0.16em] text-star/60 uppercase">Drag to turn</span>
          </div>

          <div className="flex flex-col justify-center">
            <nav aria-label="Breadcrumb" className="font-mono text-[11px] tracking-[0.14em] text-dust uppercase">
              <Link href="/shop" className="hover:text-star">
                Shop
              </Link>{" "}
              / <span className="text-star">{p.short}</span>
            </nav>
            <h1 className="display mt-5 text-5xl sm:text-6xl">{p.name}</h1>
            <p className="mt-4 text-lg text-dust">{p.tagline}</p>

            <div className="mt-8 flex items-baseline gap-4">
              <p className="text-3xl font-bold">{inr(p.price)}</p>
              <p className="text-sm text-dust">
                {p.count} gummies · {p.mgPerGummy} mg each · {inr(perGummy)} per gummy
              </p>
            </div>
            <p className="mt-1 text-xs text-dust">Inclusive of GST</p>

            <div className="mt-8">
              <BuyBox slug={p.slug} price={inr(p.price)} />
            </div>

            <ul className="mt-10 grid gap-3 border-t border-line pt-8 text-sm text-star/85 sm:grid-cols-2">
              {[
                `Free shipping over ${inr(site.freeShippingOver)}`,
                "Discreet, plain outer box",
                `Lab report for batch ${p.batch}`,
                "Leaf extract only, made under licence",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.color }} /> {t}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* story of the name */}
      <section className="border-y border-line py-24 sm:py-32" style={{ background: `linear-gradient(180deg, ${p.color}14, transparent)` }}>
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-5" style={{ color: p.color }}>
              The story of the name
            </p>
            <h2 className="display text-5xl sm:text-6xl">{p.name}</h2>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-star/85">{p.story}</p>
          </Reveal>
          <Reveal delay={150} className="mx-auto w-full max-w-sm">
            <div className="relative aspect-square [contain:layout]">
              <div className="absolute inset-3 animate-spin-slow rounded-full border border-dashed border-white/15">
                <span className="absolute top-1/2 -left-2 h-4 w-4 rounded-full" style={{ background: p.color, boxShadow: `0 0 24px ${p.color}` }} />
              </div>
              <div className="absolute inset-[12%] rounded-full" style={{ boxShadow: `0 0 120px ${p.color}55` }}>
                {p.glyph === "moon" ? (
                  <Planet name="moon" shade="soft" glow="rgba(246,220,174,0.3)" className="h-full w-full" />
                ) : p.glyph === "elevator" ? (
                  // balance: two black holes held in a gold embrace (reference pin 880313058437018041)
                  <div className="h-full w-full overflow-hidden rounded-full">
                    <ShaderCanvas frag={binaryFrag} scale={0.8} maxDpr={2} />
                  </div>
                ) : p.glyph === "blackhole" ? (
                  // rest: a silky whirlpool slowly drawing into a dark eye (reference pin 1098456165362003502)
                  <div className="h-full w-full overflow-hidden rounded-full">
                    <ShaderCanvas frag={whirlpoolFrag} scale={0.8} maxDpr={2} />
                  </div>
                ) : (
                  <GlyphBadge glyph={p.glyph} className="h-full w-full" />
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* inside + how to take */}
      <section className="py-24 sm:py-32">
        <Container className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-5">What’s inside</p>
            <h2 className="display text-4xl">Per gummy</h2>
            <table className="mt-8 w-full text-left text-sm">
              <tbody className="divide-y divide-line border-y border-line">
                {p.ingredients.map((i) => (
                  <tr key={i.name}>
                    <th scope="row" className="py-4 pr-4 font-normal text-star/90">
                      {i.name}
                    </th>
                    <td className="py-4 text-right font-mono text-dust">{i.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-dust">Vegan. No artificial colours. Contains no flower or resin.</p>
          </div>
          <div>
            <p className="eyebrow mb-5">How to take it</p>
            <h2 className="display text-4xl">Start low, go slow</h2>
            <ol className="mt-8 space-y-5">
              {p.howTo.map((h, i) => (
                <li key={i} className="flex gap-5 text-star/85">
                  <span className="font-mono text-sm text-flare">{String(i + 1).padStart(2, "0")}</span>
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* lab report */}
      <section className="pb-24">
        <Container>
          <div className="flex flex-col gap-6 rounded-[28px] border border-line bg-space-2 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="eyebrow mb-3">Lab report</p>
              <p className="text-2xl font-bold">Batch {p.batch}</p>
              <p className="mt-2 text-sm text-dust">Tested by an independent NABL-accredited lab for potency, heavy metals and microbes.</p>
            </div>
            <CoaLink url={p.coaUrl} label="Download certificate (PDF)" className="h-12 px-6" />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="pb-24 sm:pb-32">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow mb-5">Questions</p>
            <h2 className="display text-4xl">About {p.short}</h2>
            <Link href="/faq" className="mt-6 inline-block text-sm text-dust underline decoration-flare underline-offset-4 hover:text-star">
              All FAQs
            </Link>
          </div>
          <Accordion items={p.faqs} />
        </Container>
      </section>

      {/* others */}
      <section className="border-t border-line py-24 pb-36 md:pb-24">
        <Container>
          <h2 className="display text-4xl">Explore the rest of the range</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {others.map((o, i) => (
              <ProductCard key={o.slug} product={o} index={i} />
            ))}
          </div>
        </Container>
      </section>

      <StickyBuyBar slug={p.slug} name={p.name} price={inr(p.price)} />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, inr, needOf, products, site, tone } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { GlyphBadge } from "@/components/product/Pouch";
import { PouchScene } from "@/components/product/PouchScene";
import { IngredientOrbit } from "@/components/product/IngredientOrbit";
import { DoseTimeline } from "@/components/product/DoseTimeline";
import { LabCertificate } from "@/components/product/LabCertificate";
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
            <span className="pointer-events-none absolute right-5 bottom-5 font-mono text-[11px] tracking-[0.16em] text-dust uppercase">Drag to turn</span>
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
      <section className="py-24 sm:py-32" style={{ background: `linear-gradient(180deg, transparent, ${tone(p.color)}10 30%, ${tone(p.color)}10 70%, transparent)` }}>
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-5" style={{ color: tone(p.color) }}>
              The story of the name
            </p>
            <h2 className="display text-5xl sm:text-6xl">{p.name}</h2>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-star/85">{p.story}</p>
          </Reveal>
          <Reveal delay={150} className="mx-auto w-full max-w-sm">
            <div className="relative aspect-square [contain:layout]">
              <div className="absolute inset-3 rounded-full border border-dashed border-white/15">
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

      {/* what's inside: the gummy in 3D, its actives on orbit rings */}
      <section className="py-24 sm:py-32">
        <Container>
          <p className="eyebrow mb-5">What&rsquo;s inside</p>
          <h2 className="display max-w-2xl text-4xl sm:text-5xl">Per gummy, in orbit.</h2>
          <div className="mt-14">
            <IngredientOrbit slug={p.slug} />
          </div>
        </Container>
      </section>

      {/* how to take it: the dose clock */}
      <section className="border-t border-line py-24 sm:py-32">
        <Container>
          <p className="eyebrow mb-5">How to take it</p>
          <h2 className="display max-w-2xl text-4xl sm:text-5xl">
            Start low, go slow.
          </h2>
          <DoseTimeline color={p.color} notes={p.howTo} />
        </Container>
      </section>

      {/* lab report */}
      <section className="pb-24">
        <Container>
          <LabCertificate batch={p.batch} coaUrl={p.coaUrl} color={p.color} />
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

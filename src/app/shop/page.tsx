import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import clsx from "clsx";
import { needs, products, tone, type NeedId } from "@/lib/data";
import { ringSkimFrag } from "@/components/gl/sceneShaders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { ProductCard } from "@/components/product/ProductCard";
import { UniverseStage } from "@/components/journey/UniverseStage";
import { NIGHT_SKY } from "@/lib/journey";

export const metadata: Metadata = {
  title: "Shop",
  description: "Cosmos cannabis leaf gummies for rest, balance and focus.",
};

// when to take each one (the same guidance as the dosing guide on /science)
const WHEN: Record<NeedId, string> = {
  rest: "60 to 90 minutes before bed",
  balance: "On a calm day, up to twice a day",
  focus: "An hour before work",
  ease: "",
};

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <>
      {/* one night sky behind the whole page (as on the home, Science and Our Story pages) */}
      <UniverseStage sky={NIGHT_SKY} />
      <PageHeader
        blend
        scene={ringSkimFrag}
        eyebrow="Shop"
        title="Find your formula."
        intro="One gummy for each need: rest, balance or focus. Leaf extract only, and every batch tested by an independent lab."
      />
      <Suspense fallback={<ShopBody />}>
        <FilteredShop searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

/** Reads ?need= at request time; the rest of the page stays static. */
async function FilteredShop({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const { need } = (await searchParams) as { need?: string };
  const active = needs.find((n) => n.id === need)?.id as NeedId | undefined;
  return <ShopBody active={active} />;
}

function ShopBody({ active }: { active?: NeedId }) {
  const list = active ? products.filter((p) => p.need === active) : products;
  const activeNeed = needs.find((n) => n.id === active);
  return (
    <Container className="pt-2 pb-20 sm:pb-28">
      {/* filters: one quiet row (scrolls sideways on a phone rather than wrapping) */}
      <nav aria-label="Filter by need">
        <p className="eyebrow mb-3 text-star/60">Filter by need</p>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip href="/shop" active={!active}>
            All three
          </FilterChip>
          {needs.map((n) => (
            <FilterChip key={n.id} href={`/shop?need=${n.id}`} active={active === n.id} disabled={!n.product} hint={n.line}>
              {n.name}
              {!n.product && <span className="ml-1.5 text-star/50">· coming soon</span>}
            </FilterChip>
          ))}
        </div>
        <p className="mt-4 min-h-5 text-sm text-dust">{activeNeed ? activeNeed.line : "Each one is made for a single need."}</p>
      </nav>

      {/* a single result sits centred at card width, not alone in the first of three columns */}
      <div className={clsx("mt-8 grid gap-5", list.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "mx-auto max-w-md")}>
        {list.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>

      {/* the trust line, right under the products */}
      <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-star/70">
        <span>Leaf extract only, no flower or resin</span>
        <span aria-hidden className="text-star/30">·</span>
        <span>Every batch tested by an independent lab</span>
        <span aria-hidden className="text-star/30">·</span>
        <span>Ships the week of 11 December</span>
      </p>

      {/* the three side by side: what a shop page most needs and the cards can't say */}
      <section className="mt-24 sm:mt-32" aria-labelledby="compare-title">
        <p className="eyebrow mb-5">Compare</p>
        <h2 id="compare-title" className="display text-4xl text-balance sm:text-5xl">
          Which one is for you?
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
          {products.map((p) => {
            const need = needs.find((n) => n.id === p.need)!;
            const actives = p.ingredients.filter((g) => g.amount !== "—" && !g.name.startsWith("Cannabis"));
            return (
              <div key={p.slug} className="border-t pt-6" style={{ borderColor: `${tone(p.color)}55` }}>
                <p className="font-mono text-xs tracking-[0.14em] uppercase" style={{ color: tone(p.color) }}>
                  For {need.name.toLowerCase()}
                </p>
                <h3 className="display mt-2 text-3xl">
                  <Link href={`/products/${p.slug}`} className="hover:text-flare-soft">
                    {p.short}
                  </Link>
                </h3>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div>
                    <dt className="text-dust">When</dt>
                    <dd className="mt-0.5 text-star/90">{WHEN[p.need]}</dd>
                  </div>
                  <div>
                    <dt className="text-dust">Felt in</dt>
                    <dd className="mt-0.5 text-star/90">45 to 90 minutes</dd>
                  </div>
                  <div>
                    <dt className="text-dust">With</dt>
                    <dd className="mt-0.5 text-star/90">{actives.map((g) => g.name.replace(/\s+((root|leaf|flower|mushroom)\s+)?extract$/i, "")).join(" and ")}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </section>

      {/* help: one line of plain links (it was a heavy panel for one sentence) */}
      <p className="mt-20 max-w-2xl text-lg leading-relaxed text-star/80">
        New to this? Start with the{" "}
        <Link href="/science#dosing" className="text-star underline decoration-flare underline-offset-4 hover:text-flare-soft">
          dosing guide
        </Link>
        , read the{" "}
        <Link href="/science#lab-reports" className="text-star underline decoration-flare underline-offset-4 hover:text-flare-soft">
          lab reports
        </Link>
        , or{" "}
        <Link href="/contact" className="text-star underline decoration-flare underline-offset-4 hover:text-flare-soft">
          ask us anything
        </Link>
        .
      </p>
    </Container>
  );
}

function FilterChip({ href, active, disabled, hint, children }: { href: string; active: boolean; disabled?: boolean; hint?: string; children: React.ReactNode }) {
  const base = "shrink-0 rounded-full border px-5 py-2.5 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flare";
  if (disabled)
    return (
      <span className={clsx(base, "border-line text-star/45")} title={hint}>
        {children}
      </span>
    );
  return (
    <Link
      href={href}
      scroll={false}
      title={hint}
      aria-current={active ? "page" : undefined}
      // the active chip is an outline with a light fill, not a solid gold button (gold is for actions)
      className={clsx(base, active ? "border-star/60 bg-white/10 font-semibold text-star" : "border-line text-star/80 hover:border-star/40 hover:text-star")}
    >
      {children}
    </Link>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import clsx from "clsx";
import { needs, products, type NeedId } from "@/lib/data";
import { ringSkimFrag } from "@/components/gl/sceneShaders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "Shop",
  description: "Cosmos cannabis leaf gummies for rest, balance and focus.",
};

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <>
      <PageHeader scene={ringSkimFrag} eyebrow="Shop the Cure" title="Find your formula." intro="Three gummies, each made for one need. Lab-tested, leaf only, 5 mg in every piece." />
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
  return (
    <>
      <Container className="py-14 sm:py-20">
        <nav aria-label="Filter by need" className="flex flex-wrap gap-2">
          <FilterChip href="/shop" active={!active}>
            All
          </FilterChip>
          {needs.map((n) => (
            <FilterChip key={n.id} href={`/shop?need=${n.id}`} active={active === n.id} disabled={!n.product}>
              {n.name}
              {!n.product && <span className="ml-1 text-[11px] opacity-70">soon</span>}
            </FilterChip>
          ))}
        </nav>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[28px] border border-line bg-space-2 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-2xl font-bold">Not sure where to start?</p>
            <p className="mt-2 text-sm text-dust">Read the dosing guide, or ask us anything.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/science#dosing" className="rounded-full border border-line px-5 py-3 text-sm hover:border-star/40">
              Dosing guide
            </Link>
            <Link href="/faq" className="rounded-full border border-line px-5 py-3 text-sm hover:border-star/40">
              FAQ
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}

function FilterChip({ href, active, disabled, children }: { href: string; active: boolean; disabled?: boolean; children: React.ReactNode }) {
  if (disabled)
    return <span className="rounded-full border border-line px-5 py-2.5 text-sm text-dust/50">{children}</span>;
  return (
    <Link
      href={href}
      scroll={false}
      className={clsx(
        "rounded-full border px-5 py-2.5 text-sm transition-colors",
        active ? "border-flare bg-flare text-space" : "border-line text-star hover:border-star/40",
      )}
    >
      {children}
    </Link>
  );
}

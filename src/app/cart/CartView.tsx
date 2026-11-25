"use client";

import Link from "next/link";
import { useCart, cartTotals } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { inr, needOf, tone } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { QtyStepper } from "@/components/product/QtyStepper";
import { ButtonLink } from "@/components/ui/Button";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { EmptyOrbit } from "@/components/checkout/EmptyOrbit";
import { PouchThumb, ShippingProgress, TrustRow } from "@/components/checkout/CommerceBits";

export function CartView() {
  const mounted = useMounted();
  const { lines, setQty, remove } = useCart();
  const t = cartTotals(mounted ? lines : []);

  if (!mounted) return <Container className="min-h-[60vh] py-14 sm:py-20">{null}</Container>;

  if (t.items.length === 0) {
    return (
      <Container className="py-16 sm:py-24">
        <EmptyOrbit title="Your cart is empty." />
      </Container>
    );
  }

  return (
    <Container className="py-14 sm:py-20">
      <p className="eyebrow mb-4">Your cart</p>
      <h1 className="display text-5xl sm:text-6xl">
        {t.count} {t.count === 1 ? "item" : "items"} <em className="text-flare-soft">in orbit</em>
      </h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
        <ul className="space-y-4">
          {t.items.map((l) => (
            <li
              key={l.slug}
              className="relative flex gap-5 overflow-hidden rounded-[24px] border border-line bg-space-2/70 p-4 sm:gap-7 sm:p-5"
            >
              {/* the formula's colour along the edge */}
              <span aria-hidden className="absolute inset-y-6 left-0 w-[3px] rounded-full" style={{ background: l.product.color, boxShadow: `0 0 16px ${l.product.color}` }} />
              <Link href={`/products/${l.slug}`} className="w-24 shrink-0 sm:w-32">
                <PouchThumb product={l.product} id={`cartpage-${l.slug}`} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: tone(l.product.color) }}>
                      For {needOf(l.product.need).name}
                    </p>
                    <Link href={`/products/${l.slug}`} className="display mt-1 block text-2xl hover:text-flare-soft sm:text-3xl">
                      {l.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-dust tabular-nums">
                      {l.product.count} gummies · {l.product.mgPerGummy} mg · {inr(l.product.price)} each
                    </p>
                  </div>
                  <p className="text-lg font-semibold tabular-nums">{inr(l.product.price * l.qty)}</p>
                </div>
                <div className="mt-auto flex items-center gap-6 pt-4">
                  <QtyStepper value={l.qty} onChange={(q) => setQty(l.slug, q)} />
                  <button onClick={() => remove(l.slug)} className="text-sm text-dust underline-offset-4 hover:text-star hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="grain relative h-fit overflow-hidden rounded-[28px] border border-line bg-space-2 p-7 lg:sticky lg:top-28">
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/0.16),transparent_70%)]" />
          <p className="relative mb-5 font-mono text-[11px] tracking-[0.18em] text-dust uppercase">Order summary</p>
          <div className="relative">
            <ShippingProgress subtotal={t.subtotal} />
            <div className="mt-6">
              <OrderSummary totals={t} />
            </div>
            <ButtonLink href="/checkout" className="mt-6 w-full" arrow>
              Checkout
            </ButtonLink>
            <p className="mt-3 text-center text-xs text-dust">UPI · Cards · Netbanking · Wallets</p>
            <TrustRow className="mt-6" />
          </div>
        </aside>
      </div>
    </Container>
  );
}

"use client";

import Link from "next/link";
import { useCart, cartTotals } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { inr, needOf, site } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { Pouch } from "@/components/product/Pouch";
import { QtyStepper } from "@/components/product/QtyStepper";
import { ButtonLink } from "@/components/ui/Button";
import { OrderSummary } from "@/components/checkout/OrderSummary";

export function CartView() {
  const mounted = useMounted();
  const { lines, setQty, remove } = useCart();
  const t = cartTotals(mounted ? lines : []);

  return (
    <Container className="py-14 sm:py-20">
      <p className="eyebrow mb-4">Your cart</p>
      <h1 className="display text-5xl sm:text-6xl">
        {t.count ? (
          <>
            {t.count} {t.count === 1 ? "item" : "items"} in orbit
          </>
        ) : (
          "Your cart is empty"
        )}
      </h1>

      {!mounted ? null : t.items.length === 0 ? (
        <div className="mt-12">
          <p className="text-dust">Find the formula for your need.</p>
          <ButtonLink href="/shop" className="mt-8" arrow>
            Shop the Cure
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-line border-y border-line">
            {t.items.map((l) => (
              <li key={l.slug} className="flex gap-6 py-6">
                <Link href={`/products/${l.slug}`} className="w-24 shrink-0 sm:w-28">
                  <Pouch id={`cartpage-${l.slug}`} name={l.product.short} color={l.product.color} glyph={l.product.glyph} />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: l.product.color }}>
                        For {needOf(l.product.need).name}
                      </p>
                      <Link href={`/products/${l.slug}`} className="mt-1 block text-xl font-bold hover:text-flare-soft">
                        {l.product.name}
                      </Link>
                      <p className="mt-1 text-sm text-dust">
                        {l.product.count} gummies · {l.product.mgPerGummy} mg · {inr(l.product.price)} each
                      </p>
                    </div>
                    <p className="text-lg font-semibold">{inr(l.product.price * l.qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-6 pt-4">
                    <QtyStepper value={l.qty} onChange={(q) => setQty(l.slug, q)} />
                    <button onClick={() => remove(l.slug)} className="text-sm text-dust hover:text-star">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-[28px] border border-line bg-space-2 p-7 lg:sticky lg:top-28">
            <OrderSummary totals={t} />
            {t.toFree > 0 && (
              <p className="mt-4 text-xs text-dust">
                Add {inr(t.toFree)} more for free shipping (over {inr(site.freeShippingOver)}).
              </p>
            )}
            <ButtonLink href="/checkout" className="mt-6 w-full" arrow>
              Checkout
            </ButtonLink>
            <p className="mt-4 text-center text-xs text-dust">UPI · Cards · Netbanking · Wallets</p>
          </aside>
        </div>
      )}
    </Container>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import { useCart, cartTotals } from "@/lib/cart";
import { inr, site } from "@/lib/data";
import { Pouch } from "@/components/product/Pouch";
import { ButtonLink } from "@/components/ui/Button";
import { QtyStepper } from "@/components/product/QtyStepper";
import { useMounted } from "@/lib/useMounted";
import { useScrollLock } from "@/lib/useScrollLock";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const mounted = useMounted();
  const t = cartTotals(mounted ? lines : []);

  const closeBtn = useRef<HTMLButtonElement>(null);
  useScrollLock(open);

  // while open: Escape closes, focus moves in and returns to whatever opened it
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, setOpen]);

  return (
    // `inert` when closed: the off-screen drawer can't be tabbed into or read out
    // visible at once on open (so focus can move in); on close visibility flips after the slide-out
    <div
      className={clsx("fixed inset-0 z-[60]", open ? "pointer-events-auto visible" : "pointer-events-none invisible transition-[visibility] duration-500")}
      inert={!open}
    >
      <div
        className={clsx("absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
        onClick={() => setOpen(false)}
      />
      <aside
        className={clsx(
          "absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-line bg-space-2 transition-transform duration-500 ease-cosmic",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="text-lg font-semibold">
            Your cart <span className="text-dust">({t.count})</span>
          </p>
          <button ref={closeBtn} onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:border-star/40" aria-label="Close cart">
            ✕
          </button>
        </div>

        {t.items.length > 0 && (
          <div className="border-b border-line px-6 py-4">
            <p className="text-xs text-dust">
              {t.toFree > 0 ? (
                <>
                  Add <span className="text-star">{inr(t.toFree)}</span> for free shipping
                </>
              ) : (
                <span className="text-leaf">Free shipping unlocked</span>
              )}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-flare transition-all duration-700" style={{ width: `${Math.min(100, (t.subtotal / site.freeShippingOver) * 100)}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
          {t.items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div onClick={() => setOpen(false)}>
                <p className="display text-3xl">Nothing in orbit yet.</p>
                <p className="mt-3 text-sm text-dust">Find the formula for your need.</p>
                <ButtonLink href="/shop" className="mt-8" arrow>
                  Shop the Cure
                </ButtonLink>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {t.items.map((l) => (
                <li key={l.slug} className="flex gap-4 py-5">
                  <Link href={`/products/${l.slug}`} onClick={() => setOpen(false)} className="w-20 shrink-0">
                    <Pouch id={`cart-${l.slug}`} name={l.product.short} color={l.product.color} glyph={l.product.glyph} />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link href={`/products/${l.slug}`} onClick={() => setOpen(false)} className="font-semibold leading-snug hover:text-flare-soft">
                        {l.product.name}
                      </Link>
                      <p className="shrink-0 text-sm">{inr(l.product.price * l.qty)}</p>
                    </div>
                    <p className="mt-1 text-xs text-dust">
                      {l.product.count} gummies · {l.product.mgPerGummy} mg
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper value={l.qty} onChange={(q) => setQty(l.slug, q)} size="sm" />
                      <button onClick={() => remove(l.slug)} className="text-xs text-dust underline-offset-4 hover:text-star hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {t.items.length > 0 && (
          <div className="border-t border-line px-6 py-6">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-dust">Subtotal</dt>
                <dd>{inr(t.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dust">Shipping</dt>
                <dd>{t.shipping ? inr(t.shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{inr(t.total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-dust">Prices include GST.</p>
            <div className="mt-5 grid gap-2" onClick={() => setOpen(false)}>
              <ButtonLink href="/checkout" className="w-full" arrow>
                Checkout
              </ButtonLink>
              <ButtonLink href="/cart" variant="ghost" className="w-full">
                View cart
              </ButtonLink>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

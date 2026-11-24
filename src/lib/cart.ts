"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct, site } from "./data";

export type CartLine = { slug: string; qty: number };

type CartState = {
  lines: CartLine[];
  open: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

/**
 * Cart lives in the browser. Only slugs and quantities are stored:
 * prices are always re-read (and, later, re-checked on the server).
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (slug, qty = 1) =>
        set((s) => {
          const found = s.lines.find((l) => l.slug === slug);
          const lines = found
            ? s.lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(l.qty + qty, 10) } : l))
            : [...s.lines, { slug, qty }];
          return { lines, open: true };
        }),
      setQty: (slug, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => l.slug !== slug) : s.lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(qty, 10) } : l)),
        })),
      remove: (slug) => set((s) => ({ lines: s.lines.filter((l) => l.slug !== slug) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "cosmos-cart", partialize: (s) => ({ lines: s.lines }) },
  ),
);

export function cartTotals(lines: CartLine[]) {
  const items = lines
    .map((l) => ({ ...l, product: getProduct(l.slug) }))
    .filter((l): l is CartLine & { product: NonNullable<ReturnType<typeof getProduct>> } => !!l.product);
  const subtotal = items.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const count = items.reduce((sum, l) => sum + l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= site.freeShippingOver ? 0 : site.shippingFee;
  return { items, subtotal, shipping, total: subtotal + shipping, count, toFree: Math.max(0, site.freeShippingOver - subtotal) };
}

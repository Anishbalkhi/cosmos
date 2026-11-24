"use client";

import { useState } from "react";
import clsx from "clsx";
import { useCart } from "@/lib/cart";
import { QtyStepper } from "./QtyStepper";

export function AddToCartButton({ slug, className, label = "Add to cart" }: { slug: string; className?: string; label?: string }) {
  const add = useCart((s) => s.add);
  return (
    <button
      type="button"
      onClick={() => add(slug)}
      className={clsx(
        "inline-flex h-11 items-center justify-center rounded-full bg-star px-5 text-sm font-semibold text-space transition-all duration-300 ease-cosmic hover:bg-flare",
        className,
      )}
    >
      {label}
    </button>
  );
}

/** Quantity + add, used on the product page. */
export function BuyBox({ slug, price }: { slug: string; price: string }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, q))} />
      <button
        type="button"
        onClick={() => add(slug, qty)}
        className="inline-flex h-12 flex-1 items-center justify-center gap-3 rounded-full bg-flare px-8 font-semibold text-space transition-all duration-300 ease-cosmic hover:bg-flare-soft hover:shadow-[0_0_40px_4px_rgb(var(--accent-rgb)/0.35)] sm:flex-none"
      >
        Add to cart <span className="opacity-60">·</span> {price}
      </button>
    </div>
  );
}

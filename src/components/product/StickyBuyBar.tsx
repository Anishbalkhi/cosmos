"use client";

import { useCart } from "@/lib/cart";

/** Mobile-only bar so "Add to cart" is always one tap away. */
export function StickyBuyBar({ slug, name, price }: { slug: string; name: string; price: string }) {
  const add = useCart((s) => s.add);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-space/90 px-5 py-3 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-dust">{price}</p>
        </div>
        <button onClick={() => add(slug)} className="h-11 shrink-0 rounded-full bg-flare px-6 text-sm font-semibold text-space">
          Add to cart
        </button>
      </div>
    </div>
  );
}

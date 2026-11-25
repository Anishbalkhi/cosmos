import clsx from "clsx";
import type { Product } from "@/lib/data";
import { inr, site } from "@/lib/data";
import { Pouch } from "@/components/product/Pouch";

/** A pouch on a tile lit in its formula's colour (the 3D scene is too heavy for lists). */
export function PouchThumb({ product, id, className }: { product: Product; id: string; className?: string }) {
  return (
    <div
      className={clsx("relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-line bg-black", className)}
      style={{ backgroundImage: `radial-gradient(circle at 50% 70%, ${product.color}55, transparent 70%)` }}
    >
      <div className="w-[58%] drop-shadow-[0_10px_14px_rgba(0,0,0,0.6)]">
        <Pouch id={id} name={product.short} color={product.color} glyph={product.glyph} />
      </div>
    </div>
  );
}

/** Free shipping as an orbit track: the fill is how far along you are, a light rides its tip. */
export function ShippingProgress({ subtotal }: { subtotal: number }) {
  const pct = Math.min(1, subtotal / site.freeShippingOver);
  const done = pct >= 1;
  return (
    <div>
      <p className="text-xs text-dust">
        {done ? (
          <span className="text-star">Free shipping unlocked.</span>
        ) : (
          <>
            Add <span className="text-star">{inr(site.freeShippingOver - subtotal)}</span> more for free shipping.
          </>
        )}
      </p>
      <div className="relative mt-3 h-[3px] rounded-full bg-white/10">
        <div className="h-full rounded-full bg-flare transition-[width] duration-700 ease-cosmic" style={{ width: `${pct * 100}%` }} />
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-star shadow-[0_0_12px_3px_var(--color-flare)] transition-[left] duration-700 ease-cosmic"
          style={{ left: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Why it's fine to pay, as one sentence under the summary (it was three icon tiles). */
export function TrustRow({ className }: { className?: string }) {
  return (
    <p className={clsx("text-sm leading-relaxed text-dust", className)}>
      Every batch is tested by an independent lab. It ships in a plain outer box, and payment is handled securely by our provider.
    </p>
  );
}

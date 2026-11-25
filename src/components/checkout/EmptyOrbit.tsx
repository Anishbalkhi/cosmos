import Link from "next/link";
import { inr, needOf, products, site, tone } from "@/lib/data";
import { AddToCartButton } from "@/components/product/AddToCart";
import { PouchThumb } from "./CommerceBits";

/**
 * Empty cart / nothing to check out: an empty orbit (rings with nothing on them but the formulas'
 * colours circling) and the three formulas to start from, each one tap from the cart.
 */
export function EmptyOrbit({ title }: { title: string }) {
  return (
    <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="relative mx-auto aspect-square w-full max-w-[26rem]" aria-hidden>
        <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/0.18),transparent_70%)]" />
        <div className="absolute inset-[42%] rounded-full border border-white/15 bg-black shadow-[0_0_60px_-10px_rgb(var(--accent-rgb)/0.6)]" />
        {products.map((p, i) => (
          <div
            key={p.slug}
            className="absolute rounded-full border border-white/10 animate-spin"
            style={{ inset: `${8 + i * 11}%`, animationDuration: `${22 + i * 9}s`, animationDirection: i % 2 ? "reverse" : "normal" }}
          >
            <span
              className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
              style={{ background: p.color, boxShadow: `0 0 16px 2px ${p.color}` }}
            />
          </div>
        ))}
      </div>

      <div>
        <p className="eyebrow mb-4">Nothing in orbit yet</p>
        <h1 className="display text-5xl sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-md text-star/75">Pick the formula for how you want to feel. Free shipping over {inr(site.freeShippingOver)}.</p>
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {products.map((p) => (
            <li key={p.slug} className="flex items-center gap-5 py-4">
              <Link href={`/products/${p.slug}`} className="w-16 shrink-0">
                <PouchThumb product={p} id={`empty-${p.slug}`} />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: tone(p.color) }}>
                  For {needOf(p.need).name}
                </p>
                <Link href={`/products/${p.slug}`} className="mt-0.5 block truncate font-semibold hover:text-flare-soft">
                  {p.name}
                </Link>
                <p className="text-sm text-dust tabular-nums">{inr(p.price)}</p>
              </div>
              <AddToCartButton slug={p.slug} label="Add" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

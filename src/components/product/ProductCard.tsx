import Link from "next/link";
import { inr, needOf, tone, type Product } from "@/lib/data";
import { PouchScene } from "./PouchScene";
import { AddToCartButton } from "./AddToCart";

export function ProductCard({ product }: { product: Product; index?: number }) {
  const need = needOf(product.need);
  return (
    // each card takes its product's colour (a wash down the card and a tinted edge), so the three read apart at a glance
    <article
      data-tilt
      className="group relative flex flex-col overflow-hidden rounded-[28px] border bg-space-2 transition-colors duration-500 [transform-style:preserve-3d]"
      style={{
        borderColor: `${tone(product.color)}33`,
        backgroundImage: `linear-gradient(180deg, transparent 55%, ${tone(product.color)}1f)`,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.12),transparent_45%)]" />
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/4.4] overflow-hidden" aria-label={product.name}>
        {/* the pouch as a 3D object in its world; it turns toward the cursor on hover */}
        <PouchScene slug={product.slug} />
        <span className="absolute top-5 left-5 rounded-full bg-black/50 px-2.5 py-1 text-xs text-star/85 backdrop-blur">For {need.name.toLowerCase()}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="display text-3xl">
            <Link href={`/products/${product.slug}`} className="hover:text-flare-soft">
              {product.name}
            </Link>
          </h3>
          <p className="mt-2 text-sm" style={{ color: tone(product.color, 0.55) }}>
            {product.tagline}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-tight">{inr(product.price)}</p>
            <p className="text-[13px] text-dust">
              {product.count} gummies · {product.mgPerGummy} mg each
            </p>
          </div>
          <AddToCartButton slug={product.slug} label="Add" />
        </div>
      </div>
    </article>
  );
}

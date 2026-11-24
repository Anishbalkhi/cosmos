import Link from "next/link";
import { inr, needOf, type Product } from "@/lib/data";
import { PouchScene } from "./PouchScene";
import { AddToCartButton } from "./AddToCart";

export function ProductCard({ product }: { product: Product; index?: number }) {
  const need = needOf(product.need);
  return (
    <article data-tilt className="group relative flex flex-col overflow-hidden rounded-[28px] border border-line bg-space-2 transition-colors duration-500 hover:border-white/25 [transform-style:preserve-3d]">
      <span aria-hidden className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.12),transparent_45%)]" />
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/4.4] overflow-hidden" aria-label={product.name}>
        {/* the pouch as a 3D object in its world; it turns toward the cursor on hover */}
        <PouchScene slug={product.slug} />
        <span className="bracket absolute top-5 left-5 text-star/80">[ For {need.name} ]</span>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="display text-3xl">
            <Link href={`/products/${product.slug}`} className="hover:text-flare-soft">
              {product.name}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-star/70">{product.tagline}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{inr(product.price)}</p>
            <p className="text-[13px] text-star/65">
              {product.count} gummies · {product.mgPerGummy} mg each
            </p>
          </div>
          <AddToCartButton slug={product.slug} label="Add" />
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import { inr, needOf, tone, type Product } from "@/lib/data";
import { Placeholder } from "@/components/ui/Placeholder";
import { PouchScene } from "./PouchScene";
import { AddToCartButton } from "./AddToCart";

export function ProductCard({ product }: { product: Product; index?: number }) {
  const need = needOf(product.need);
  const perGummy = Math.round(product.price / product.count);
  return (
    // each card takes its product's colour (a faint wash and a tinted edge), so the three read apart at a glance.
    // No 3D tilt: it moved the scene and the type together, as if the card were loose.
    <article
      className="group relative flex flex-col overflow-hidden rounded-[28px] border bg-space-2/80 backdrop-blur-sm transition-colors duration-500"
      style={{
        borderColor: `${tone(product.color)}33`,
        backgroundImage: `linear-gradient(180deg, transparent 55%, ${tone(product.color)}14)`,
      }}
    >
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3.6] overflow-hidden sm:aspect-[4/4.4]" aria-label={product.name}>
        {/* the pouch as a 3D object in its world; it turns toward the cursor on hover */}
        <PouchScene slug={product.slug} />
        <span className="absolute top-5 left-5 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-star backdrop-blur">For {need.name.toLowerCase()}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="display text-3xl">
            <Link href={`/products/${product.slug}`} className="hover:text-flare-soft" title={product.name}>
              {product.short}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-star/75">{product.tagline}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{inr(product.price)}</p>
            <p className="text-[13px] text-dust">
              {product.count} gummies · <Placeholder note="dose per gummy">{product.mgPerGummy} mg</Placeholder> each · {inr(perGummy)} a gummy
            </p>
          </div>
          <AddToCartButton slug={product.slug} label="Add" />
        </div>
      </div>
    </article>
  );
}

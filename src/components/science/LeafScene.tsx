"use client";

import clsx from "clsx";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { leafFrag } from "@/components/gl/objectShaders";

const POST: PostSettings = { threshold: 0.95, bloom: 0.5, streak: 0.22, aberration: 0.008, exposure: 1.0, grain: 0.035, vignette: 0.2 };

/**
 * "We only use the leaf": one Cannabis sativa fan leaf in 3D, the same seven leaflets as the
 * Cosmos mark, held up against a star so light comes through the blade. A lab scan line
 * sweeps down it every few seconds. Feathered edges so it sits in the page, not in a box.
 */
export function LeafScene({ className }: { className?: string }) {
  return (
    <div className={clsx("relative", className)}>
      <div className="absolute inset-0 [mask-image:radial-gradient(closest-side,#000_72%,transparent)]">
        <ShaderCanvas frag={leafFrag} post={POST} scale={0.9} maxDpr={1.75} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 font-mono text-[10px] tracking-[0.18em] uppercase sm:text-[11px]">
        <p className="absolute top-[12%] right-[4%] text-right text-star/70">
          Fan leaf · 7 leaflets
          <br />
          <span className="text-leaf">What we use</span>
        </p>
        <p className="absolute bottom-[14%] left-[4%] text-star/70">
          Every batch
          <br />
          <span className="text-leaf">Lab scanned</span>
        </p>
      </div>
    </div>
  );
}

/** What the law allows and what Cosmos never uses, as a compact legend. */
export function LeafLegend({ className }: { className?: string }) {
  return (
    <ul className={clsx("grid gap-3 text-sm", className)}>
      <li className="flex items-start gap-3">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-leaf shadow-[0_0_12px_var(--color-leaf)]" />
        <span>
          <span className="font-semibold text-star">Leaves</span> <span className="text-dust">— what every Cosmos gummy is made from</span>
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-dust/60">
          <span className="absolute top-1/2 left-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-dust" />
        </span>
        <span>
          <span className="font-semibold text-star">Flowering tops and resin</span> <span className="text-dust">— never used, and prohibited under the NDPS Act</span>
        </span>
      </li>
    </ul>
  );
}

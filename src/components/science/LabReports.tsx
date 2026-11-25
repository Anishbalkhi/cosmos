"use client";

import { useState } from "react";
import clsx from "clsx";
import { products } from "@/lib/data";
import { LabCertificate } from "@/components/product/LabCertificate";

/**
 * The lab reports as one certificate with a switch between the three formulas (it was three identical
 * cards side by side). The switch's dot and the card's wash use the same product colour.
 */
export function LabReports() {
  const [i, setI] = useState(0);
  const p = products[i];
  return (
    <div className="mt-12">
      <div role="tablist" aria-label="Formula" className="flex flex-wrap gap-2">
        {products.map((q, k) => (
          <button
            key={q.slug}
            type="button"
            role="tab"
            id={`lab-tab-${q.slug}`}
            aria-selected={k === i}
            aria-controls="lab-panel"
            onClick={() => setI(k)}
            className={clsx(
              "inline-flex h-11 items-center gap-2.5 rounded-full border px-5 text-sm font-semibold transition-colors",
              k === i ? "border-white/30 bg-white/[0.06] text-star" : "border-line text-star/60 hover:border-white/25 hover:text-star",
            )}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: q.color }} aria-hidden />
            {q.name}
          </button>
        ))}
      </div>
      <div id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${p.slug}`} className="mt-6">
        <LabCertificate key={p.slug} batch={p.batch} coaUrl={p.coaUrl} color={p.color} />
      </div>
    </div>
  );
}

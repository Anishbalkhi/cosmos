import { inr } from "@/lib/data";
import type { cartTotals } from "@/lib/cart";

/** Subtotal, shipping, GST note and total. GST is shown as included (prices are GST-inclusive). */
export function OrderSummary({ totals: t }: { totals: ReturnType<typeof cartTotals> }) {
  const gst = Math.round(t.subtotal - t.subtotal / 1.18); // PLACEHOLDER: confirm GST rate with client
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-dust">Subtotal</dt>
        <dd>{inr(t.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-dust">Shipping</dt>
        <dd>{t.shipping ? inr(t.shipping) : "Free"}</dd>
      </div>
      <div className="flex justify-between text-xs">
        <dt className="text-dust">Includes GST</dt>
        <dd className="text-dust">{inr(gst)}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-4 text-lg font-bold">
        <dt>Total</dt>
        <dd>{inr(t.total)}</dd>
      </div>
    </dl>
  );
}

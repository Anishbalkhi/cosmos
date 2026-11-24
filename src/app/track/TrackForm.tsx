"use client";

import { useState } from "react";
import { OrbitJourney } from "@/components/order/OrbitJourney";
import { IconTruck } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";

/** UI phase: shows a sample result. Backend phase: GET /api/orders/track. */
export function TrackForm() {
  const [order, setOrder] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<null | "found" | "missing">(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(order.trim() && contact.trim() ? "found" : "missing");
  }

  const field = "h-12 w-full rounded-2xl border border-line bg-space-3/60 px-4 text-sm outline-none focus:border-flare";

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="tr-order" className="mb-2 block text-xs text-dust">
            Order number
          </label>
          <input id="tr-order" placeholder="COS-1001" value={order} onChange={(e) => setOrder(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="tr-contact" className="mb-2 block text-xs text-dust">
            Email or phone
          </label>
          <input id="tr-contact" value={contact} onChange={(e) => setContact(e.target.value)} className={field} />
        </div>
        <Button type="submit" className="w-full" arrow>
          Track order
        </Button>
        {result === "missing" && <p className="text-sm text-red-300">Please fill in both fields.</p>}
      </form>

      <div className="grain relative overflow-hidden rounded-[28px] border border-line bg-space-2 p-7 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.14),transparent)]" />
        <div className="relative">
          {result === "found" ? (
            <>
              <p className="eyebrow mb-2">Order {order.toUpperCase()}</p>
              <p className="display text-4xl">On its way</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-dust">
                <IconTruck className="h-4 w-4" /> Shipped with Delhivery · expected in 2 days
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow mb-2">Its orbit</p>
              <p className="display text-4xl text-star/80">From our lab to your door</p>
              <p className="mt-2 text-sm text-dust">Enter your order number and we&rsquo;ll show you where it is on the way.</p>
            </>
          )}
          <div className="mt-8">
            <OrbitJourney current={result === "found" ? 2 : -1} notes={result === "found" ? { 0: "9 Dec", 1: "10 Dec", 2: "11 Dec" } : undefined} />
          </div>
          {/* backend phase: link to the courier's own tracking page for this AWB */}
          {result === "found" && <p className="mt-6 text-sm text-dust">The courier&rsquo;s live tracking link is in your shipping email.</p>}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { StatusSteps } from "@/components/order/StatusSteps";
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

      <div className="rounded-[28px] border border-line bg-space-2 p-7 sm:p-10">
        {result === "found" ? (
          <>
            <p className="eyebrow mb-2">Order {order.toUpperCase()}</p>
            <p className="display text-3xl">On its way</p>
            <p className="mt-2 text-sm text-dust">Shipped with Delhivery · expected in 2 days</p>
            <div className="mt-8">
              <StatusSteps current={2} notes={{ 0: "9 Dec", 1: "10 Dec", 2: "11 Dec" }} />
            </div>
            {/* backend phase: link to the courier's own tracking page for this AWB */}
            <p className="mt-8 text-sm text-dust">The courier&rsquo;s live tracking link is in your shipping email.</p>
          </>
        ) : (
          <div className="grid h-full min-h-48 place-items-center text-center text-sm text-dust">Your order status will appear here.</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** UI phase only: wire to POST /api/contact (saved in Payload + emailed) later. */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const field = "w-full rounded-2xl border border-line bg-space-3/60 px-4 text-sm outline-none focus:border-flare";

  if (sent)
    return (
      <div className="rounded-[28px] border border-leaf/30 bg-leaf/10 p-10">
        <p className="display text-3xl">Message received.</p>
        <p className="mt-3 text-dust">We&apos;ll get back to you within one working day.</p>
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if ((e.currentTarget as HTMLFormElement).checkValidity()) setSent(true);
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <label htmlFor="ct-name" className="mb-2 block text-xs text-dust">
          Name
        </label>
        <input id="ct-name" required autoComplete="name" className={`${field} h-12`} />
      </div>
      <div>
        <label htmlFor="ct-email" className="mb-2 block text-xs text-dust">
          Email
        </label>
        <input id="ct-email" type="email" required autoComplete="email" className={`${field} h-12`} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ct-topic" className="mb-2 block text-xs text-dust">
          Topic
        </label>
        <select id="ct-topic" className={`${field} h-12`}>
          <option>Product question</option>
          <option>My order</option>
          <option>Wholesale</option>
          <option>Press</option>
          <option>Something else</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ct-msg" className="mb-2 block text-xs text-dust">
          Message
        </label>
        <textarea id="ct-msg" required rows={6} className={`${field} py-3`} />
      </div>
      <Button type="submit" className="sm:w-fit" arrow>
        Send message
      </Button>
    </form>
  );
}

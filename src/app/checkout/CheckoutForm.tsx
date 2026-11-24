"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { useCart, cartTotals } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { inr } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { EmptyOrbit } from "@/components/checkout/EmptyOrbit";
import { PouchThumb, ShippingProgress, TrustRow } from "@/components/checkout/CommerceBits";
import { Wordmark } from "@/components/brand/Wordmark";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Puducherry", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

type Fields = { name: string; email: string; phone: string; address: string; city: string; state: string; pin: string; adult: boolean };
const EMPTY: Fields = { name: "", email: "", phone: "", address: "", city: "", state: "Karnataka", pin: "", adult: false };

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) e.name = "Enter your full name";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, "").slice(-10))) e.phone = "Enter a 10-digit mobile number";
  if (f.address.trim().length < 8) e.address = "Enter your full address";
  if (f.city.trim().length < 2) e.city = "Enter your city";
  if (!/^[1-9]\d{5}$/.test(f.pin)) e.pin = "Enter a 6-digit PIN code";
  if (!f.adult) e.adult = "You must confirm you are 18 or older";
  return e;
}

export function CheckoutForm() {
  const mounted = useMounted();
  const router = useRouter();
  const { lines, clear } = useCart();
  const t = cartTotals(mounted ? lines : []);
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [paying, setPaying] = useState(false);
  // the step track lights each stage as its fields become valid
  const live = validate(f);
  const contactDone = !live.name && !live.email && !live.phone;
  const deliveryDone = !live.address && !live.city && !live.pin;

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setF((s) => ({ ...s, [k]: v }));
    setErrors((s) => ({ ...s, [k]: undefined }));
  };

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`co-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    // UI phase: simulate the Razorpay round trip.
    // Backend phase: POST /api/checkout -> open Razorpay Checkout -> webhook marks the order paid.
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1200));
    clear();
    router.push("/order/COS-1001");
  }

  if (mounted && t.items.length === 0 && !paying) {
    return (
      <Container className="py-16 sm:py-24">
        <EmptyOrbit title="Nothing to check out yet." />
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-3">Secure checkout</p>
          <h1 className="display text-5xl">Checkout</h1>
        </div>
        <Link href="/cart" className="text-sm text-dust hover:text-star">
          ← Back to cart
        </Link>
      </div>
      <StepTrack done={[contactDone, deliveryDone, f.adult]} />

      <form onSubmit={pay} noValidate className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <fieldset className="rounded-[28px] border border-line bg-space-2/60 p-6 sm:p-8">
            <legend className="sr-only">Contact</legend>
            <p aria-hidden className="mb-6 flex items-center gap-3 text-lg font-bold">
              <Step n={1} /> Contact
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name" error={errors.name} className="sm:col-span-2">
                <input id="co-name" autoComplete="name" value={f.name} onChange={set("name")} className={input(errors.name)} />
              </Field>
              <Field id="email" label="Email" error={errors.email}>
                <input id="co-email" type="email" autoComplete="email" value={f.email} onChange={set("email")} className={input(errors.email)} />
              </Field>
              <Field id="phone" label="Mobile number" error={errors.phone}>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-dust">+91</span>
                  <input id="co-phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={f.phone} onChange={set("phone")} className={clsx(input(errors.phone), "pl-12")} />
                </div>
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-[28px] border border-line bg-space-2/60 p-6 sm:p-8">
            <legend className="sr-only">Delivery address</legend>
            <p aria-hidden className="mb-6 flex items-center gap-3 text-lg font-bold">
              <Step n={2} /> Delivery address
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="address" label="House, street, area" error={errors.address} className="sm:col-span-3">
                <textarea id="co-address" rows={2} autoComplete="street-address" value={f.address} onChange={set("address")} className={clsx(input(errors.address), "h-auto py-3")} />
              </Field>
              <Field id="city" label="City" error={errors.city}>
                <input id="co-city" autoComplete="address-level2" value={f.city} onChange={set("city")} className={input(errors.city)} />
              </Field>
              <Field id="state" label="State">
                <select id="co-state" autoComplete="address-level1" value={f.state} onChange={set("state")} className={input()}>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field id="pin" label="PIN code" error={errors.pin}>
                <input id="co-pin" inputMode="numeric" maxLength={6} autoComplete="postal-code" value={f.pin} onChange={set("pin")} className={input(errors.pin)} />
              </Field>
            </div>
            <p className="mt-3 text-xs text-dust">Ships in a plain outer box. Delivery in 3 to 6 working days.</p>
          </fieldset>

          <fieldset className="rounded-[28px] border border-line bg-space-2/60 p-6 sm:p-8">
            <legend className="sr-only">Confirm</legend>
            <p aria-hidden className="mb-6 flex items-center gap-3 text-lg font-bold">
              <Step n={3} /> Confirm
            </p>
            <label htmlFor="co-adult" className="flex cursor-pointer items-start gap-3 text-sm">
              <input id="co-adult" type="checkbox" checked={f.adult} onChange={set("adult")} className="mt-0.5 h-5 w-5 accent-[var(--color-flare)]" />
              <span>
                I confirm I am 18 or older and agree to the{" "}
                <Link href="/policies/terms" className="underline underline-offset-4">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="/policies/refund" className="underline underline-offset-4">
                  refund policy
                </Link>
                .
              </span>
            </label>
            {errors.adult && <p className="mt-2 text-xs text-red-300">{errors.adult}</p>}
          </fieldset>
        </div>

        <aside className="grain relative h-fit overflow-hidden rounded-[28px] border border-line bg-space-2 p-7 lg:sticky lg:top-28">
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/0.16),transparent_70%)]" />
          <p className="relative mb-5 font-mono text-[11px] tracking-[0.18em] text-dust uppercase">Order summary</p>
          <ul className="relative mb-6 space-y-4">
            {t.items.map((l) => (
              <li key={l.slug} className="flex items-center gap-4">
                <div className="relative w-14 shrink-0">
                  <PouchThumb product={l.product} id={`co-${l.slug}`} />
                  <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-star text-[10px] font-bold text-space">{l.qty}</span>
                </div>
                <p className="flex-1 text-sm">{l.product.name}</p>
                <p className="text-sm tabular-nums">{inr(l.product.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          <ShippingProgress subtotal={t.subtotal} />
          <div className="mt-6">
            <OrderSummary totals={t} />
          </div>
          <button
            type="submit"
            disabled={paying || !mounted}
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-flare font-semibold text-space transition-all hover:bg-flare-soft disabled:opacity-60"
          >
            {paying ? "Opening payment…" : <>Pay {inr(t.total)} securely</>}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-dust">
            Powered by Razorpay · UPI · Cards · Netbanking
          </p>
          <TrustRow className="mt-6" />
          <div className="mt-6 border-t border-line pt-5 text-center text-xs text-dust">
            <Wordmark className="text-sm opacity-60" />
          </div>
        </aside>
      </form>
    </Container>
  );
}

/** Contact, delivery, confirm and pay as an orbit line whose stops light up as each is completed. */
function StepTrack({ done }: { done: boolean[] }) {
  const labels = ["Contact", "Delivery", "Confirm & pay"];
  const reached = done.findIndex((d) => !d);
  const progress = reached === -1 ? 1 : reached / (labels.length - 1);
  const current = reached === -1 ? labels.length - 1 : reached;
  return (
    <div className="mb-10" aria-hidden>
      <div className="relative mx-3 h-px bg-white/15">
        <div className="absolute inset-y-0 left-0 bg-flare transition-[width] duration-700 ease-cosmic" style={{ width: `${progress * 100}%` }} />
        {labels.map((l, i) => (
          <span
            key={l}
            className={clsx(
              "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-space transition-colors duration-500",
              done[i] ? "bg-flare shadow-[0_0_12px_2px_var(--color-flare)]" : i === current ? "bg-star" : "bg-white/25",
            )}
            style={{ left: `${(i / (labels.length - 1)) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-between font-mono text-[11px] tracking-[0.14em] text-dust uppercase">
        {labels.map((l, i) => (
          <span key={l} className={clsx(done[i] && "text-flare-soft")}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="grid h-7 w-7 place-items-center rounded-full border border-flare font-mono text-xs text-flare">{n}</span>;
}

function input(error?: string) {
  return clsx(
    "h-12 w-full rounded-2xl border bg-space-3/60 px-4 text-sm outline-none transition-colors placeholder:text-dust/60 focus:border-flare",
    error ? "border-red-400" : "border-line",
  );
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={`co-${id}`} className="mb-2 block text-xs text-dust">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}

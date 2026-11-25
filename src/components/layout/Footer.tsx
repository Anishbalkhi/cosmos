import Link from "next/link";
import { PREVIEW } from "@/components/ui/Placeholder";
import { Wordmark } from "@/components/brand/Wordmark";
import { Suspense } from "react";
import { FooterJoinActive, FooterJoinFallback } from "./FooterJoin";
import { site } from "@/lib/data";
import { AccentSwitch } from "./AccentSwitch";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/products/event-horizon", label: "Event Horizon" },
      { href: "/products/nirvana", label: "Nirvana" },
      { href: "/products/moonwalk-bytes", label: "Moonwalk Bytes" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/science", label: "The Science" },
      { href: "/science#lab-reports", label: "Lab reports" },
      { href: "/our-story", label: "Our Story" },
      { href: "/journal", label: "Journal" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/track", label: "Track order" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

const POLICIES = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/refund", label: "Refunds" },
];

// the brand colour switch and the placeholder note are for the client's review, not for customers
const SHOW_PREVIEW_NOTES = PREVIEW;

export function Footer() {
  return (
    <footer data-stop="9" className="relative overflow-hidden">
      {/* extra room at the very bottom so the fixed "Sound off" pill never sits on the last row */}
      <div className="mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8 sm:pb-28">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          {/* reads the URL, so it sits inside Suspense (Cache Components) */}
          <Suspense fallback={<FooterJoinFallback />}>
            <FooterJoinActive />
          </Suspense>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <p className="mb-5 font-mono text-[11px] tracking-[0.18em] text-dust uppercase">{c.title}</p>
                <ul className="space-y-3">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-sm text-star/85 transition-[color,background-size] duration-500 ease-cosmic hover:bg-[length:100%_1px] hover:text-flare-soft"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* the wordmark as one word spanning the column (it was pushed apart into "C ... ✳ ... SMOS"),
            fading into the bottom edge like a horizon, the leaf with a faint glow */}
        <div
          className="relative mt-20 flex justify-center text-[17vw] leading-none [mask-image:linear-gradient(to_bottom,#000_45%,transparent_100%)] lg:text-[14.2rem]"
          aria-hidden
        >
          <div className="absolute top-1/2 left-1/2 h-[60%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(159_198_87/0.22),transparent)] blur-2xl" />
          <Wordmark className="relative tracking-[0.02em] text-star/90" />
        </div>

        <div className="mt-6 flex flex-col gap-6 border-t border-line pt-8 text-xs text-dust lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-2 leading-relaxed">
            <p>
              For adults 18+. Made from Cannabis sativa leaf extract under licence.
            </p>
            <p>These products are not intended to diagnose, treat, cure or prevent any disease. Consult your doctor before use.</p>
            <p className="text-dust/70">Space imagery: NASA (SDO, Apollo 17, LRO, Viking, Hubble, Cassini, Voyager 2, Suomi NPP Black Marble) and NASA/ESA Hubble Orion mosaic (M. Robberto), public domain.</p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.14em] uppercase">
              {POLICIES.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="transition-colors hover:text-star">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p>
              © 2026 Cosmos Cannabis Cure · {site.city} ·{" "}
              <a href={`mailto:${site.email}`} className="hover:text-star">
                {site.email}
              </a>
            </p>
          </div>
        </div>

        {/* temporary preview notes (CLIENT-CHECKLIST.md): never in a production build unless asked for */}
        {SHOW_PREVIEW_NOTES && (
          <div className="mt-8 flex flex-col gap-4 rounded-[22px] border border-dashed border-white/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <AccentSwitch />
            <p className="max-w-md text-xs text-dust sm:text-right">
              Preview build: prices, doses, ingredients and the licence number are placeholders until confirmed.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}

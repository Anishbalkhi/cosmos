import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { LeafStar } from "@/components/brand/LeafStar";
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

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-space">
      <LeafStar className="pointer-events-none absolute -right-24 -bottom-32 h-[520px] w-[560px] opacity-[0.04]" color="#f4f1ea" />

      <div className="mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-8">
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
                      <Link href={l.href} className="text-sm text-star/85 transition-colors hover:text-flare-soft">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-[13vw] leading-none sm:text-[10vw] lg:text-[9rem]">
          <Wordmark className="w-full justify-between opacity-90" />
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 text-xs text-dust lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-2 leading-relaxed">
            <p>
              For adults 18+. Made from Cannabis sativa leaf extract under licence. Licence no. <span className="text-star">[to be added]</span>.
            </p>
            <p>These products are not intended to diagnose, treat, cure or prevent any disease. Consult your doctor before use.</p>
            <p className="text-dust/70">Planet imagery: NASA (SDO, Apollo 17, LRO, Viking, Hubble, Cassini, Voyager 2), public domain.</p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <ul className="flex flex-wrap gap-5">
              {POLICIES.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="hover:text-star">
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

        {/* temporary preview notes: remove both once the client signs off (CLIENT-CHECKLIST.md) */}
        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <AccentSwitch />
          <p className="max-w-md text-xs text-dust/80">
            Preview build: prices, doses, ingredients and the licence number are placeholders until confirmed.
          </p>
        </div>
      </div>
    </footer>
  );
}

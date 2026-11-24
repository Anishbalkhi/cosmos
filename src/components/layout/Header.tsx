"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Wordmark } from "@/components/brand/Wordmark";
import { useCart, cartTotals } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { useScrollLock } from "@/lib/useScrollLock";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/science", label: "The Science" },
  { href: "/our-story", label: "Our Story" },
  { href: "/journal", label: "Journal" },
];

const MORE = [
  { href: "/faq", label: "FAQ" },
  { href: "/track", label: "Track order" },
  { href: "/contact", label: "Contact" },
];

/** Desktop links; reads the URL so it sits inside Suspense (Cache Components). */
function DesktopLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={clsx(
            "bracket group py-2 text-[0.7rem] transition-colors hover:text-star",
            pathname.startsWith(n.href) ? "text-flare-soft" : "text-star/75",
          )}
          aria-current={pathname.startsWith(n.href) ? "page" : undefined}
        >
          <span className="opacity-40 transition-opacity group-hover:opacity-100">[</span>
          {n.label}
          <span className="opacity-40 transition-opacity group-hover:opacity-100">]</span>
        </Link>
      ))}
    </>
  );
}

function ActiveDesktopLinks() {
  return <DesktopLinks pathname={usePathname()} />;
}

/** Closes the menu whenever the route changes (back/forward included). */
function CloseOnRouteChange({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange();
  }, [pathname, onChange]);
  return null;
}

/** Full-screen phone menu: opaque, scroll-locked, Escape to close, focus moved in and back. */
function MobileMenu({ open, onClose, toggle }: { open: boolean; onClose: () => void; toggle: React.RefObject<HTMLButtonElement | null> }) {
  const panel = useRef<HTMLDivElement>(null);
  const setCartOpen = useCart((s) => s.setOpen);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const t = toggle.current;
    panel.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onResize = () => window.innerWidth >= 768 && onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      t?.focus({ preventScroll: true });
    };
  }, [open, onClose, toggle]);

  return (
    <div
      ref={panel}
      id="mobile-menu"
      inert={!open}
      className={clsx(
        "fixed inset-0 z-[35] flex flex-col overflow-y-auto bg-space px-5 pt-32 pb-10 duration-500 ease-cosmic md:hidden",
        // visible at once on open (a hidden element can't take focus); hidden only after the fade-out
        open ? "visible opacity-100 transition-opacity" : "invisible opacity-0 transition-[opacity,visibility]",
      )}
      data-lenis-prevent
    >
      <nav aria-label="Mobile" className="flex flex-col">
        {NAV.map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={onClose}
            className={clsx(
              "display border-b border-line py-4 text-5xl transition-[opacity,transform] duration-700 ease-cosmic",
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
            style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div
        className={clsx("mt-10 grid grid-cols-2 gap-x-6 gap-y-1 transition-opacity duration-700", open ? "opacity-100" : "opacity-0")}
        style={{ transitionDelay: open ? "360ms" : "0ms" }}
      >
        {MORE.map((n) => (
          <Link key={n.href} href={n.href} onClick={onClose} className="py-3 text-base text-star/85">
            {n.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => {
            onClose();
            setCartOpen(true);
          }}
          className="py-3 text-left text-base text-star/85"
        >
          Cart
        </button>
      </div>

      <Link
        href="/#waitlist"
        onClick={onClose}
        className="mt-auto inline-flex h-12 items-center justify-center rounded-full bg-flare px-6 text-sm font-semibold text-space"
      >
        Join the waitlist
      </Link>
      <p className="mt-4 text-center text-xs text-dust">For adults 18+. Soft launch the week of 11 December.</p>
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const mounted = useMounted();
  const count = mounted ? cartTotals(lines).count : 0;
  const [close] = useState(() => () => setMenu(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        data-chrome
        className={clsx(
          "sticky top-0 z-40 transition-all duration-500 ease-cosmic",
          scrolled && !menu ? "border-b border-line bg-space/80 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <Link href="/" aria-label="Cosmos home" onClick={close} className="-my-2 flex h-11 items-center py-2 text-xl sm:text-2xl">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Main">
            <Suspense fallback={<DesktopLinks pathname="" />}>
              <ActiveDesktopLinks />
            </Suspense>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="relative flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm transition-colors hover:border-star/40"
              aria-label={`Open cart, ${count} items`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M6 7h12l-1 13H7L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              <span className="bracket hidden text-[0.7rem] sm:inline">Cart</span>
              <span
                className={clsx(
                  "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold transition-colors",
                  count ? "bg-flare text-space" : "bg-white/10 text-dust",
                )}
              >
                {count}
              </span>
            </button>
            <button
              ref={toggle}
              className="grid h-11 w-11 place-items-center rounded-full border border-line md:hidden"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
            >
              <span className="relative block h-3 w-5">
                <span className={clsx("absolute left-0 h-px w-5 bg-star transition-all", menu ? "top-1.5 rotate-45" : "top-0")} />
                <span className={clsx("absolute left-0 h-px w-5 bg-star transition-all", menu ? "top-1.5 -rotate-45" : "top-3")} />
              </span>
            </button>
          </div>
        </div>
      </header>
      {/* outside <header>: its backdrop-filter would otherwise trap this fixed overlay inside it */}
      <MobileMenu open={menu} onClose={close} toggle={toggle} />
      <Suspense fallback={null}>
        <CloseOnRouteChange onChange={close} />
      </Suspense>
    </>
  );
}

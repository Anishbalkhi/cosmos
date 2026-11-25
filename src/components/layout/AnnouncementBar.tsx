import Link from "next/link";

export function AnnouncementBar() {
  return (
    // fixed height (--ann): the home hero is pulled up under it by exactly this much
    <div data-chrome className="relative z-50 flex h-[var(--ann)] items-center border-b border-line bg-space text-flare-soft">
      {/* one line on phones too: shorter date wording below sm */}
      <p className="mx-auto w-full max-w-7xl px-5 text-center font-mono text-[11px] tracking-[0.14em] whitespace-nowrap uppercase sm:px-8 sm:tracking-[0.16em]">
        <span className="sm:hidden">Soft launch · 11 Dec</span>
        <span className="hidden sm:inline">Soft launch · week of 11 December</span> ·{" "}
        <Link href="/#waitlist" className="text-star underline decoration-flare/50 underline-offset-4 hover:decoration-flare">
          Join the waitlist
        </Link>
      </p>
    </div>
  );
}

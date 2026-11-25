"use client";

import { usePathname } from "next/navigation";
import { WaitlistForm } from "./WaitlistForm";

// pages that already end with the waitlist section (ClosingCta): the footer signs off instead of a second form
const HAS_WAITLIST = new Set(["/", "/our-story"]);

/** On a page that already ends with the waitlist, the footer shows a short sign-off instead of a second form. */
function Join({ home }: { home: boolean }) {
  if (home) {
    return (
      <div>
        <p className="eyebrow mb-4">Cosmos Cannabis Cure</p>
        <p className="display max-w-sm text-3xl">Lab-tested sativa leaf gummies for rest, balance and focus.</p>
        <p className="mt-4 max-w-sm text-sm text-dust">Made in Bangalore under licence. For adults 18+.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow mb-4">Join the orbit</p>
      <p className="display max-w-sm text-3xl">Be first through the door on launch day.</p>
      <WaitlistForm className="mt-8 max-w-md" />
    </div>
  );
}

export function FooterJoinActive() {
  return <Join home={HAS_WAITLIST.has(usePathname())} />;
}

export function FooterJoinFallback() {
  return <Join home={false} />;
}

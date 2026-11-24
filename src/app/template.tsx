"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Re-mounts on every navigation: each page drifts up out of a soft blur,
 * with a thin gold line sweeping across the top.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(root.current, { opacity: 0, y: 24, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "expo.out", clearProps: "transform,filter" });
      gsap.fromTo(line.current, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.9, ease: "expo.inOut", onComplete: () => void gsap.to(line.current, { opacity: 0, duration: 0.5 }) });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div ref={line} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-gradient-to-r from-transparent via-flare to-transparent opacity-0" />
      <div ref={root}>{children}</div>
    </>
  );
}

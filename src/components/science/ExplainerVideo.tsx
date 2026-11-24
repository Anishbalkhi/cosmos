"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import clsx from "clsx";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

/**
 * A short silent explainer (made with the minimal-graphics skill). It plays muted on a loop only
 * while on screen; with reduced motion it rests on its final frame (the poster) and plays only when
 * the visitor presses play. The words in it are also in the page text, so nothing is video-only.
 */
export function ExplainerVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
      className={clsx("block aspect-video w-full bg-[#0e0f11] object-cover", className)}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      controls={reduced}
      aria-label={label}
    />
  );
}

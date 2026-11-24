"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";

/**
 * Line icons inside draw themselves on once, the first time this comes into view, then rest
 * (motion notes: icons get one moment on appear, never an endless loop). The stroke drawing and its
 * stagger (`--i` on each item, 70 ms apart) live in globals.css under `.draw-on`; reduced motion
 * shows them finished.
 */
export function DrawOn({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.drawn = "true";
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={clsx("draw-on", className)}>
      {children}
    </div>
  );
}

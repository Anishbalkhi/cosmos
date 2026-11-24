"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";

/** Rises out of a soft blur into view once, when scrolled to. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms` }}
      className={clsx(
        "transition-[opacity,transform,filter] duration-[1400ms] ease-cosmic will-change-transform",
        shown ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-12 scale-[0.97] opacity-0 blur-[6px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

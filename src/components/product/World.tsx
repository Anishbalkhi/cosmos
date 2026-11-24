import clsx from "clsx";

/** A small CSS black hole (no WebGL), used in page headers. */
export function MiniBlackHole({ className, color = "var(--color-flare)" }: { className?: string; color?: string }) {
  // color-mix keeps translucency working for both hex colours and CSS variables (the brand accent)
  const a = (pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
  return (
    <div className={clsx("pointer-events-none relative aspect-square", className)} aria-hidden>
      <div className="absolute inset-[-25%] rounded-full" style={{ background: `radial-gradient(circle, ${a(33)}, transparent 62%)` }} />
      <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 50px 8px ${a(67)}, inset 0 0 24px 6px #ffe8d0, 0 0 0 2px #fff6ea` }} />
      <div className="absolute inset-[5%] rounded-full bg-black" />
      <div
        className="absolute top-[54%] left-1/2 h-[10%] w-[300%] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] rounded-[50%]"
        style={{ background: `radial-gradient(ellipse, #fff5e8 0%, ${color} 30%, ${a(33)} 55%, transparent 72%)` }}
      />
    </div>
  );
}

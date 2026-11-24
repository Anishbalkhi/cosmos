"use client";

import clsx from "clsx";

export function QtyStepper({ value, onChange, size = "md" }: { value: number; onChange: (q: number) => void; size?: "sm" | "md" }) {
  const btn = clsx("grid place-items-center text-dust transition-colors hover:text-star disabled:opacity-30", size === "sm" ? "h-8 w-8" : "h-12 w-12 text-lg");
  return (
    <div className={clsx("inline-flex items-center rounded-full border border-line", size === "sm" ? "text-sm" : "")}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span className={clsx("text-center tabular-nums", size === "sm" ? "w-6" : "w-8")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= 10} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

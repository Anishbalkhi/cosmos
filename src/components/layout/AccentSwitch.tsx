"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ACCENT_KEY } from "@/lib/experience";

type Accent = "gold" | "orange";
const OPTIONS: { id: Accent; label: string; swatch: string }[] = [
  { id: "gold", label: "Gold", swatch: "#e8b86d" },
  { id: "orange", label: "Orange", swatch: "#ff7a2e" },
];

/**
 * Temporary: lets the client compare the two accent colours they're weighing (WhatsApp brief,
 * 21 Nov 2026). Remove this component, and the :root[data-accent] block in globals.css, once a
 * colour is chosen.
 */
export function AccentSwitch() {
  const [accent, setAccent] = useState<Accent>("gold");

  // read what the <head> script applied before paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setAccent(document.documentElement.dataset.accent === "orange" ? "orange" : "gold"));
    return () => cancelAnimationFrame(id);
  }, []);

  const choose = (a: Accent) => {
    setAccent(a);
    const root = document.documentElement;
    if (a === "orange") root.setAttribute("data-accent", "orange");
    else root.removeAttribute("data-accent");
    try {
      localStorage.setItem(ACCENT_KEY, a);
    } catch {}
  };

  return (
    <div className="flex items-center gap-3" role="radiogroup" aria-label="Brand colour preview">
      <span className="font-mono text-[11px] tracking-[0.14em] text-dust uppercase">Brand colour preview</span>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={accent === o.id}
          onClick={() => choose(o.id)}
          className={clsx(
            "flex h-8 items-center gap-2 rounded-full border px-3 text-xs transition-colors",
            accent === o.id ? "border-star/50 text-star" : "border-line text-dust hover:text-star",
          )}
        >
          <span className="h-3 w-3 rounded-full" style={{ background: o.swatch }} />
          {o.label}
        </button>
      ))}
    </div>
  );
}

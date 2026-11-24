"use client";

import { useEffect } from "react";
import { ambient, type Sample } from "@/lib/ambient";

/**
 * Plays the interface sound named by `data-sfx` on whatever was clicked (buttons, add to cart).
 * One listener for the site, mounted once in the layout; silent unless the visitor turned sound on.
 */
export function SfxListener() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-sfx]");
      const name = el?.getAttribute("data-sfx") as Sample | null;
      if (name) ambient.ui(name);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

"use client";

import { useEffect } from "react";
import { useExperience } from "@/lib/experience";

// counted, so the menu and the cart drawer can both hold the lock without releasing each other's
let locks = 0;

/** Freezes page scrolling (Lenis and native) while `active`, e.g. under an overlay. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    const html = document.documentElement;
    useExperience.getState().lenis?.stop();
    html.style.overflow = "hidden";
    return () => {
      locks -= 1;
      if (locks > 0) return;
      html.style.overflow = "";
      useExperience.getState().lenis?.start();
    };
  }, [active]);
}

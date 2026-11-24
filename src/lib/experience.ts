"use client";

import { create } from "zustand";
import type Lenis from "lenis";

/** Shared state for the immersive layer: intro, sound, black-hole spin-up. */
type Experience = {
  sound: boolean;
  boost: number; // 0..1 spins up the black hole (intro portal, click-and-hold)
  introDone: boolean; // hero entrance waits for this
  /** the hero's black hole has drawn its first frame (the loader waits for it on the home page) */
  heroReady: boolean;
  lenis: Lenis | null;
  /** viewport point (px) the intro portal opened from: the arrival's black hole starts right there */
  portal: { x: number; y: number } | null;
  setSound: (on: boolean) => void;
  setBoost: (b: number) => void;
  setIntroDone: (d: boolean) => void;
  setHeroReady: (r: boolean) => void;
  setLenis: (l: Lenis | null) => void;
  setPortal: (p: { x: number; y: number } | null) => void;
};

export const useExperience = create<Experience>((set) => ({
  sound: false,
  boost: 0,
  introDone: false,
  heroReady: false,
  lenis: null,
  portal: null,
  setSound: (sound) => set({ sound }),
  setBoost: (boost) => set({ boost }),
  setIntroDone: (introDone) => set({ introDone }),
  setHeroReady: (heroReady) => set({ heroReady }),
  setLenis: (lenis) => set({ lenis }),
  setPortal: (portal) => set({ portal }),
}));

/** Smooth-scroll to a y position (Lenis when available). */
export function scrollToY(y: number, duration = 2) {
  const lenis = useExperience.getState().lenis;
  if (lenis) lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

export const AGE_KEY = "cosmos-age-ok";
export const SEEN_KEY = "cosmos-intro-seen";
export const AGE_DAYS = 30;

/** brand-accent preview (gold | orange) while the client decides; see :root[data-accent] in globals.css */
export const ACCENT_KEY = "cosmos-accent";

/**
 * Runs in <head> before paint: returning visitors never see the intro flash, and a chosen accent
 * (?accent=orange|gold, remembered) is applied before anything is drawn.
 */
export const introSkipScript = `(function(){try{var a=+localStorage.getItem('${AGE_KEY}')||0;if(a&&Date.now()-a<${AGE_DAYS}*864e5&&sessionStorage.getItem('${SEEN_KEY}')){document.documentElement.setAttribute('data-intro','skip')}}catch(e){}try{var q=new URLSearchParams(location.search).get('accent');if(q==='orange'||q==='gold'){localStorage.setItem('${ACCENT_KEY}',q)}var c=localStorage.getItem('${ACCENT_KEY}');if(c==='orange'){document.documentElement.setAttribute('data-accent','orange')}}catch(e){}})();`;

export function introNeeded() {
  try {
    const a = Number(localStorage.getItem(AGE_KEY) ?? 0);
    const fresh = a && Date.now() - a < AGE_DAYS * 864e5;
    return !(fresh && sessionStorage.getItem(SEEN_KEY));
  } catch {
    return true;
  }
}

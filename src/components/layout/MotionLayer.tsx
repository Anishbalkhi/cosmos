"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Wrap every word of an element's text in .sw > .swi (keeps <em>, <br>, etc.). */
function splitWords(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const parts = (node.textContent ?? "").split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const outer = document.createElement("span");
        outer.className = "sw";
        const inner = document.createElement("span");
        inner.className = "swi";
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      }
    }
    node.replaceWith(frag);
  }
  return Array.from(el.querySelectorAll<HTMLElement>(".swi"));
}

/**
 * Site-wide motion, re-applied on every route:
 *  - [data-split]    headings rise word by word from a mask as they scroll in
 *  - [data-magnetic] buttons lean toward the cursor
 *  - [data-tilt]     cards tilt in 3D under the cursor
 *  - [data-parallax] elements drift at their own speed while scrolling
 */
export function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    // wait a beat so streamed (Suspense) content has hydrated before we touch the DOM
    const timer = window.setTimeout(() => {
      const ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>("[data-split]:not([data-split-done])").forEach((el) => {
          el.setAttribute("data-split-done", "");
          const words = splitWords(el);
          gsap.set(words, { yPercent: 110, rotate: 4 });
          ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () => gsap.to(words, { yPercent: 0, rotate: 0, duration: 1.2, ease: "expo.out", stagger: 0.045 }),
          });
        });

        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const speed = Number(el.dataset.parallax) || 0.15;
          gsap.fromTo(
            el,
            { yPercent: -speed * 100 },
            { yPercent: speed * 100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
      cleanups.push(() => ctx.revert());

      if (fine) {
        document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
          };
          const leave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });

        document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
          let primed = false;
          const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
          const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            if (!primed) {
              gsap.set(el, { transformPerspective: 900 });
              primed = true;
            }
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            ry(px * 10);
            rx(-py * 10);
            el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
            el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });
      }
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      window.clearTimeout(timer);
      cleanups.forEach((c) => c());
    };
  }, [pathname]);

  return null;
}
